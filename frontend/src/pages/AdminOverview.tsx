import { DollarSign, Users, BookOpen, TrendingUp, UserPlus, Star, FileCheck, XCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import StatsCard from "@/components/StatsCard";
import AnimatedPage from "@/components/AnimatedPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminActivities, getAdminAnalytics } from "@/services/adminService";

const typeIcons: Record<string, typeof UserPlus> = {
  signup: UserPlus,
  enrollment: TrendingUp,
  publish: FileCheck,
  review: Star,
  course_created: FileCheck,
  course_approved: FileCheck,
  course_rejected: XCircle,
};

const typeBadge: Record<string, string> = {
  signup: "bg-primary/10 text-primary",
  enrollment: "bg-success/10 text-success",
  publish: "bg-warning/10 text-warning",
  review: "bg-star/10 text-star",
  course_created: "bg-primary/10 text-primary",
  course_approved: "bg-success/10 text-success",
  course_rejected: "bg-destructive/10 text-destructive",
};

function formatCurrency(value: number): string {
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function formatTimeAgo(value: string): string {
  const dateMs = new Date(value).getTime();
  const diffMs = Date.now() - dateMs;
  const diffMinutes = Math.floor(diffMs / (60 * 1000));

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day ago`;

  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminOverview() {
  const {
    data: analytics,
    isLoading: analyticsLoading,
    isError: analyticsError,
  } = useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: () => getAdminAnalytics(),
  });

  const {
    data: activities = [],
    isLoading: activitiesLoading,
    isError: activitiesError,
  } = useQuery({
    queryKey: ["admin", "activities"],
    queryFn: () => getAdminActivities(20),
  });

  if (analyticsLoading || activitiesLoading) {
    return (
      <AnimatedPage>
        <div className="space-y-6">
          <div>
            <h1 className="font-display text-3xl font-bold">Dashboard Overview</h1>
            <p className="text-muted-foreground mt-1">Platform performance at a glance</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            Loading dashboard analytics...
          </div>
        </div>
      </AnimatedPage>
    );
  }

  if (analyticsError || activitiesError || !analytics) {
    return (
      <AnimatedPage>
        <div className="space-y-6">
          <div>
            <h1 className="font-display text-3xl font-bold">Dashboard Overview</h1>
            <p className="text-muted-foreground mt-1">Platform performance at a glance</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            Unable to load dashboard analytics.
          </div>
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">Platform performance at a glance</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Revenue" value={formatCurrency(analytics.overview.totalRevenue)} icon={DollarSign} />
          <StatsCard title="Active Users" value={analytics.overview.activeUsers.toLocaleString()} icon={Users} />
          <StatsCard title="Total Courses" value={analytics.overview.totalCourses.toLocaleString()} icon={BookOpen} />
          <StatsCard title="Enrollments" value={analytics.overview.totalEnrollments.toLocaleString()} icon={TrendingUp} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-card">
            <CardHeader><CardTitle className="font-display text-lg">Revenue Trends</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.revenueData}>
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
                  <BarChart data={analytics.categories.slice(0, 8)}>
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
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 ${typeBadge[activity.type] || "bg-muted text-muted-foreground"}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatTimeAgo(activity.createdAt)}</p>
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
