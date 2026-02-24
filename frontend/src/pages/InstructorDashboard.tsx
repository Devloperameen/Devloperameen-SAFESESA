
import { Users, BookOpen, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Activity, Percent } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import StatsCard from "@/components/StatsCard";
import AnimatedPage from "@/components/AnimatedPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getInstructorRevenue, getInstructorStats } from "@/services/courseService";
import { Badge } from "@/components/ui/badge";

function formatCurrency(value: number): string {
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default function InstructorDashboard() {
  const {
    data: stats,
    isLoading: statsLoading,
  } = useQuery({
    queryKey: ["instructor", "stats"],
    queryFn: () => getInstructorStats(),
  });

  const {
    data: revenueData,
    isLoading: revenueLoading,
  } = useQuery({
    queryKey: ["instructor", "revenue"],
    queryFn: () => getInstructorRevenue(),
  });

  const thisMonth = revenueData?.summary.thisMonth || 0;
  const lastMonth = revenueData?.summary.lastMonth || 0;
  const monthChangePercent =
    lastMonth > 0 ? (((thisMonth - lastMonth) / lastMonth) * 100).toFixed(1) : "0";
  const isPositive = !monthChangePercent.startsWith("-");

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-2xl backdrop-blur-md">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{label}</p>
          <p className="text-xl font-black text-white">{formatCurrency(payload[0].value)}</p>
          <p className="text-[10px] text-primary font-bold uppercase mt-1">{payload[1]?.value || 0} Enrollments</p>
        </div>
      );
    }
    return null;
  };

  return (
    <AnimatedPage>
      <div className="container py-12 lg:py-16 bg-slate-950 min-h-screen">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase leading-none">
              Instructor Console
            </h1>
            <p className="text-slate-500 mt-4 max-w-lg font-medium">
              Enterprise-grade analytics for your educational content performance and financial growth.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-2xl border border-slate-800 backdrop-blur-sm">
            <div className="px-4 py-2">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Growth</p>
              <div className="flex items-center gap-2">
                <span className={`text-xl font-black ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {isPositive ? '+' : ''}{monthChangePercent}%
                </span>
                {isPositive ? <ArrowUpRight className="h-5 w-5 text-emerald-500" /> : <ArrowDownRight className="h-5 w-5 text-rose-500" />}
              </div>
            </div>
            <div className="h-10 w-[1px] bg-slate-800" />
            <div className="px-4 py-2">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</p>
              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 uppercase font-black px-3 py-1">Online</Badge>
            </div>
          </div>
        </div>

        {statsLoading || revenueLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-900/50 rounded-2xl border border-slate-800" />)}
          </div>
        ) : (
          <div className="space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard title="Global Students" value={stats?.totalStudents.toLocaleString() || "0"} icon={Users} />
              <StatsCard title="Content Assets" value={stats?.totalCourses.toLocaleString() || "0"} icon={BookOpen} />
              <StatsCard title="Total Revenue" value={formatCurrency(stats?.totalEarnings || 0)} icon={DollarSign} />
              <StatsCard title="Course Authority" value={stats?.avgRating || "0.0"} icon={TrendingUp} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <Card className="lg:col-span-8 bg-slate-900/40 border-slate-800/80 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden">
                <CardHeader className="p-8 border-b border-slate-800/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-black text-white uppercase tracking-tight">Revenue Dynamics</CardTitle>
                      <CardDescription className="text-slate-500 font-medium">Monthly earnings performance over the last cycle.</CardDescription>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Activity className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="h-[400px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData?.monthly}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis
                          dataKey="month"
                          stroke="#64748b"
                          fontSize={10}
                          fontWeight={700}
                          tickLine={false}
                          axisLine={false}
                          dy={10}
                        />
                        <YAxis
                          stroke="#64748b"
                          fontSize={10}
                          fontWeight={700}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) => `$${v / 1000}k`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="earnings"
                          stroke="#2563eb"
                          strokeWidth={4}
                          fillOpacity={1}
                          fill="url(#colorRevenue)"
                          animationDuration={2000}
                        />
                        <Area
                          type="monotone"
                          dataKey="enrollments"
                          stroke="transparent"
                          fill="transparent"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-4 bg-slate-900/40 border-slate-800/80 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden flex flex-col">
                <CardHeader className="p-8 border-b border-slate-800/50">
                  <CardTitle className="text-xl font-black text-white uppercase tracking-tight">Student Retention</CardTitle>
                  <CardDescription className="text-slate-500 font-medium">Engagement rate vs total seats.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 flex-1 flex flex-col justify-between">
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueData?.monthly.slice(-6)}>
                        <Bar dataKey="enrollments" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={20} />
                        <XAxis dataKey="month" hide />
                        <Tooltip
                          cursor={{ fill: '#1e293b', opacity: 0.4 }}
                          content={({ active, payload }) => {
                            if (active && payload?.length) {
                              return <div className="bg-slate-950 p-2 rounded border border-slate-800 text-[10px] font-bold text-white uppercase">{payload[0].value} Enrolled</div>
                            }
                            return null;
                          }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="pt-8 space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-950/60 rounded-2xl border border-slate-800/60">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                          <Percent className="h-4 w-4 text-emerald-500" />
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conversion</span>
                      </div>
                      <span className="text-lg font-black text-white">24.8%</span>
                    </div>
                    <Button variant="outline" className="w-full h-12 rounded-xl border-slate-800 bg-slate-950/50 hover:bg-slate-900 transition-all font-bold text-slate-400">
                      View Detailed Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AnimatedPage>
  );
}
