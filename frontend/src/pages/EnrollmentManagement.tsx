
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, UserPlus, Trash2, GraduationCap, Mail, Calendar, BookOpen, MoreVertical, Shield, CheckCircle2, XCircle, Info, Clock, Filter, ChevronRight, Activity } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnimatedPage from "@/components/AnimatedPage";
import { getAdminEnrollments, manualEnrollByAdmin, unenrollByAdmin, getAdminUsers, getModerationCourses, updateEnrollmentStatusByAdmin } from "@/services/adminService";
import { toast } from "sonner";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function EnrollmentManagement() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("");
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("pending");

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
            toast.success("Manual enrollment authorized.");
            setIsAddDialogOpen(false);
            setSelectedUser("");
            setSelectedCourse("");
        },
        onError: (error: any) => {
            toast.error(error.message || "Enrollment failed.");
        }
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string, status: "active" | "rejected" }) =>
            updateEnrollmentStatusByAdmin(id, status),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["admin", "enrollments"] });
            toast.success(`Enrollment ${variables.status === "active" ? "Approved" : "Rejected"}`);
        },
        onError: (error: any) => {
            toast.error(error.message || "Action failed.");
        }
    });

    const unenrollMutation = useMutation({
        mutationFn: unenrollByAdmin,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "enrollments"] });
            toast.success("Access Revoked.");
        },
        onError: (error: any) => {
            toast.error(error.message || "Operation failed.");
        }
    });

    const filteredEnrollments = enrollments?.filter(e => {
        const matchesSearch = e.studentName.toLowerCase().includes(search.toLowerCase()) ||
            e.courseTitle.toLowerCase().includes(search.toLowerCase()) ||
            e.studentEmail.toLowerCase().includes(search.toLowerCase());
        const matchesTab = e.status === activeTab;
        return matchesSearch && matchesTab;
    });

    const pendingCount = enrollments?.filter(e => e.status === "pending").length || 0;

    return (
        <AnimatedPage>
            <div className="space-y-12 p-8 lg:p-12 bg-slate-950 min-h-screen text-slate-200">
                {/* High-Performance Header */}
                <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 border-b border-slate-900 pb-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                <Shield className="h-5 w-5 text-primary" />
                            </div>
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Administrative Nexus</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase leading-none">
                            Identity & <span className="text-slate-600 italic">Access</span>
                        </h1>
                        <p className="text-slate-400 font-medium max-w-xl text-sm leading-relaxed">
                            Enterprise-grade enrollment oversight. Verification of offline payments and manual authorization of instructional content assets.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:block text-right pr-6 border-r border-slate-900">
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Awaiting Verification</p>
                            <p className="text-2xl font-black text-amber-500">{pendingCount}</p>
                        </div>
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="gradient-primary h-14 px-10 rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                                    <UserPlus className="mr-3 h-5 w-5" />
                                    Bypass Enrollment
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-slate-900/90 border-slate-800 text-white sm:max-w-lg backdrop-blur-2xl rounded-[2rem] p-10">
                                <DialogHeader className="space-y-4">
                                    <DialogTitle className="text-3xl font-black uppercase tracking-tight">Manual Provisioning</DialogTitle>
                                    <DialogDescription className="text-slate-500 font-medium">
                                        Grant immediate access permission to a specific identity for selected educational content.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-8 py-10">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Identity Vector</label>
                                        <Select value={selectedUser} onValueChange={setSelectedUser}>
                                            <SelectTrigger className="bg-slate-950/60 border-slate-800 h-14 rounded-2xl focus:border-primary/50 text-xs font-bold uppercase transition-all">
                                                <SelectValue placeholder="LOCATE STUDENT..." />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-slate-800 text-white">
                                                {users?.map(user => (
                                                    <SelectItem key={user.id} value={user.id} className="uppercase font-bold text-[10px]">
                                                        {user.name} // {user.email}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Asset Allocation</label>
                                        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                                            <SelectTrigger className="bg-slate-950/60 border-slate-800 h-14 rounded-2xl focus:border-primary/50 text-xs font-bold uppercase transition-all">
                                                <SelectValue placeholder="LOCATE COURSE..." />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-slate-800 text-white">
                                                {courses?.map(course => (
                                                    <SelectItem key={course.id} value={course.id} className="uppercase font-bold text-[10px]">
                                                        {course.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        onClick={() => enrollMutation.mutate()}
                                        className="w-full gradient-primary h-16 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                                        disabled={!selectedUser || !selectedCourse || enrollMutation.isPending}
                                    >
                                        {enrollMutation.isPending ? "AUTHORIZING..." : "CONFIRM ACCESS"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { label: "Total Enrollments", value: enrollments?.length || 0, trend: "+12.4%", color: "primary" },
                        { label: "Authorized Assets", value: enrollments?.filter(e => e.status === "active").length || 0, trend: "Stable", color: "emerald-500" },
                        { label: "System Integrity", value: "Locked", trend: "AES-256 Active", color: "slate-500" }
                    ].map((stat, i) => (
                        <Card key={i} className="bg-slate-900/40 border-slate-800/80 backdrop-blur-md rounded-[2rem] overflow-hidden relative">
                            <div className={`absolute top-0 right-0 h-1 w-1/3 bg-${stat.color}`} />
                            <CardHeader className="pb-2 px-8 pt-8">
                                <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{stat.label}</CardTitle>
                            </CardHeader>
                            <CardContent className="px-8 pb-8">
                                <div className="text-4xl font-black text-white">{stat.value}</div>
                                <p className={`text-[10px] font-black mt-2 uppercase tracking-widest ${stat.color === 'emerald-500' ? 'text-emerald-500' : 'text-primary'}`}>
                                    {stat.trend}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/30 p-4 rounded-3xl border border-slate-800/60 lg:px-6">
                        <TabsList className="bg-slate-950/50 p-1.5 rounded-2xl border border-slate-800">
                            <TabsTrigger value="pending" className="rounded-xl px-8 py-3 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                                Pending Requests {pendingCount > 0 && <span className="ml-2 bg-white/20 px-2 rounded-full">{pendingCount}</span>}
                            </TabsTrigger>
                            <TabsTrigger value="active" className="rounded-xl px-8 py-3 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">
                                Active Enrollments
                            </TabsTrigger>
                            <TabsTrigger value="rejected" className="rounded-xl px-8 py-3 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-rose-500 data-[state=active]:text-white">
                                Rejected
                            </TabsTrigger>
                        </TabsList>

                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                            <Input
                                placeholder="IDENTIFY RECORD BY STUDENT OR ASSET..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-12 bg-slate-950/60 border-slate-800 focus:border-primary/50 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest placeholder:text-slate-800"
                            />
                        </div>
                    </div>

                    <div className="bg-slate-900/30 border border-slate-800/80 rounded-[2.5rem] overflow-hidden backdrop-blur-md shadow-2xl relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                        <Table>
                            <TableHeader className="bg-slate-950/80 border-b border-slate-800">
                                <TableRow className="border-none hover:bg-transparent">
                                    <TableHead className="text-[10px] font-black text-slate-500 uppercase tracking-widest py-6 px-8">Identity</TableHead>
                                    <TableHead className="text-[10px] font-black text-slate-500 uppercase tracking-widest py-6 px-8">Course Asset</TableHead>
                                    <TableHead className="text-[10px] font-black text-slate-500 uppercase tracking-widest py-6 px-8">Ciation / Status</TableHead>
                                    <TableHead className="text-[10px] font-black text-slate-500 uppercase tracking-widest py-6 px-8 text-right">Protocol</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-96 text-center">
                                            <div className="flex flex-col items-center gap-4 text-slate-600">
                                                <Activity className="h-12 w-12 animate-pulse text-primary" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Synchronizing Archive...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredEnrollments?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-64 text-center">
                                            <div className="space-y-4">
                                                <Filter className="h-10 w-10 text-slate-800 mx-auto" />
                                                <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">No matching records found in this vector.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    <AnimatePresence>
                                        {filteredEnrollments?.map((enrollment, idx) => (
                                            <motion.tr
                                                key={enrollment.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-all group"
                                            >
                                                <TableCell className="py-8 px-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center relative shadow-inner group-hover:border-primary/50 transition-colors">
                                                            <GraduationCap className="h-5 w-5 text-primary" />
                                                            <div className="absolute -top-1 -right-1 h-3 w-3 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse" />
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-white uppercase text-xs tracking-tight">{enrollment.studentName}</p>
                                                            <p className="text-[10px] text-slate-500 font-bold mt-0.5">{enrollment.studentEmail}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-8 px-8">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <BookOpen className="h-3 w-3 text-primary/60" />
                                                            <p className="font-bold text-slate-300 text-sm">{enrollment.courseTitle}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <Calendar className="h-3 w-3 text-slate-600" />
                                                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                                                                {format(new Date(enrollment.enrolledAt), 'MMM dd, yyyy')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-8 px-8">
                                                    <div className="space-y-2">
                                                        {enrollment.status === "pending" ? (
                                                            <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-xl inline-flex items-center gap-4">
                                                                <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                                                                    <Info className="h-4 w-4" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">SUBMITTED REF</p>
                                                                    <p className="text-xs font-mono font-black text-amber-500">{enrollment.paymentReference || "N/A"}</p>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <Badge className={cn(
                                                                "uppercase font-black text-[9px] tracking-widest px-3 py-1",
                                                                enrollment.status === "active" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                                            )}>
                                                                {enrollment.status}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-8 px-8 text-right">
                                                    {enrollment.status === "pending" ? (
                                                        <div className="flex items-center justify-end gap-3">
                                                            <Button
                                                                size="sm"
                                                                onClick={() => statusMutation.mutate({ id: enrollment.id, status: "active" })}
                                                                className="h-10 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase text-[10px] px-6 rounded-xl shadow-lg shadow-emerald-500/20"
                                                            >
                                                                APPROVE
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => statusMutation.mutate({ id: enrollment.id, status: "rejected" })}
                                                                className="h-10 border-slate-800 text-rose-500 hover:bg-rose-500/10 font-black uppercase text-[10px] px-6 rounded-xl"
                                                            >
                                                                REJECT
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-10 w-10 p-0 text-slate-600 hover:text-white hover:bg-slate-800 rounded-xl">
                                                                    <MoreVertical className="h-5 w-5" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="bg-slate-950 border-slate-800 text-white p-2 rounded-2xl min-w-[200px]">
                                                                <DropdownMenuItem
                                                                    onClick={() => unenrollMutation.mutate(enrollment.id)}
                                                                    className="text-rose-400 focus:text-rose-400 focus:bg-rose-400/10 gap-3 px-4 py-3 rounded-xl font-bold text-xs cursor-pointer"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                    REVOKE ACCESS
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    )}
                                                </TableCell>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Tabs>
            </div>
        </AnimatedPage>
    );
}

function cn(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
}
