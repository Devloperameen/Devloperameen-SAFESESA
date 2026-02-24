
import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Eye, EyeOff, GraduationCap, Sparkles, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import { motion } from "framer-motion";

type SignupRole = "student" | "instructor";

export default function Signup() {
  const navigate = useNavigate();
  const { register, isAuthenticated, isLoading, isInitializing } = useAuth();
  const { setRole } = useRole();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setSelectedRole] = useState<SignupRole>("student");

  if (isInitializing) {
    return <div className="min-h-screen grid place-items-center bg-slate-950 text-primary font-display animate-pulse uppercase tracking-widest">System Calibrating...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password.length < 6) {
      toast.error("Security policy: Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Integrity error: Passwords do not match");
      return;
    }

    try {
      const user = await register({ name, email, password, role });
      setRole(user.role);
      toast.success("Identity verified. Welcome to EduFlow.");

      if (user.role === "instructor") {
        navigate("/instructor", { replace: true });
        return;
      }

      navigate("/", { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to establish identity";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Premium Background Aesthetic */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg relative z-10"
      >
        <Card className="bg-slate-900/40 border-slate-800/80 backdrop-blur-3xl shadow-2xl rounded-3xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary animate-gradient-x" />
          <CardHeader className="space-y-6 pt-10 pb-4">
            <Link to="/" className="flex items-center justify-center gap-3 group transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="font-display text-3xl font-black text-white tracking-tight uppercase">EduFlow</span>
            </Link>
            <div className="space-y-2 text-center">
              <CardTitle className="text-2xl font-black text-white uppercase tracking-tight">Initialize Profile</CardTitle>
              <CardDescription className="text-slate-500 font-medium">Join the global elite learning network today.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-10">
            <form className="space-y-5" onSubmit={onSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Identity Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="FULL NAME"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    className="bg-slate-950/60 border-slate-800 focus:border-primary/50 rounded-2xl h-12 px-5 text-white placeholder:text-slate-800 transition-all shadow-inner uppercase text-xs font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Secure Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="EMAIL@DOMAIN.COM"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    className="bg-slate-950/60 border-slate-800 focus:border-primary/50 rounded-2xl h-12 px-5 text-white placeholder:text-slate-800 transition-all shadow-inner uppercase text-xs font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Platform Path</Label>
                <Select value={role} onValueChange={(value: SignupRole) => setSelectedRole(value)}>
                  <SelectTrigger id="role" className="bg-slate-950/60 border-slate-800 focus:border-primary/50 rounded-2xl h-12 px-5 text-white font-bold text-xs uppercase">
                    <SelectValue placeholder="Select path" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    <SelectItem value="student">Student Account</SelectItem>
                    <SelectItem value="instructor">Instructor Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Passphrase</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      minLength={6}
                      className="bg-slate-950/60 border-slate-800 focus:border-primary/50 rounded-2xl h-12 px-5 text-white placeholder:text-slate-800 transition-all shadow-inner"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Verify Passphrase</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      required
                      className="bg-slate-950/60 border-slate-800 focus:border-primary/50 rounded-2xl h-12 px-5 text-white placeholder:text-slate-800 transition-all shadow-inner"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-14 rounded-2xl gradient-primary font-black text-lg uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70 mt-4 group"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <span className="animate-pulse">Authorizing...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Establish Profile</span>
                    <Sparkles className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-800/50 text-center space-y-4">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">
                Already part of the network?{" "}
                <Link to="/login" className="font-black text-white hover:text-primary transition-colors decoration-primary underline underline-offset-4">
                  Authenticate
                </Link>
              </p>
              <div className="flex items-center justify-center gap-2 text-[8px] font-black text-slate-600 uppercase tracking-[0.3em]">
                <ShieldCheck className="h-3 w-3" />
                Enterprise Encryption Active
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
