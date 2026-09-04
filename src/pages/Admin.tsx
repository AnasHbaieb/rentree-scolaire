import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) checkRoleAndRedirect(session.user.id);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) checkRoleAndRedirect(session.user.id);
      else setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const checkRoleAndRedirect = async (userId: string) => {
    const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (data === true) {
      navigate("/admin/dashboard");
    } else {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      setSubmitting(false);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("تم إنشاء الحساب. اطلب من المسؤول إعطائك صلاحية الإدارة.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setSubmitting(false);
      if (error) toast.error("بيانات الدخول غير صحيحة");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>دخول الإدارة - أُضْحِيَّتْنَا</title>
        <meta name="description" content="صفحة دخول مخصّصة لفريق إدارة جمعية الكلمة الطيبة لإدارة حملة أُضْحِيَّتْنَا." />
        <meta name="robots" content="noindex" />
        <link rel="canonical" href="https://eid-idhha.lovable.app/admin" />
      </Helmet>
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-card">
          <h1 className="text-2xl font-bold text-primary mb-2 text-center">دخول الإدارة</h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            مخصّص لفريق جمعية الكلمة الطيبة
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                dir="ltr"
              />
            </div>
            <div>
              <Label htmlFor="password">كلمة السر</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                dir="ltr"
              />
            </div>
            <Button type="submit" disabled={submitting} className="w-full bg-primary text-primary-foreground font-bold py-6">
              {submitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              {mode === "signin" ? "دخول" : "إنشاء حساب"}
            </Button>
          </form>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Admin;
