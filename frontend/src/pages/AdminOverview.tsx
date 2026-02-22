import { DollarSign, Users, BookOpen, TrendingUp, UserPlus, Star, FileCheck } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import StatsCard from "@/components/StatsCard";
import AnimatedPage from "@/components/AnimatedPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { revenueData, categoryPerformance, activities } from "@/data/mockData";

const typeIcons: Record<string, typeof UserPlus> = { signup: UserPlus, enrollment: TrendingUp, publish: FileCheck, review: Star };
const typeBadge: Record<string, string> = { signup: "bg-primary/10 text-primary", enrollment: "bg-success/10 text-success", publish: "bg-warning/10 text-warning", review: "bg-star/10 text-star" };

export default function AdminOverview() {
  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">Platform performance at a glance</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Revenue" value="$275,000" change="+24.5%" trend="up" icon={DollarSign} />
          <StatsCard title="Active Users" value="12,847" change="+8.2%" trend="up" icon={Users} />
          <StatsCard title="Total Courses" value="186" change="+12" trend="up" icon={BookOpen} />
          <StatsCard title="New Enrollments" value="1,240" change="+15.8%" trend="up" icon={TrendingUp} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-card">
            <CardHeader><CardTitle className="font-display text-lg">Revenue Trends</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 90%)" />
                    <XAxis dataKey="month" stroke="hsl(220 10% 46%)" fontSize={12} />
                    <YAxis stroke="hsl(220 10% 46%)" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
                    <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]} />
                    <Line type="monotone" dataKey="revenue" stroke="hsl(235 72% 55%)" strokeWidth={2.5} dot={{ fill: "hsl(235 72% 55%)", r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader><CardTitle className="font-display text-lg">Top Categories</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 90%)" />
                    <XAxis dataKey="name" stroke="hsl(220 10% 46%)" fontSize={12} />
                    <YAxis stroke="hsl(220 10% 46%)" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
                    <Tooltip formatter={(v: number) => [v.toLocaleString(), "Students"]} />
                    <Bar dataKey="students" fill="hsl(235 72% 55%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="font-display text-lg">Recent Activity</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity) => {
                const Icon = typeIcons[activity.type] || TrendingUp;
                return (
                  <div key={activity.id} className="flex items-center gap-4">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 ${typeBadge[activity.type]}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  );
}
