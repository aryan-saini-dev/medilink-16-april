import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Shield, Smartphone, Mail, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type AuthMethod = "choose" | "phone" | "otp" | "email-login" | "email-signup";

const PatientLogin = () => {
  const navigate = useNavigate();
  const [method, setMethod] = useState<AuthMethod>("choose");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length >= 6) setMethod("otp");
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 3) {
      sessionStorage.setItem("patient_authenticated", "true");
      navigate("/dashboard");
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      sessionStorage.setItem("patient_authenticated", "true");
      navigate("/dashboard");
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Check your email", description: "We sent a verification link to confirm your account." });
      setMethod("email-login");
    }
  };

  const animProps = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 },
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="h-14 flex items-center px-6 gap-4">
        <Link to="/" className="shrink-0"><Logo size="sm" /></Link>
        <div className="flex-1" />
        <Button variant="ghost" size="sm" asChild>
          <Link to="/"><ArrowLeft className="w-4 h-4 mr-1" /> Home</Link>
        </Button>
      </header>

      <div className="max-w-md mx-auto px-6 py-16">
        <AnimatePresence mode="wait">
          {method === "choose" && (
            <motion.div key="choose" {...animProps} className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-foreground flex items-center justify-center mx-auto mb-4 shadow-pop">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-display font-bold text-foreground mb-2">Patient Portal</h1>
                <p className="text-muted-foreground">Choose how you'd like to access your health records.</p>
              </div>
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <button
                    onClick={() => setMethod("phone")}
                    className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors border-b-2 border-border"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-foreground flex items-center justify-center shrink-0 shadow-pop">
                      <Smartphone className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-foreground text-sm">Login via Phone</p>
                      <p className="text-xs text-muted-foreground">Receive a 3-digit verification code</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setMethod("email-login")}
                    className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-foreground flex items-center justify-center shrink-0 shadow-pop">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-foreground text-sm">Login via Email</p>
                      <p className="text-xs text-muted-foreground">Use your email and password</p>
                    </div>
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {method === "phone" && (
            <motion.div key="phone" {...animProps}>
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-foreground flex items-center justify-center mx-auto mb-4 shadow-pop">
                  <Smartphone className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-display font-bold text-foreground mb-2">Phone verification</h1>
                <p className="text-muted-foreground">Enter your phone number to receive a code.</p>
              </div>
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Phone number</label>
                  <Input type="tel" placeholder="+1 (555) 000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-12 text-base" />
                </div>
                <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={phone.length < 6}>
                  Send verification code
                </Button>
                <button type="button" onClick={() => setMethod("choose")} className="text-sm text-muted-foreground hover:text-foreground w-full text-center">
                  ← Back to options
                </button>
              </form>
            </motion.div>
          )}

          {method === "otp" && (
            <motion.div key="otp" {...animProps}>
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-foreground flex items-center justify-center mx-auto mb-4 shadow-pop">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-display font-bold text-foreground mb-2">Verify identity</h1>
                <p className="text-muted-foreground">Enter the 3-digit code sent to your phone.</p>
              </div>
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div className="flex justify-center gap-3">
                  {[0, 1, 2].map((i) => (
                    <Input
                      key={i}
                      type="text"
                      maxLength={1}
                      value={otp[i] || ""}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        const newOtp = otp.split("");
                        newOtp[i] = val;
                        setOtp(newOtp.join(""));
                        if (val && e.target.nextElementSibling) {
                          (e.target.nextElementSibling as HTMLInputElement)?.focus?.();
                        }
                      }}
                      className="w-16 h-16 text-center text-2xl font-mono font-bold"
                    />
                  ))}
                </div>
                <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={otp.length < 3}>
                  Verify &amp; enter
                </Button>
                <button type="button" onClick={() => setMethod("phone")} className="text-sm text-muted-foreground hover:text-foreground w-full text-center">
                  Use a different number
                </button>
              </form>
            </motion.div>
          )}

          {method === "email-login" && (
            <motion.div key="email-login" {...animProps}>
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-foreground flex items-center justify-center mx-auto mb-4 shadow-pop">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-display font-bold text-foreground mb-2">Sign in with email</h1>
                <p className="text-muted-foreground">Enter your credentials to access your records.</p>
              </div>
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                  <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 text-base" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 text-base pr-10"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading || !email || !password}>
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
                <div className="text-center space-y-2">
                  <button type="button" onClick={() => setMethod("email-signup")} className="text-sm text-primary hover:underline">
                    Don't have an account? Sign up
                  </button>
                  <br />
                  <button type="button" onClick={() => setMethod("choose")} className="text-sm text-muted-foreground hover:text-foreground">
                    ← Back to options
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {method === "email-signup" && (
            <motion.div key="email-signup" {...animProps}>
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-foreground flex items-center justify-center mx-auto mb-4 shadow-pop">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-display font-bold text-foreground mb-2">Create your account</h1>
                <p className="text-muted-foreground">Sign up to securely manage your health records.</p>
              </div>
              <form onSubmit={handleEmailSignup} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Full name</label>
                  <Input type="text" placeholder="Jane Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-12 text-base" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                  <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 text-base" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Min 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 text-base pr-10"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading || !email || !password || password.length < 6}>
                  {loading ? "Creating account..." : "Create account"}
                </Button>
                <div className="text-center space-y-2">
                  <button type="button" onClick={() => setMethod("email-login")} className="text-sm text-primary hover:underline">
                    Already have an account? Sign in
                  </button>
                  <br />
                  <button type="button" onClick={() => setMethod("choose")} className="text-sm text-muted-foreground hover:text-foreground">
                    ← Back to options
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PatientLogin;
