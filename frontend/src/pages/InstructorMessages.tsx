import { useQuery } from "@tanstack/react-query";
import { MessageSquare, Star, XCircle } from "lucide-react";
import AnimatedPage from "@/components/AnimatedPage";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getInstructorMessages } from "@/services/courseService";

function formatDate(value: string): string {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function InstructorMessages() {
  const {
    data: messages = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["instructor", "messages"],
    queryFn: () => getInstructorMessages(),
  });

  return (
    <AnimatedPage>
      <div className="container py-8">
        <h1 className="font-display text-3xl font-bold mb-2">Messages</h1>
        <p className="text-muted-foreground mb-8">
          Reviews from students and publish feedback from admin
        </p>

        {isLoading ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            Loading messages...
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            Unable to load messages.
          </div>
        ) : messages.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            No messages yet.
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <Card key={message.id} className="shadow-card">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {message.type === "review" ? (
                        <Star className="h-4 w-4 text-star" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-semibold">{message.title}</p>
                        <Badge variant="outline">
                          {message.type === "review" ? "Student Review" : "Admin Feedback"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{message.message}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{message.sender}</span>
                        <span>|</span>
                        <span>{message.courseTitle}</span>
                        <span>|</span>
                        <span>{formatDate(message.createdAt)}</span>
                      </div>
                    </div>
                    <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AnimatedPage>
  );
}
