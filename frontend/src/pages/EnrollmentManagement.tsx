
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, UserPlus, Trash2, GraduationCap, Mail, Calendar, BookOpen, MoreVertical, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AnimatedPage from "@/components/AnimatedPage";
import { getAdminEnrollments, manualEnrollByAdmin, unenrollByAdmin, getAdminUsers, getModerationCourses } from "@/services/adminService";
import { toast } from "sonner";
import { format } from "date-fns";

export default function EnrollmentManagement() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("");
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const { data: enrollments, isLoading } = useQuery({
        queryKey: ["admin", "enrollments"],
        queryFn: getAdminEnrollments,
    });

    const { data: users } = useQuery({
        queryKey: ["admin", "users", "student-list"],
        queryFn: () => getAdminUsers({ role: "student", limit: 100 }),
        enabled: isAddDialogOpen,
    });

    const { data: courses } = useQuery({
        queryKey: ["admin", "courses", "published-list"],
        queryFn: () => getModerationCourses({ status: "published", limit: 100 }),
        enabled: isAddDialogOpen,
    });

    const enrollMutation = useMutation({
        mutationFn: () => manualEnrollByAdmin(selectedUser, selectedCourse),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "enrollments"] });
            toast.success("Student enrolled successfully");
            setIsAddDialogOpen(false);
            setSelectedUser("");
            setSelectedCourse("");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to enroll student");
        }
    });

    const unenrollMutation = useMutation({
        mutationFn: unenrollByAdmin,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "enrollments"] });
            toast.success("Student unenrolled");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to unenroll student");
        }
    });

    const filteredEnrollments = enrollments?.filter(e =>
        e.studentName.toLowerCase().includes(search.toLowerCase()) ||
        e.courseTitle.toLowerCase().includes(search.toLowerCase()) ||
        e.studentEmail.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AnimatedPage>
            <div className="space-y-8 p-6 lg:p-8 bg-slate-950 min-h-screen text-slate-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            Enrollment Management
                        </h1>
                        <p className="text-slate-400 mt-2 flex items-center gap-2">
                            <Shield className="h-4 w-4 text-primary" />
                            Manage student access and platform course permissions.
                        </p>
                    </div>

                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gradient-primary shadow-lg shadow-primary/20 rounded-xl px-6 h-12 font-bold hover:scale-105 transition-all">
                                <UserPlus className="mr-2 h-5 w-5" />
                                Manual Enrollment
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold">New Enrollment</DialogTitle>
                                <DialogDescription className="text-slate-400">
                                    Select a student and a course to manually grant access.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-5 py-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-300">Select Student</label>
                                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                                        <SelectTrigger className="bg-slate-950 border-slate-700 h-12 rounded-xl">
                                            <SelectValue placeholder="Search students..." />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-slate-700 text-white">
                                            {users?.map(user => (
                                                <SelectItem key={user.id} value={user.id}>
                                                    {user.name} ({user.email})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-300">Select Course</label>
                                    <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                                        <SelectTrigger className="bg-slate-950 border-slate-700 h-12 rounded-xl">
                                            <SelectValue placeholder="Search courses..." />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-slate-700 text-white">
                                            {courses?.map(course => (
                                                <SelectItem key={course.id} value={course.id}>
                                                    {course.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)} className="text-slate-400 hover:text-white">Cancel</Button>
                                <Button
                                    onClick={() => enrollMutation.mutate()}
                                    className="gradient-primary h-12 px-8 rounded-xl font-bold"
                                    disabled={!selectedUser || !selectedCourse || enrollMutation.isPending}
                                >
                                    {enrollMutation.isPending ? "Enrolling..." : "Confirm Enrollment"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-md">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">Total Enrollments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">{enrollments?.length || 0}</div>
                            <p className="text-xs text-emerald-500 mt-1">+12% from last month</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-md">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">Active Students</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">{new Set(enrollments?.map(e => e.studentId)).size}</div>
                            <p className="text-xs text-primary mt-1">Platform wide</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-md">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">Revenue Protection</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">Active</div>
                            <p className="text-xs text-slate-500 mt-1">Secure access control</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-4 flex-wrap">
                        <div className="relative flex-1 min-w-[300px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                            <Input
                                placeholder="Search by student or course..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-12 bg-slate-950/50 border-slate-700 focus:border-primary h-12 rounded-xl text-white"
                            />
                        </div>
                    </div>

                    <Table>
                        <TableHeader className="bg-slate-950/50">
                            <TableRow className="border-slate-800 hover:bg-transparent">
                                <TableHead className="text-slate-400 font-bold py-5">Student (Role)</TableHead>
                                <TableHead className="text-slate-400 font-bold py-5">Course</TableHead>
                                <TableHead className="text-slate-400 font-bold py-5 text-center">Date</TableHead>
                                <TableHead className="text-slate-400 font-bold py-5 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-64 text-center">
                                        <div className="flex flex-col items-center gap-2 text-slate-500">
                                            <BookOpen className="h-10 w-10 animate-pulse" />
                                            Loading platform data...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredEnrollments?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-64 text-center text-slate-500">
                                        No enrollments found for this search.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredEnrollments?.map((enrollment) => (
                                    <TableRow key={enrollment.id} className="border-slate-800 hover:bg-slate-800/20 transition-colors group">
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 group-hover:border-primary/50 transition-colors">
                                                    <GraduationCap className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white group-hover:text-primary transition-colors">{enrollment.studentName}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-xs text-slate-500 flex items-center gap-1">
                                                            <Mail className="h-3 w-3" />
                                                            {enrollment.studentEmail}
                                                        </span>
                                                        <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-slate-700 text-slate-400 capitalize bg-slate-800/50">
                                                            {enrollment.studentRole}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 font-medium text-slate-300">
                                            {enrollment.courseTitle}
                                        </TableCell>
                                        <TableCell className="py-4 text-center">
                                            <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-mono bg-slate-950/50 px-2.5 py-1 rounded-full border border-slate-800">
                                                <Calendar className="h-3 w-3" />
                                                {enrollment.enrolledAt ? format(new Date(enrollment.enrolledAt), 'MMM dd, yyyy') : "N/A"}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0 text-slate-500 hover:text-white hover:bg-slate-800">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-white">
                                                    <DropdownMenuItem
                                                        onClick={() => unenrollMutation.mutate(enrollment.id)}
                                                        className="text-red-400 focus:text-red-400 focus:bg-red-400/10 gap-2 cursor-pointer"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        Revoke Enrollment
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AnimatedPage>
    );
}
