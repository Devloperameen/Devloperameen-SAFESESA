import { Users, BookOpen, DollarSign, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import StatsCard from "@/components/StatsCard";
import AnimatedPage from "@/components/AnimatedPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { instructorRevenue } from "@/data/mockData";

export default function InstructorDashboard() {
  return (
    <AnimatedPage>
      <div className="container py-8">
        <h1 className="font-display text-3xl font-bold mb-2">Instructor Dashboard</h1>
        <p className="text-muted-foreground mb-8">Welcome back! Here's your performance overview.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard title="Total Students" value="27,800" change="+12.5%" trend="up" icon={Users} />
          <StatsCard title="Active Courses" value="5" change="+1" trend="up" icon={BookOpen} />
          <StatsCard title="Total Earnings" value="$37,200" change="+18.3%" trend="up" icon={DollarSign} />
          <StatsCard title="Avg. Rating" value="4.8" change="+0.2" trend="up" icon={TrendingUp} />
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-lg">Revenue Overview</CardTitle>
          </CardHeader>
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
