import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import AnimatedPage from "@/components/AnimatedPage";
import { categories as initialCategories, Category } from "@/data/mockData";
import { toast } from "sonner";

export default function CategoryManagement() {
  const [cats, setCats] = useState<Category[]>(initialCategories);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [newName, setNewName] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState("");

  const handleAdd = () => {
    if (!addName.trim()) return;
    setCats([...cats, { id: `c${Date.now()}`, name: addName, slug: addName.toLowerCase().replace(/\s+/g, "-"), courseCount: 0 }]);
    setAddName("");
    setAddOpen(false);
    toast.success("Category added");
  };

  const handleEdit = () => {
    if (!editCat || !newName.trim()) return;
    setCats(cats.map((c) => c.id === editCat.id ? { ...c, name: newName } : c));
    setEditCat(null);
    toast.success("Category updated");
  };

  const handleDelete = (id: string) => {
    setCats(cats.filter((c) => c.id !== id));
    toast.success("Category deleted");
  };

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Categories</h1>
            <p className="text-muted-foreground mt-1">Manage course categories</p>
          </div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary border-0 text-primary-foreground gap-2"><Plus className="h-4 w-4" /> Add Category</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Category</DialogTitle></DialogHeader>
              <div className="space-y-2 py-2">
                <Label>Category Name</Label>
                <Input value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="e.g., Machine Learning" />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button onClick={handleAdd}>Add</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cats.map((cat) => (
            <Card key={cat.id} className="shadow-card">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{cat.name}</p>
                  <p className="text-sm text-muted-foreground">{cat.courseCount} courses</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditCat(cat); setNewName(cat.name); }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(cat.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={!!editCat} onOpenChange={(open) => !open && setEditCat(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Category</DialogTitle></DialogHeader>
            <div className="space-y-2 py-2">
              <Label>Category Name</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditCat(null)}>Cancel</Button>
              <Button onClick={handleEdit}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AnimatedPage>
  );
}
