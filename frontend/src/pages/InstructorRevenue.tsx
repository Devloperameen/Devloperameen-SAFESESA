import { DollarSign, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import StatsCard from "@/components/StatsCard";
import AnimatedPage from "@/components/AnimatedPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getInstructorRevenue } from "@/services/courseService";

function formatCurrency(value: number): string {
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default function InstructorRevenue() {
  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["instructor", "revenue"],
    queryFn: () => getInstructorRevenue(),
  });

  const thisMonth = data?.summary.thisMonth || 0;
  const lastMonth = data?.summary.lastMonth || 0;
  const lifetime = data?.summary.lifetime || 0;
  const monthly = data?.monthly || [];
  const monthChange =
    lastMonth > 0 ? `${(((thisMonth - lastMonth) / lastMonth) * 100).toFixed(1)}%` : undefined;
  const monthTrend = monthChange ? (monthChange.startsWith("-") ? "down" : "up") : undefined;

  return (
    <AnimatedPage>
      <div className="container py-8">
        <h1 className="font-display text-3xl font-bold mb-2">Revenue</h1>
        <p className="text-muted-foreground mb-8">Track your earnings and payouts</p>

        {isLoading ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground mb-8">
            Loading revenue analytics...
          </div>
        ) : isError || !data ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground mb-8">
            Unable to load revenue analytics.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <StatsCard
                title="This Month"
                value={formatCurrency(thisMonth)}
                change={monthChange}
                trend={monthTrend}
                icon={DollarSign}
              />
              <StatsCard title="Last Month" value={formatCurrency(lastMonth)} icon={DollarSign} />
              <StatsCard title="Lifetime" value={formatCurrency(lifetime)} icon={TrendingUp} />
            </div>

            <Card className="shadow-card mb-6">
              <CardHeader><CardTitle className="font-display text-lg">Earnings Over Time</CardTitle></CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthly}>
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

            <Card className="shadow-card">
              <CardHeader><CardTitle className="font-display text-lg">Monthly Breakdown</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {monthly.map((item) => (
                    <div key={item.month} className="flex items-center justify-between rounded-lg border border-border/70 px-4 py-3">
                      <div>
                        <p className="font-medium">{item.month}</p>
                        <p className="text-xs text-muted-foreground">{item.enrollments} enrollments</p>
                      </div>
                      <p className="font-semibold">{formatCurrency(item.earnings)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AnimatedPage>
  );
}
