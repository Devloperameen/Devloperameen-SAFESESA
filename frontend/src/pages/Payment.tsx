
import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreditCard, ShieldCheck, Zap, Loader2, ArrowLeft, CheckCircle2, Receipt, Sparkles, Lock, Landmark, Send, Info, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCourseById } from "@/services/courseService";
import { processPayment } from "@/services/paymentService";
import { toast } from "sonner";
import AnimatedPage from "@/components/AnimatedPage";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function Payment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [checkRef, setCheckRef] = useState("");

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
    mutationFn: (data: any) => processPayment(data),
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["enrollments", "list"] });
      toast.success("Enrollment request submitted! Verification pending.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Submission failed. Please try again.");
      setProcessing(false);
    }
  });

  const handleRequestAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkRef.trim()) {
      toast.error("Please provide a check number or reference ID");
      return;
    }
    setProcessing(true);

    enrollmentMutation.mutate({
      courseId: id,
      paymentMethod: "check",
      paymentReference: checkRef,
    });
  };

  if (isLoading) return <div className="h-screen bg-slate-950 flex items-center justify-center text-primary font-display animate-pulse uppercase tracking-[0.3em]">Calibrating Access Protocol...</div>;
  if (isError || !course) return <div className="h-screen bg-slate-950 flex items-center justify-center text-white">Security error: Course data inaccessible.</div>;

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-slate-950 flex items-center justify-center py-16 px-4 relative overflow-hidden">
        {/* Cinematic Backdrop */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-10" />
          <img
            src="https://images.unsplash.com/photo-1554224155-169641357599?q=80&w=2070&auto=format&fit=crop"
            className="w-full h-full object-cover opacity-30"
            alt="Payment Aesthetic"
          />
          <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[140px] pointer-events-none" />
        </div>

        <div className="container max-w-6xl mx-auto relative z-10">
          <div className="mb-12">
            <Link to={`/course/${id}`} className="inline-flex items-center text-slate-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-[0.3em] group bg-slate-900/40 px-6 py-3 rounded-2xl border border-slate-800/50 backdrop-blur-md">
              <ArrowLeft className="h-4 w-4 mr-3 group-hover:-translate-x-1 transition-transform text-primary" />
              Return to Course Briefing
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column: Course Intelligence */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-4 lg:sticky lg:top-10 space-y-8"
            >
              <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary to-transparent" />
                <CardContent className="p-8 space-y-10">
                  <div className="space-y-4">
                    <Badge className="bg-primary/20 text-primary border-primary/30 uppercase text-[10px] font-black tracking-widest px-3 py-1">Secure Asset Purchase</Badge>
                    <h2 className="text-3xl font-black text-white leading-tight uppercase tracking-tighter">
                      {course.title}
                    </h2>
                  </div>

                  <div className="h-40 w-full rounded-3xl border border-slate-800 overflow-hidden relative group">
                    <img src={course.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Thumbnail" />
                    <div className="absolute inset-0 bg-slate-950/40" />
                  </div>

                  <div className="space-y-6 pt-6 border-t border-slate-800/50">
                    <div className="flex justify-between items-end">
                      <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">Global Access Fee</span>
                      <div className="text-right">
                        <span className="text-4xl font-black text-white">${course.price}</span>
                        <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">One-time payment</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-slate-950/50 p-6 flex items-center justify-between border-t border-slate-800/50">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary" />
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">AES-256 Deployment</span>
                  </div>
                </CardFooter>
              </Card>

              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-3xl p-8 space-y-4 backdrop-blur-sm">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                </div>
                <h4 className="text-xs font-black text-white uppercase tracking-widest">Quality Assurance</h4>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                  Every enrollment is verified by our administrative team. Your access will be activated immediately following transaction confirmation.
                </p>
              </div>
            </motion.div>

            {/* Right Column: Interaction Protocol */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-8 h-full"
            >
              <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden shadow-2xl h-full flex flex-col relative">
                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-16 flex flex-col items-center justify-center text-center space-y-10 flex-1"
                    >
                      <div className="relative">
                        <div className="h-32 w-32 bg-primary/10 rounded-[2rem] flex items-center justify-center border border-primary/20 relative z-10">
                          <Clock className="h-14 w-14 text-primary animate-pulse" />
                        </div>
                        <motion.div
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ repeat: Infinity, duration: 3 }}
                          className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"
                        />
                      </div>

                      <div className="space-y-4">
                        <h2 className="text-4xl font-black text-white uppercase tracking-tight leading-none">Transmission Received</h2>
                        <p className="text-slate-500 font-medium max-w-sm mx-auto">
                          Your enrollment request has been logged in our secure archives. Administrators are verifying your payment citation.
                        </p>
                      </div>

                      <div className="bg-slate-950/60 p-6 rounded-3xl border border-slate-800/50 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Protocol Status</span>
                          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 font-black">PENDING APPROVAL</Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ref Citation:</div>
                          <div className="text-xs font-mono font-bold text-slate-200">{checkRef}</div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                        <Button onClick={() => navigate('/my-learning')} className="flex-1 h-14 rounded-2xl bg-white text-black font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                          Learning Grid
                        </Button>
                        <Button variant="ghost" className="flex-1 h-14 rounded-2xl border border-slate-800 text-slate-500 font-black uppercase tracking-widest" onClick={() => navigate('/')}>
                          Platform Home
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="form"
                      className="p-10 lg:p-16 flex-1 space-y-12"
                    >
                      <div className="space-y-4 border-l-4 border-primary pl-10">
                        <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none">
                          Request Access <br /> <span className="text-slate-600">Protocol</span>
                        </h2>
                        <p className="text-slate-500 font-medium max-w-lg">
                          To gain access via offline channels, please submit your payment reference for administrative verification.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-8">
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <Landmark className="h-5 w-5 text-primary" />
                              <h3 className="text-sm font-black text-white uppercase tracking-widest">Payment Target</h3>
                            </div>
                            <div className="bg-slate-950/60 p-6 rounded-3xl border border-slate-800/80 space-y-4">
                              <div className="flex items-start gap-3">
                                <Info className="h-6 w-6 text-amber-500 shrink-0 mt-1" />
                                <div>
                                  <p className="text-sm font-bold text-amber-500 uppercase mb-2">Intentional Notice</p>
                                  <p className="text-xs text-slate-300 leading-relaxed font-medium">The payment gateway integration is currently intentionally non-functional and in development. It will be fully implemented soon.</p>
                                </div>
                              </div>
                              <div className="pt-4 border-t border-slate-800/50">
                                <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase">
                                  * You may bypass this step for now to test the learning environment.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <ShieldCheck className="h-5 w-5 text-primary" />
                              <h3 className="text-sm font-black text-white uppercase tracking-widest">Testing Protocol</h3>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed px-2">
                              For the purposes of this demonstration, click the button below to simulate a successful payment bypass and request immediate administrative verification.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-8">
                          <form onSubmit={handleRequestAccess} className="space-y-8">
                            <div className="space-y-4 p-8 bg-slate-950/60 rounded-[2rem] border border-slate-800/80 shadow-inner">
                              <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Mock Reference ID (Optional)</Label>
                                <Input
                                  placeholder="BYPASS-PAYMENT-TEST"
                                  value={checkRef}
                                  onChange={(e) => setCheckRef(e.target.value.toUpperCase())}
                                  className="h-16 bg-slate-900/50 border-slate-800 focus:border-primary/50 text-white font-black tracking-widest rounded-2xl px-6 uppercase shadow-inner"
                                />
                              </div>
                              <p className="text-[9px] text-slate-600 font-bold uppercase text-center tracking-widest">
                                Any value will work for this demonstration.
                              </p>
                            </div>

                            <Button
                              type="submit"
                              disabled={processing}
                              onClick={(e) => {
                                if (!checkRef.trim()) { setCheckRef("MOCK-PAYMENT-BYPASS"); }
                              }}
                              className="w-full h-20 rounded-[1.5rem] gradient-primary font-black text-xl uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all group overflow-hidden"
                            >
                              {processing ? (
                                <Loader2 className="h-8 w-8 animate-spin" />
                              ) : (
                                <div className="flex items-center gap-4">
                                  <span>Bypass & Enroll</span>
                                  <Send className="h-6 w-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-white/10 translate-y-20 group-hover:translate-y-0 transition-transform duration-500" />
                            </Button>

                            <div className="flex flex-col items-center gap-4 opacity-50">
                              <div className="flex items-center gap-3">
                                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                <span className="text-[9px] font-black text-white uppercase tracking-widest">Fraud Prevention Protocol Active</span>
                              </div>
                              <div className="h-1 w-20 bg-slate-800 rounded-full" />
                            </div>
                          </form>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Visual Accent */}
                <div className="absolute -bottom-20 -right-20 h-64 w-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
