import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AnimatedPage from "@/components/AnimatedPage";
import {
  createCategory,
  deleteCategoryById,
  getCategories,
  updateCategoryById,
} from "@/services/categoryService";
import type { Category } from "@/types/models";
import { toast } from "sonner";

export default function CategoryManagement() {
  const queryClient = useQueryClient();
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addDescription, setAddDescription] = useState("");

  const {
    data: categories = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["categories", "all"],
    queryFn: () => getCategories("all"),
  });

  const createMutation = useMutation({
    mutationFn: (payload: { name: string; description?: string }) => createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category added");
      setAddName("");
      setAddDescription("");
      setAddOpen(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to add category");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name: string; description?: string } }) =>
      updateCategoryById(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category updated");
      setEditCat(null);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to update category");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategoryById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to delete category");
    },
  });

  const handleAdd = () => {
    const name = addName.trim();
    if (!name) return;
    createMutation.mutate({
      name,
      description: addDescription.trim() || undefined,
    });
  };

  const handleEdit = () => {
    if (!editCat) return;
    const name = newName.trim();
    if (!name) return;

    updateMutation.mutate({
      id: editCat.id,
      payload: {
        name,
        description: newDescription.trim() || undefined,
      },
    });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Categories</h1>
            <p className="text-muted-foreground mt-1">Manage course categories</p>
          </div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary border-0 text-primary-foreground gap-2">
                <Plus className="h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Category</DialogTitle></DialogHeader>
              <div className="space-y-3 py-2">
                <div className="space-y-2">
                  <Label>Category Name</Label>
                  <Input value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="e.g., Machine Learning" />
                </div>
                <div className="space-y-2">
                  <Label>Description (Optional)</Label>
                  <Textarea
                    value={addDescription}
                    onChange={(e) => setAddDescription(e.target.value)}
                    placeholder="Short description of this category"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button onClick={handleAdd} disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Adding..." : "Add"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            Loading categories...
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            Unable to load categories.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Card key={cat.id} className="shadow-card">
                <CardContent className="p-5 flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <p className="font-semibold">{cat.name}</p>
                    <p className="text-sm text-muted-foreground">{cat.courseCount} courses</p>
                    {cat.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{cat.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setEditCat(cat);
                        setNewName(cat.name);
                        setNewDescription(cat.description || "");
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(cat.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={Boolean(editCat)} onOpenChange={(open) => !open && setEditCat(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Category</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-2">
                <Label>Category Name</Label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditCat(null)}>Cancel</Button>
              <Button onClick={handleEdit} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AnimatedPage>
  );
}
