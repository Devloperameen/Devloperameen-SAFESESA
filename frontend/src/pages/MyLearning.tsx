
import { Link } from "react-router-dom";
import { Play, Receipt, BookOpen, CheckCircle, Clock, AlertCircle, ShieldAlert } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import AnimatedPage from "@/components/AnimatedPage";
import { getEnrollments } from "@/services/enrollmentService";
import { getMyTransactions } from "@/services/paymentService";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function MyLearning() {
  const {
    data: enrolled = [],
    isLoading: enrollLoading,
    isError: enrollError,
  } = useQuery({
    queryKey: ["enrollments", "list"],
    queryFn: getEnrollments,
  });

  const {
    data: transactions = [],
    isLoading: txnLoading,
  } = useQuery({
    queryKey: ["payments", "transactions"],
    queryFn: getMyTransactions,
  });

  const activeEnrollments = enrolled.filter(item => item.status === "active");
  const pendingEnrollments = enrolled.filter(item => item.status === "pending");
  const rejectedEnrollments = enrolled.filter(item => item.status === "rejected");

  const inProgress = activeEnrollments.filter((item) => item.progress < 100);
  const completed = activeEnrollments.filter((item) => item.progress >= 100);

  return (
    <AnimatedPage>
      <div className="container py-12 lg:py-16 bg-slate-950 min-h-screen">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 bg-primary rounded-full" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Personal Repository</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none">Learning <br /> <span className="text-slate-600 italic">Inventory</span></h1>
          </div>
        </div>

        <Tabs defaultValue="courses" className="space-y-12">
          <TabsList className="bg-slate-900/40 border border-slate-800/60 p-1.5 rounded-2xl h-16 backdrop-blur-xl shadow-2xl">
            <TabsTrigger value="courses" className="rounded-xl px-10 h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase tracking-widest text-[10px]">
              <BookOpen className="mr-3 h-4 w-4" />
              Intelligence Streams
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-xl px-10 h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase tracking-widest text-[10px]">
              <Receipt className="mr-3 h-4 w-4" />
              Financial Ledger
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="focus-visible:ring-0 space-y-16">
            {enrollLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
                {[1, 2, 3].map(i => <div key={i} className="h-80 bg-slate-900/30 rounded-3xl border border-slate-800/50" />)}
              </div>
            ) : enrollError ? (
              <div className="bg-rose-500/5 border border-rose-500/10 text-rose-500 p-12 rounded-[2.5rem] text-center backdrop-blur-sm">
                <ShieldAlert className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-black uppercase tracking-widest text-xs">Synchronization failure in local sector.</p>
              </div>
            ) : enrolled.length === 0 ? (
              <div className="text-center py-32 bg-slate-900/30 border border-slate-800/80 rounded-[3rem] backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 h-64 w-64 bg-primary/5 blur-[100px] rounded-full" />
                <div className="relative z-10 space-y-6">
                  <div className="h-20 w-20 bg-slate-800/50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-slate-700 shadow-inner">
                    <BookOpen className="h-10 w-10 text-slate-400" />
                  </div>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tight">Zero Assets Detected</h3>
                  <p className="text-slate-500 mb-10 max-w-sm mx-auto font-medium">Your personal learning repository is currently empty. Initialize your first stream from the catalog.</p>
                  <Button asChild className="gradient-primary h-14 px-12 rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-105 transition-all">
                    <Link to="/courses">Deploy Knowledge Catalog</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-20">
                {/* PENDING VERIFICATION SECTION */}
                {pendingEnrollments.length > 0 && (
                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 px-3 py-1 font-black uppercase tracking-widest text-[10px]">Verification Ongoing</Badge>
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-amber-500/20 to-transparent" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                      {pendingEnrollments.map(({ course }) => (
                        <motion.div
                          key={course.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <Card className="bg-slate-900/40 border-slate-800/80 backdrop-blur-sm overflow-hidden group border-dashed relative">
                            <div className="aspect-video relative overflow-hidden saturate-0 opacity-40">
                              <img src={course.thumbnail} className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950/40">
                              <Clock className="h-10 w-10 text-amber-500 mb-4 animate-pulse" />
                              <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Manual Review</p>
                              <p className="text-[9px] text-slate-500 font-bold mt-1 uppercase">Checking citation...</p>
                            </div>
                            <CardContent className="p-5 border-t border-slate-800/50">
                              <h3 className="text-slate-400 font-bold text-xs uppercase line-clamp-1">{course.title}</h3>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ACTIVE LEARNING PATHS */}
                {inProgress.length > 0 && (
                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 font-black uppercase tracking-widest text-[10px]">Deployment Active</Badge>
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-primary/20 to-transparent" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                      {inProgress.map(({ course, progress, lastAccessed }) => (
                        <Card key={course.id} className="bg-slate-900/40 border-slate-800/80 backdrop-blur-sm overflow-hidden group hover:border-primary/50 transition-all duration-500 rounded-[2rem] flex flex-col shadow-2xl">
                          <div className="aspect-video relative overflow-hidden">
                            <img src={course.thumbnail} className="w-full h-full object-cover saturate-[0.6] group-hover:saturate-100 transition-all duration-700 group-hover:scale-110" />
                            <Link
                              to={`/learn/${course.id}`}
                              className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-500 backdrop-blur-[2px]"
                            >
                              <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform duration-500 shadow-xl">
                                <Play className="h-6 w-6 text-black fill-current ml-1" />
                              </div>
                            </Link>
                          </div>
                          <CardContent className="p-6 space-y-6 flex-1 flex flex-col">
                            <div className="flex-1">
                              <h3 className="text-white font-black leading-tight text-lg line-clamp-2 group-hover:text-primary transition-colors tracking-tight uppercase">{course.title}</h3>
                              <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-2 font-black uppercase tracking-widest">
                                <Clock className="h-3 w-3 text-primary" />
                                Access: {lastAccessed}
                              </p>
                            </div>
                            <div className="space-y-3 pt-4 border-t border-slate-800/50">
                              <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">
                                <span>Mastery Level</span>
                                <span className="text-primary">{progress}%</span>
                              </div>
                              <Progress value={progress} className="h-1.5 bg-slate-950 shadow-inner rounded-full overflow-hidden" />
                            </div>
                            <Button asChild className="w-full h-12 mt-2 rounded-xl gradient-primary font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/10">
                              <Link to={`/learn/${course.id}`}>Resume Deployment</Link>
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* COMPLETED ASSETS */}
                {completed.length > 0 && (
                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1 font-black uppercase tracking-widest text-[10px]">Synchronized Assets</Badge>
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-emerald-500/20 to-transparent" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                      {completed.map(({ course }) => (
                        <Card key={course.id} className="bg-slate-900/40 border-slate-800/80 backdrop-blur-sm overflow-hidden group border-emerald-500/10 rounded-[2rem]">
                          <div className="aspect-video relative overflow-hidden grayscale-[0.8] group-hover:grayscale-0 transition-all duration-700">
                            <img src={course.thumbnail} className="w-full h-full object-cover" />
                            <div className="absolute top-4 right-4 h-10 w-10 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-slate-950">
                              <CheckCircle className="h-5 w-5 text-white" />
                            </div>
                          </div>
                          <CardContent className="p-6 space-y-4">
                            <h3 className="text-white font-black leading-tight line-clamp-1 uppercase text-sm tracking-tight">{course.title}</h3>
                            <div className="flex justify-between items-center pt-2">
                              <div className="flex flex-col">
                                <span className="text-[8px] font-black text-emerald-500/60 uppercase tracking-widest">Protocol</span>
                                <span className="text-[10px] font-black text-emerald-500 uppercase">FULLY ACQUIRED</span>
                              </div>
                              <Button asChild variant="ghost" size="sm" className="h-10 px-6 rounded-xl border border-slate-800 text-slate-500 hover:text-white hover:bg-slate-800 font-black uppercase text-[10px] tracking-widest">
                                <Link to={`/learn/${course.id}`}>Review</Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* REJECTED ASSETS */}
                {rejectedEnrollments.length > 0 && (
                  <div className="space-y-8 opacity-60">
                    <div className="flex items-center gap-4">
                      <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 px-3 py-1 font-black uppercase tracking-widest text-[10px]">Access Denied</Badge>
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-rose-500/20 to-transparent" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                      {rejectedEnrollments.map(({ course }) => (
                        <Card key={course.id} className="bg-slate-900/20 border-rose-900/20 backdrop-blur-sm overflow-hidden grayscale relative">
                          <CardContent className="p-8 text-center space-y-4">
                            <ShieldAlert className="h-8 w-8 text-rose-500/40 mx-auto" />
                            <h3 className="text-slate-600 font-bold text-xs uppercase line-clamp-1">{course.title}</h3>
                            <p className="text-[9px] font-bold text-rose-500/60 uppercase tracking-widest">Transaction Citation Invalid</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="focus-visible:ring-0">
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-[2.5rem] overflow-hidden backdrop-blur-xl shadow-2xl relative">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-950/80 border-b border-slate-800">
                    <tr>
                      <th className="py-6 px-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Asset Citation</th>
                      <th className="py-6 px-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 text-center">Deployment Date</th>
                      <th className="py-6 px-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 text-center">Status Protocol</th>
                      <th className="py-6 px-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 text-right">Credit Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {txnLoading ? (
                      <tr><td colSpan={4} className="py-32 text-center text-slate-600 font-black uppercase tracking-[0.4em] animate-pulse">Synchronizing Secure Ledger...</td></tr>
                    ) : transactions.length === 0 ? (
                      <tr><td colSpan={4} className="py-32 text-center text-slate-700 font-black uppercase tracking-widest">No verified transaction logs.</td></tr>
                    ) : (
                      transactions.map((txn, idx) => (
                        <motion.tr
                          key={txn.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="hover:bg-slate-800/20 transition-all group"
                        >
                          <td className="py-8 px-10">
                            <div className="flex items-center gap-6">
                              <div className="h-16 w-24 rounded-2xl overflow-hidden border border-slate-800/80 shrink-0 shadow-inner group-hover:border-primary/40 transition-colors">
                                <img src={txn.courseId.thumbnail} className="w-full h-full object-cover grayscale-[0.4] group-hover:grayscale-0 transition-all duration-500" />
                              </div>
                              <div className="space-y-1">
                                <p className="font-black text-white text-sm uppercase tracking-tight group-hover:text-primary transition-colors">{txn.courseId.title}</p>
                                <p className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-tighter">REF: {txn.transactionId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-8 px-10 text-center">
                            <div className="inline-flex items-center gap-2 bg-slate-950/60 px-4 py-2 rounded-xl border border-slate-800/80">
                              <CalendarIcon className="h-3 w-3 text-slate-500" />
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {format(new Date(txn.createdAt), 'MMM dd, yyyy')}
                              </span>
                            </div>
                          </td>
                          <td className="py-8 px-10 text-center">
                            <Badge className={`uppercase font-black text-[9px] tracking-[0.2em] px-3 py-1 rounded-lg ${txn.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                txn.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                  'bg-rose-500/10 text-rose-500 border-rose-500/20'
                              }`}>
                              {txn.status}
                            </Badge>
                          </td>
                          <td className="py-8 px-10 text-right">
                            <div className="flex flex-col items-end">
                              <span className="text-xl font-black text-white">${txn.amount.toFixed(2)}</span>
                              <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">USD Verified</span>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AnimatedPage>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>;
}
