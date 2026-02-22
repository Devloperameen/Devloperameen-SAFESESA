import { DollarSign, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import StatsCard from "@/components/StatsCard";
import AnimatedPage from "@/components/AnimatedPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { instructorRevenue } from "@/data/mockData";

export default function InstructorRevenue() {
  return (
    <AnimatedPage>
      <div className="container py-8">
        <h1 className="font-display text-3xl font-bold mb-2">Revenue</h1>
        <p className="text-muted-foreground mb-8">Track your earnings and payouts</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <StatsCard title="This Month" value="$8,400" change="+29.2%" trend="up" icon={DollarSign} />
          <StatsCard title="Last Month" value="$6,500" icon={DollarSign} />
          <StatsCard title="Lifetime" value="$37,200" change="+18.3%" trend="up" icon={TrendingUp} />
        </div>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="font-display text-lg">Earnings Over Time</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={instructorRevenue}>
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
      </div>
    </AnimatedPage>
  );
}
