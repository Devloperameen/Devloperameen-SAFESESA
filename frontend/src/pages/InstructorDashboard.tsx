import { Users, BookOpen, DollarSign, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import StatsCard from "@/components/StatsCard";
import AnimatedPage from "@/components/AnimatedPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getInstructorRevenue, getInstructorStats } from "@/services/courseService";

function formatCurrency(value: number): string {
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default function InstructorDashboard() {
  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
  } = useQuery({
    queryKey: ["instructor", "stats"],
    queryFn: () => getInstructorStats(),
  });

  const {
    data: revenueData,
    isLoading: revenueLoading,
    isError: revenueError,
  } = useQuery({
    queryKey: ["instructor", "revenue"],
    queryFn: () => getInstructorRevenue(),
  });

  const thisMonth = revenueData?.summary.thisMonth || 0;
  const lastMonth = revenueData?.summary.lastMonth || 0;
  const monthChangePercent =
    lastMonth > 0 ? `${(((thisMonth - lastMonth) / lastMonth) * 100).toFixed(1)}%` : undefined;
  const monthTrend = monthChangePercent
    ? monthChangePercent.startsWith("-")
      ? "down"
      : "up"
    : undefined;

  return (
    <AnimatedPage>
      <div className="container py-8">
        <h1 className="font-display text-3xl font-bold mb-2">Instructor Dashboard</h1>
        <p className="text-muted-foreground mb-8">Welcome back! Here's your performance overview.</p>

        {statsLoading || revenueLoading ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground mb-8">
            Loading instructor analytics...
          </div>
        ) : statsError || revenueError || !stats || !revenueData ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground mb-8">
            Unable to load instructor analytics.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard title="Total Students" value={stats.totalStudents.toLocaleString()} icon={Users} />
              <StatsCard title="Active Courses" value={stats.totalCourses.toLocaleString()} icon={BookOpen} />
              <StatsCard
                title="Total Earnings"
                value={formatCurrency(stats.totalEarnings)}
                change={monthChangePercent}
                trend={monthTrend}
                icon={DollarSign}
              />
              <StatsCard title="Avg. Rating" value={stats.avgRating} icon={TrendingUp} />
            </div>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-display text-lg">Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData.monthly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 90%)" />
                      <XAxis dataKey="month" stroke="hsl(220 10% 46%)" fontSize={12} />
                      <YAxis stroke="hsl(220 10% 46%)" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
                      <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Earnings"]} />
                      <Line type="monotone" dataKey="earnings" stroke="hsl(235 72% 55%)" strokeWidth={2.5} dot={{ fill: "hsl(235 72% 55%)", r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AnimatedPage>
  );
}
