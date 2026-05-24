import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
import { apiLogin, apiRegister, type AuthUser } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Truck, User, ShieldCheck, LogIn, Eye, EyeOff, UserPlus } from "lucide-react";

const ROLE_META = {
  provider: { label: "مقدم الخدمة", icon: Truck, color: "text-primary", desc: "صاحب عربة للبيع أو التأجير" },
  customer: { label: "المستفيد", icon: User, color: "text-blue-500", desc: "تبحث عن عربة للشراء أو الاستئجار" },
  admin: { label: "مدير المنصة", icon: ShieldCheck, color: "text-orange-500", desc: "إدارة ومراقبة المنصة" },
} as const;

export default function LoginPage() {
  const { setUser } = useAuth();
  const [, navigate] = useLocation();

  const [showPass, setShowPass] = useState(false);
  const [showConfPass, setShowConfPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");

  // Register form
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regConfPass, setRegConfPass] = useState("");
  const [regRole, setRegRole] = useState<"provider" | "customer">("customer");
  const [regPhone, setRegPhone] = useState("");

  function handleSuccess(u: AuthUser) {
    setUser(u);
    const dest = u.role === "provider" ? "/provider" : u.role === "admin" ? "/admin" : "/my-account";
    navigate(dest);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const u = await apiLogin(loginEmail, loginPass);
      handleSuccess(u);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (regPass !== regConfPass) {
      setError("كلمة المرور غير متطابقة");
      return;
    }
    if (regPass.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    setLoading(true);
    try {
      const u = await apiRegister({ name: regName, email: regEmail, password: regPass, role: regRole, phone: regPhone || undefined });
      handleSuccess(u);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <img src="/logo.jpeg" alt="عربتي" className="w-16 h-16 rounded-2xl mx-auto mb-3 object-cover" />
          <h1 className="text-2xl font-black">مرحباً في عربتي</h1>
          <p className="text-muted-foreground text-sm mt-1">منصة سوق عربات الفود ترك في المملكة</p>
        </div>

        <Tabs defaultValue="login" onValueChange={() => setError("")}>
          <TabsList className="w-full">
            <TabsTrigger value="login" className="flex-1 gap-2 font-bold"><LogIn className="w-4 h-4" />تسجيل الدخول</TabsTrigger>
            <TabsTrigger value="register" className="flex-1 gap-2 font-bold"><UserPlus className="w-4 h-4" />حساب جديد</TabsTrigger>
          </TabsList>

          {/* ─── Login ─── */}
          <TabsContent value="login">
            <Card className="border shadow-sm">
              <CardContent className="pt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-bold">البريد الإلكتروني</Label>
                    <Input type="email" placeholder="example@arabati.sa" dir="ltr" className="h-11 text-right"
                      value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">كلمة المرور</Label>
                    <div className="relative">
                      <Input id="loginPass" type={showPass ? "text" : "password"} placeholder="••••••••"
                        dir="ltr" className="h-11 pr-10 text-right"
                        value={loginPass} onChange={e => setLoginPass(e.target.value)} required />
                      <button type="button" onClick={() => setShowPass(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  {error && <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">{error}</p>}
                  <Button type="submit" className="w-full h-11 font-bold gap-2" disabled={loading}>
                    {loading ? <span className="animate-pulse">جاري الدخول...</span> : <><LogIn className="w-4 h-4" />دخول</>}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Register ─── */}
          <TabsContent value="register">
            <Card className="border shadow-sm">
              <CardContent className="pt-6">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-bold">نوع الحساب</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {(["customer", "provider"] as const).map(role => {
                        const meta = ROLE_META[role];
                        const Icon = meta.icon;
                        return (
                          <button key={role} type="button" onClick={() => setRegRole(role)}
                            className={`p-3 rounded-xl border-2 text-center transition-all ${regRole === role ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                            <Icon className={`w-5 h-5 mx-auto mb-1 ${meta.color}`} />
                            <div className="text-xs font-bold">{meta.label}</div>
                            <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">{meta.desc}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="font-bold">الاسم الكامل *</Label>
                      <Input placeholder="محمد العمري" value={regName} onChange={e => setRegName(e.target.value)} required className="h-11" />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="font-bold">البريد الإلكتروني *</Label>
                      <Input type="email" placeholder="example@email.com" dir="ltr" className="h-11 text-right"
                        value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="font-bold">كلمة المرور *</Label>
                      <div className="relative">
                        <Input type={showPass ? "text" : "password"} placeholder="٦ أحرف على الأقل"
                          dir="ltr" className="h-11 pr-10 text-right"
                          value={regPass} onChange={e => setRegPass(e.target.value)} required minLength={6} />
                        <button type="button" onClick={() => setShowPass(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="font-bold">تأكيد كلمة المرور *</Label>
                      <div className="relative">
                        <Input type={showConfPass ? "text" : "password"} placeholder="أعد كتابة كلمة المرور"
                          dir="ltr" className="h-11 pr-10 text-right"
                          value={regConfPass} onChange={e => setRegConfPass(e.target.value)} required minLength={6} />
                        <button type="button" onClick={() => setShowConfPass(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showConfPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="font-bold">رقم الجوال (اختياري)</Label>
                      <Input placeholder="05xxxxxxxx" dir="ltr" className="h-11 text-right"
                        value={regPhone} onChange={e => setRegPhone(e.target.value)} />
                    </div>
                  </div>

                  {error && <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">{error}</p>}
                  <Button type="submit" className="w-full h-11 font-bold gap-2" disabled={loading}>
                    {loading ? <span className="animate-pulse">جاري الإنشاء...</span> : <><UserPlus className="w-4 h-4" />إنشاء حساب</>}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Role icons legend */}
        <div className="flex justify-center gap-6 text-xs text-muted-foreground">
          {(Object.entries(ROLE_META) as [keyof typeof ROLE_META, typeof ROLE_META[keyof typeof ROLE_META]][]).map(([, meta]) => {
            const Icon = meta.icon;
            return (
              <div key={meta.label} className="flex items-center gap-1.5">
                <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                <span>{meta.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
