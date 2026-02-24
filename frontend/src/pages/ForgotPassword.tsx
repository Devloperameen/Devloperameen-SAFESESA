
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";
import AnimatedPage from "@/components/AnimatedPage";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        try {
            await apiRequest("/auth/forgot-password", {
                method: "POST",
                body: { email }
            });
            setSent(true);
            toast.success("Reset link sent!");
        } catch (error: any) {
            toast.error(error.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatedPage>
            <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] animate-pulse delay-700" />
                </div>

                <Card className="relative z-10 w-full max-w-md bg-slate-900/50 backdrop-blur-xl border-slate-800 shadow-2xl">
                    <CardHeader className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Link to="/login" className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                                <ArrowLeft className="h-4 w-4 text-slate-400" />
                            </Link>
                            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                                Forgot Password
                            </CardTitle>
                        </div>
                        <CardDescription className="text-slate-400">
                            {sent
                                ? "Check your email for the reset link."
                                : "Enter your email address and we'll send you a link to reset your password."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!sent ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                        <Input
                                            type="email"
                                            placeholder="name@example.com"
                                            className="pl-10 bg-slate-950/50 border-slate-700 focus:border-primary transition-all rounded-xl h-11"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full h-11 rounded-xl gradient-primary font-semibold shadow-lg shadow-primary/20"
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Reset Link"}
                                </Button>
                            </form>
                        ) : (
                            <div className="text-center py-6">
                                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
                                    <Mail className="h-8 w-8 text-primary" />
                                </div>
                                <p className="text-sm text-slate-300">
                                    We've sent an email to <span className="text-white font-medium">{email}</span>.
                                </p>
                                <Button
                                    variant="link"
                                    className="mt-4 text-primary hover:text-primary/80"
                                    onClick={() => setSent(false)}
                                >
                                    Didn't get the email? Try again
                                </Button>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                        <p className="text-center w-full text-sm text-slate-500">
                            Remembered your password?{" "}
                            <Link to="/login" className="text-primary hover:underline transition-all">
                                Sign in
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </AnimatedPage>
    );
}
