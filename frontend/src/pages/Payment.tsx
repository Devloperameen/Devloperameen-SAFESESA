
import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CreditCard, ShieldCheck, Zap, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCourseById } from "@/services/courseService";
import { enrollInCourse } from "@/services/enrollmentService";
import { toast } from "sonner";
import AnimatedPage from "@/components/AnimatedPage";

export default function Payment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    data: course,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["course", id],
    queryFn: () => getCourseById(id || ""),
    enabled: Boolean(id),
  });

  const enrollmentMutation = useMutation({
    mutationFn: () => enrollInCourse(id || ""),
    onSuccess: () => {
      setSuccess(true);
      toast.success("Enrollment successful!");
      setTimeout(() => navigate(`/learn/${id}`), 2500);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to enroll. Please try again.");
      setProcessing(false);
    }
  });

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    // Simulate payment processing delay
    setTimeout(() => {
      enrollmentMutation.mutate();
    }, 2000);
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center text-muted-foreground">Loading payment...</div>;
  if (isError || !course) return <div className="h-screen flex items-center justify-center text-muted-foreground">Course not found</div>;

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-slate-950 py-12 px-4 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

        <div className="container max-w-5xl mx-auto relative z-10">
          <Link to={`/course/${id}`} className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Order Summary */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-xl">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-video rounded-lg overflow-hidden border border-slate-800">
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-white leading-tight">{course.title}</h3>
                    <p className="text-xs text-slate-400">By {course.instructor}</p>
                  </div>
                  <div className="pt-4 border-t border-slate-800 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Course Price</span>
                      <span className="text-white font-medium">${course.price}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2">
                      <span className="text-white">Total</span>
                      <span className="text-primary font-display">${course.price}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-slate-950/30 rounded-b-xl border-t border-slate-800 p-4">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    <ShieldCheck className="h-3 w-3 text-emerald-500" />
                    Secure & Encrypted Checkout
                  </div>
                </CardFooter>
              </Card>

              <div className="bg-slate-900/30 border border-slate-800/50 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Instant Access</h4>
                    <p className="text-xs text-slate-400">Start learning immediately after payment.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Checkout Form */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold flex items-center gap-3">
                    <CreditCard className="h-6 w-6 text-primary" />
                    Checkout
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Enter your payment details to complete the enrollment.
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  {success ? (
                    <div className="h-full flex flex-col items-center justify-center py-12 text-center space-y-4">
                      <div className="h-20 w-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 animate-bounce">
                        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                      </div>
                      <h2 className="text-2xl font-bold text-white">Payment Successful!</h2>
                      <p className="text-slate-400 max-w-sm">
                        You've been successfully enrolled in <span className="text-white font-medium">{course.title}</span>.
                        Redirecting to the course player...
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handlePayment} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="card-name" className="text-slate-300">Name on Card</Label>
                          <Input
                            id="card-name"
                            placeholder="John Doe"
                            required
                            className="bg-slate-950/50 border-slate-700 focus:border-primary rounded-xl h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="card-number" className="text-slate-300">Card Number</Label>
                          <div className="relative">
                            <Input
                              id="card-number"
                              placeholder="0000 0000 0000 0000"
                              required
                              className="bg-slate-950/50 border-slate-700 pl-11 focus:border-primary rounded-xl h-11"
                            />
                            <CreditCard className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="card-expiry" className="text-slate-300">Expiry Date</Label>
                          <Input
                            id="card-expiry"
                            placeholder="MM/YY"
                            required
                            className="bg-slate-950/50 border-slate-700 focus:border-primary rounded-xl h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="card-cvc" className="text-slate-300">CVC / CVV</Label>
                          <Input
                            id="card-cvc"
                            placeholder="123"
                            required
                            type="password"
                            maxLength={4}
                            className="bg-slate-950/50 border-slate-700 focus:border-primary rounded-xl h-11"
                          />
                        </div>
                      </div>

                      <div className="pt-6 border-t border-slate-800">
                        <Button
                          type="submit"
                          className="w-full h-12 rounded-xl gradient-primary font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                          disabled={processing}
                        >
                          {processing ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Processing Secure Payment...
                            </>
                          ) : (
                            `Pay $${course.price} & Enroll Now`
                          )}
                        </Button>
                        <p className="text-center text-[10px] text-slate-500 mt-4 px-8 uppercase tracking-widest leading-relaxed">
                          By clicking "Pay & Enroll Now", you agree to our Terms of Service.
                          This is a demo secure checkout environment.
                        </p>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
