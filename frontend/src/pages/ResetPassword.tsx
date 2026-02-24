
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Lock, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";
import AnimatedPage from "@/components/AnimatedPage";

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return toast.error("Passwords do not match");
        }

        setLoading(true);
        try {
            await apiRequest(`/auth/reset-password/${token}`, {
                method: "POST",
                body: { password }
            });
            setSuccess(true);
            toast.success("Password reset successfully!");
            setTimeout(() => navigate("/login"), 3000);
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
                    <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
                    <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] animate-pulse delay-700" />
                </div>

                <Card className="relative z-10 w-full max-w-md bg-slate-900/50 backdrop-blur-xl border-slate-800 shadow-2xl">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            Reset Password
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            {success
                                ? "Your password has been updated."
                                : "Create a new secure password for your account."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!success ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                        <Input
                                            type="password"
                                            placeholder="New Password"
                                            className="pl-10 bg-slate-950/50 border-slate-700 focus:border-primary transition-all rounded-xl h-11"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                        <Input
                                            type="password"
                                            placeholder="Confirm New Password"
                                            className="pl-10 bg-slate-950/50 border-slate-700 focus:border-primary transition-all rounded-xl h-11"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full h-11 rounded-xl gradient-primary font-semibold shadow-lg shadow-primary/20"
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reset Password"}
                                </Button>
                            </form>
                        ) : (
                            <div className="text-center py-6">
                                <div className="h-16 w-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-success/20">
                                    <CheckCircle2 className="h-8 w-8 text-success" />
                                </div>
                                <p className="text-sm text-slate-300">
                                    Redirecting you to login page...
                                </p>
                                <Button asChild className="mt-4 w-full h-11 rounded-xl">
                                    <Link to="/login">Go to Login Now</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AnimatedPage>
    );
}
