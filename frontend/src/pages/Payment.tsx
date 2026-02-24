
import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreditCard, ShieldCheck, Zap, Loader2, ArrowLeft, CheckCircle2, Receipt, Sparkles, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCourseById } from "@/services/courseService";
import { processPayment } from "@/services/paymentService";
import { toast } from "sonner";
import AnimatedPage from "@/components/AnimatedPage";
import { motion } from "framer-motion";

export default function Payment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [txnId, setTxnId] = useState("");

  const {
    data: course,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["course", id],
    queryFn: () => getCourseById(id || ""),
    enabled: Boolean(id),
  });

  const paymentMutation = useMutation({
    mutationFn: (data: any) => processPayment(data),
    onSuccess: (response) => {
      setTxnId(response.data.transaction.transactionId);
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["enrollments", "list"] });
      toast.success("Enrollment successful!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Payment failed. Please try again.");
      setProcessing(false);
    }
  });

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    // In a real app, we'd collect card details here securely
    paymentMutation.mutate({
      courseId: id,
      paymentMethod: "credit_card",
    });
  };

  if (isLoading) return <div className="h-screen bg-slate-950 flex items-center justify-center text-primary font-display animate-pulse">Initializing Secure Checkout...</div>;
  if (isError || !course) return <div className="h-screen bg-slate-950 flex items-center justify-center text-white">Error loading course details.</div>;

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-slate-950 py-12 px-4 relative flex items-center justify-center overflow-hidden">
        {/* Advanced Background Aesthetic */}
        <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[60%] h-[60%] bg-secondary/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />

        <div className="container max-w-6xl mx-auto relative z-10">
          <Link to={`/course/${id}`} className="inline-flex items-center text-slate-500 hover:text-white mb-10 transition-all font-medium group">
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Course
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Order Details Panel */}
            <div className="lg:col-span-5 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-3xl overflow-hidden shadow-2xl relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-secondary" />
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <Receipt className="h-5 w-5 text-primary" />
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex gap-4 p-3 bg-slate-950/40 rounded-2xl border border-slate-800/50">
                      <div className="h-24 w-32 rounded-xl overflow-hidden shrink-0 border border-slate-800">
                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-1 py-1">
                        <h3 className="font-bold text-white text-sm leading-tight line-clamp-2">{course.title}</h3>
                        <p className="text-xs text-slate-400">by <span className="text-slate-200">{course.instructor}</span></p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-400 uppercase tracking-tighter">Premium Access</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Regular Price</span>
                        <span className="text-slate-400 line-through">${(course.price * 1.2).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Platform Discount</span>
                        <span className="text-emerald-500">- ${(course.price * 0.2).toFixed(2)}</span>
                      </div>
                      <div className="pt-4 border-t border-slate-800/80">
                        <div className="flex justify-between items-end">
                          <span className="text-white font-bold text-lg">Amount Due</span>
                          <div className="text-right">
                            <div className="text-3xl font-black text-white font-display">${course.price}</div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wide">USD Transaction</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-slate-950/50 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="h-3 w-3 text-primary" />
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">SSL Secure</span>
                    </div>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4 opacity-40 grayscale" />
                  </CardFooter>
                </Card>
              </motion.div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-4 transition-colors hover:bg-slate-900/50 group">
                  <Zap className="h-5 w-5 text-amber-500 mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Instant Setup</h4>
                  <p className="text-[10px] text-slate-400 mt-1">Automatic course unlocking</p>
                </div>
                <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-4 transition-colors hover:bg-slate-900/50 group">
                  <ShieldCheck className="h-5 w-5 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Satisfaction</h4>
                  <p className="text-[10px] text-slate-400 mt-1">30-day refund protection</p>
                </div>
              </div>
            </div>

            {/* Payment Interactive Area */}
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="h-full"
              >
                <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-3xl h-full shadow-2xl relative overflow-hidden flex flex-col justify-center">
                  <CardHeader className="text-center pb-8">
                    <CardTitle className="text-3xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent uppercase tracking-tight">
                      {success ? "Payment Successful" : "Secure Payment"}
                    </CardTitle>
                    <CardDescription className="text-slate-400 mt-2">
                      {success
                        ? "Welcome to the premium learning experience"
                        : "Enter your billing details to activate your premium license"}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="px-8 lg:px-12">
                    {success ? (
                      <div className="flex flex-col items-center text-center space-y-8 py-4">
                        <div className="relative">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="h-28 w-28 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/30"
                          >
                            <CheckCircle2 className="h-14 w-14 text-emerald-400" />
                          </motion.div>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                            className="absolute -top-4 -right-4 h-12 w-12 text-primary opacity-50"
                          >
                            <Sparkles className="h-full w-full" />
                          </motion.div>
                        </div>

                        <div className="space-y-2">
                          <h2 className="text-2xl font-bold text-white">License Activated!</h2>
                          <div className="bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800 flex items-center gap-3">
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">TXN ID:</div>
                            <div className="text-xs font-mono text-primary">{txnId}</div>
                          </div>
                        </div>

                        <div className="flex flex-col w-full gap-3 pt-4">
                          <Button
                            onClick={() => navigate(`/learn/${id}`)}
                            className="w-full h-14 rounded-2xl gradient-primary font-black text-lg shadow-xl"
                          >
                            Enter Course Player
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => navigate('/my-learning')}
                            className="text-slate-400 hover:text-white"
                          >
                            View All My Courses
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handlePayment} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                          <div className="space-y-3">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Name on Card</Label>
                            <Input
                              placeholder="FULL LEGAL NAME"
                              required
                              className="bg-slate-950/60 border-slate-800 focus:border-primary/50 rounded-2xl h-14 px-5 text-white placeholder:text-slate-700 transition-all shadow-inner"
                            />
                          </div>
                          <div className="space-y-3">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Card Number</Label>
                            <div className="relative">
                              <Input
                                placeholder="•••• •••• •••• ••••"
                                required
                                className="bg-slate-950/60 border-slate-800 pl-14 focus:border-primary/50 rounded-2xl h-14 px-5 text-white placeholder:text-slate-700 transition-all font-mono tracking-widest"
                              />
                              <CreditCard className="absolute left-5 top-5 h-4 w-4 text-primary opacity-60" />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Expiration</Label>
                            <Input
                              placeholder="MM / YY"
                              required
                              className="bg-slate-950/60 border-slate-800 focus:border-primary/50 rounded-2xl h-14 px-5 text-white transition-all text-center"
                            />
                          </div>
                          <div className="space-y-3">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">CVC Code</Label>
                            <Input
                              placeholder="•••"
                              required
                              type="password"
                              maxLength={4}
                              className="bg-slate-950/60 border-slate-800 focus:border-primary/50 rounded-2xl h-14 px-5 text-white transition-all text-center"
                            />
                          </div>
                        </div>

                        <div className="pt-8">
                          <Button
                            type="submit"
                            className="w-full h-16 rounded-2xl gradient-primary font-black text-xl shadow-2xl transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 group overflow-hidden relative"
                            disabled={processing}
                          >
                            {processing ? (
                              <div className="flex items-center gap-3">
                                <Loader2 className="h-6 w-6 animate-spin text-white" />
                                <span className="uppercase tracking-widest">Verifying Assets...</span>
                              </div>
                            ) : (
                              <>
                                <span className="relative z-10 flex items-center gap-3">
                                  Securely Authorize Transation
                                  <ShieldCheck className="h-5 w-5" />
                                </span>
                                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/10 opacity-40 group-hover:animate-shine" />
                              </>
                            )}
                          </Button>
                          <div className="flex items-center justify-center gap-6 mt-6 grayscale opacity-30">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PP" className="h-4" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.svg" alt="MC" className="h-6" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/MasterCard_Logo.svg" alt="AE" className="h-4" />
                          </div>
                        </div>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
