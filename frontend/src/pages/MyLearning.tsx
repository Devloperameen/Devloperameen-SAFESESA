
import { Link } from "react-router-dom";
import { Play, Receipt, BookOpen, CheckCircle, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import AnimatedPage from "@/components/AnimatedPage";
import { getEnrollments } from "@/services/enrollmentService";
import { getMyTransactions } from "@/services/paymentService";
import { format } from "date-fns";

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

  const inProgress = enrolled.filter((item) => item.progress < 100);
  const completed = enrolled.filter((item) => item.progress >= 100);

  return (
    <AnimatedPage>
      <div className="container py-12 lg:py-16 bg-slate-950 min-h-screen">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase">My Learning</h1>
            <p className="text-slate-500 mt-2 font-medium tracking-wide">
              {inProgress.length} ACTIVE PATHS • {completed.length} ACHIEVEMENTS
            </p>
          </div>
        </div>

        <Tabs defaultValue="courses" className="space-y-10">
          <TabsList className="bg-slate-900/50 border border-slate-800 p-1 rounded-2xl h-14 backdrop-blur-md">
            <TabsTrigger value="courses" className="rounded-xl px-8 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold">
              <BookOpen className="mr-2 h-4 w-4" />
              Learning Paths
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-xl px-8 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold">
              <Receipt className="mr-2 h-4 w-4" />
              Purchase History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="focus-visible:ring-0">
            {enrollLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-900/50 rounded-2xl border border-slate-800" />)}
              </div>
            ) : enrollError ? (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive p-8 rounded-2xl text-center">
                Critical error synchronization your learning data. Please refresh.
              </div>
            ) : enrolled.length === 0 ? (
              <div className="text-center py-24 bg-slate-900/30 border border-slate-800 rounded-3xl">
                <div className="h-16 w-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
                  <BookOpen className="h-8 w-8 text-slate-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Courses Enrolled</h3>
                <p className="text-slate-500 mb-8 max-w-sm mx-auto">Start your journey today by exploring our premium course catalog.</p>
                <Button asChild className="gradient-primary h-12 px-8 rounded-xl font-bold">
                  <Link to="/courses">Explore Catalog</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-12">
                {inProgress.length > 0 && (
                  <div className="space-y-6">
                    <h2 className="text-xs font-black text-primary uppercase tracking-[0.2em]">In Progress</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {inProgress.map(({ course, progress, lastAccessed }) => (
                        <Card key={course.id} className="bg-slate-900/40 border-slate-800/80 backdrop-blur-sm overflow-hidden group hover:border-primary/50 transition-all duration-300">
                          <div className="aspect-video relative overflow-hidden">
                            <img src={course.thumbnail} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105" />
                            <Link
                              to={`/learn/${course.id}`}
                              className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
                            >
                              <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center translate-y-4 group-hover:translate-y-0 transition-transform">
                                <Play className="h-5 w-5 text-black fill-current ml-1" />
                              </div>
                            </Link>
                          </div>
                          <CardContent className="p-5 space-y-4">
                            <div>
                              <h3 className="text-white font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors">{course.title}</h3>
                              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
                                <Clock className="h-3 w-3" />
                                Last: {lastAccessed}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                                <span>Progress</span>
                                <span className="text-primary">{progress}%</span>
                              </div>
                              <Progress value={progress} className="h-1 bg-slate-800 overflow-hidden" />
                            </div>
                            <Button asChild variant="outline" size="sm" className="w-full rounded-xl border-slate-700 bg-slate-950/50 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all font-bold">
                              <Link to={`/learn/${course.id}`}>Continue Learning</Link>
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {completed.length > 0 && (
                  <div className="space-y-6">
                    <h2 className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em]">Completed</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {completed.map(({ course, lastAccessed }) => (
                        <Card key={course.id} className="bg-slate-900/40 border-slate-800/80 backdrop-blur-sm overflow-hidden group border-emerald-500/20">
                          <div className="aspect-video relative overflow-hidden">
                            <img src={course.thumbnail} className="w-full h-full object-cover" />
                            <div className="absolute top-3 right-3 h-8 w-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg border-2 border-slate-950">
                              <CheckCircle className="h-4 w-4 text-white" />
                            </div>
                          </div>
                          <CardContent className="p-5 space-y-4">
                            <h3 className="text-white font-bold leading-tight line-clamp-2">{course.title}</h3>
                            <div className="flex justify-between items-center pt-2">
                              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] uppercase font-black px-2">Completed</Badge>
                              <Button asChild variant="ghost" size="sm" className="h-8 text-slate-500 hover:text-white">
                                <Link to={`/learn/${course.id}`}>Review</Link>
                              </Button>
                            </div>
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
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-sm">
              <Table className="hidden md:table">
                <thead className="bg-slate-950/80 border-b border-slate-800">
                  <tr>
                    <th className="text-left py-5 px-8 text-xs font-black uppercase tracking-widest text-slate-500">Product</th>
                    <th className="text-center py-5 px-8 text-xs font-black uppercase tracking-widest text-slate-500">Date</th>
                    <th className="text-center py-5 px-8 text-xs font-black uppercase tracking-widest text-slate-500">Status</th>
                    <th className="text-right py-5 px-8 text-xs font-black uppercase tracking-widest text-slate-500">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {txnLoading ? (
                    <tr><td colSpan={4} className="py-20 text-center text-slate-500 animate-pulse">Loading secure ledger...</td></tr>
                  ) : transactions.length === 0 ? (
                    <tr><td colSpan={4} className="py-20 text-center text-slate-500">No transaction records found.</td></tr>
                  ) : (
                    transactions.map((txn) => (
                      <tr key={txn.id} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/10 transition-colors">
                        <td className="py-6 px-8">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-16 rounded-lg overflow-hidden border border-slate-800 shrink-0">
                              <img src={txn.courseId.thumbnail} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="font-bold text-white text-sm line-clamp-1">{txn.courseId.title}</p>
                              <p className="text-[10px] font-mono text-slate-600 mt-1 uppercase">ID: {txn.transactionId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-6 px-8 text-center text-sm text-slate-400 font-medium">
                          {format(new Date(txn.createdAt), 'MMM dd, yyyy')}
                        </td>
                        <td className="py-6 px-8 text-center">
                          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] uppercase font-black px-2">
                            {txn.status}
                          </Badge>
                        </td>
                        <td className="py-6 px-8 text-right font-black text-white">
                          ${txn.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>

              {/* Mobile View */}
              <div className="md:hidden divide-y divide-slate-800">
                {transactions.map((txn) => (
                  <div key={txn.id} className="p-6 space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-bold text-white text-sm leading-tight">{txn.courseId.title}</h3>
                      <span className="font-black text-white shrink-0">${txn.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">{format(new Date(txn.createdAt), 'MMM dd, yyyy')}</span>
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-black px-2 uppercase text-[10px]">
                        {txn.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AnimatedPage>
  );
}

// Minimal placeholder Table components to avoid breakage if ui/table isn't used elsewhere
function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return <table className={`w-full ${className}`}>{children}</table>;
}
