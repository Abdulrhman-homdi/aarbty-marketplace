import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
import { apiLogin, apiRegister, apiSendOtp, apiVerifyOtp, apiResendVerification, apiVerifyEmail, type AuthUser } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, User, ShieldCheck, LogIn, Eye, EyeOff, UserPlus, Smartphone, Mail, ChevronRight, CheckCircle2 } from "lucide-react";

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

  // 2FA state
  const [twoFactorMethods, setTwoFactorMethods] = useState<("email" | "sms")[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<"email" | "sms">("email");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [pendingAuthToken, setPendingAuthToken] = useState<string | undefined>(undefined);

  // Email verification state
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [verifySent, setVerifySent] = useState(true);

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
      const res = await apiLogin(loginEmail, loginPass);
      if (res.requiresEmailVerification) {
        setNeedsEmailVerification(true);
        setVerifySent(true);
        setPendingAuthToken(res.pendingAuthToken);
        return;
      }
      if (res.requiresTwoFactor && res.methods) {
        setTwoFactorMethods(res.methods);
        setSelectedMethod(res.methods[0] ?? "email");
        setPendingAuthToken(res.pendingAuthToken);
        return;
      }
      handleSuccess(res as AuthUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendOtp() {
    setError("");
    setLoading(true);
    try {
      await apiSendOtp(selectedMethod, pendingAuthToken);
      setOtpSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const u = await apiVerifyOtp(otpCode, selectedMethod, pendingAuthToken);
      handleSuccess(u);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  }

  function handleRegister(e: React.FormEvent) {
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
    apiRegister({ name: regName, email: regEmail, password: regPass, role: regRole, phone: regPhone || undefined })
      .then(res => {
        if (res.requiresEmailVerification) {
          setNeedsEmailVerification(true);
          setVerifySent(true);
          setPendingAuthToken(res.pendingAuthToken);
        } else {
          handleSuccess(res as AuthUser);
        }
      })
      .catch(err => setError(err instanceof Error ? err.message : "حدث خطأ"))
      .finally(() => setLoading(false));
  }

  async function handleVerifyEmail(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const u = await apiVerifyEmail(verifyCode, pendingAuthToken);
      handleSuccess(u);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendVerify() {
    setError("");
    setLoading(true);
    try {
      await apiResendVerification(pendingAuthToken);
      setError("تم إعادة إرسال كود التحقق");
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  }

  function resetLogin() {
    setTwoFactorMethods([]);
    setOtpSent(false);
    setOtpCode("");
    setPendingAuthToken(undefined);
    setError("");
  }

  // ── Email verification screen ──
  if (needsEmailVerification) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <img src="/logo.jpeg" alt="عربتي" className="w-16 h-16 rounded-2xl mx-auto mb-3 object-cover" />
            <h1 className="text-2xl font-black">تأكيد البريد الإلكتروني</h1>
            <p className="text-muted-foreground text-sm mt-1">تم إنشاء حسابك بنجاح! أدخل كود التحقق المرسل إلى بريدك</p>
          </div>

          <Card className="border shadow-sm">
            <CardContent className="pt-6 space-y-4">
              {verifySent && (
                <form onSubmit={handleVerifyEmail} className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="w-7 h-7 text-green-600" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      تم إرسال كود التحقق إلى بريدك الإلكتروني
                    </p>
                  </div>

                  <div>
                    <Label className="font-bold block text-center mb-2">كود التحقق</Label>
                    <Input type="text" inputMode="numeric" maxLength={6}
                      placeholder="••••••" dir="ltr" className="h-14 text-center text-2xl font-bold tracking-[8px]"
                      value={verifyCode} onChange={e => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))} required />
                  </div>

                  {error && <p className={`text-sm rounded-lg px-3 py-2 text-center ${error.includes("تم") ? "text-green-600 bg-green-50 border-green-200" : "text-red-500 bg-red-50 border-red-200"} border`}>{error}</p>}

                  <Button type="submit" className="w-full h-11 font-bold gap-2" disabled={loading || verifyCode.length < 6}>
                    {loading ? "جاري التحقق..." : <><ShieldCheck className="w-4 h-4" />تأكيد البريد</>}
                  </Button>

                  <div className="text-center">
                    <button type="button" onClick={handleResendVerify} className="text-sm text-primary hover:underline" disabled={loading}>
                      إعادة إرسال الكود
                    </button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ── 2FA verify screen ──
  if (twoFactorMethods.length > 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <img src="/logo.jpeg" alt="عربتي" className="w-16 h-16 rounded-2xl mx-auto mb-3 object-cover" />
            <h1 className="text-2xl font-black">التحقق الثنائي</h1>
            <p className="text-muted-foreground text-sm mt-1">أدخل كود التحقق المرسل إليك</p>
          </div>

          <Card className="border shadow-sm">
            <CardContent className="pt-6 space-y-4">
              {!otpSent ? (
                <>
                  <Label className="font-bold block mb-2">اختر طريقة التحقق</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {twoFactorMethods.includes("email") && (
                      <button type="button" onClick={() => setSelectedMethod("email")}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${selectedMethod === "email" ? "border-primary bg-primary/5" : "border-border"}`}>
                        <Mail className="w-6 h-6 mx-auto mb-1 text-primary" />
                        <div className="text-xs font-bold">البريد الإلكتروني</div>
                      </button>
                    )}
                    {twoFactorMethods.includes("sms") && (
                      <button type="button" onClick={() => setSelectedMethod("sms")}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${selectedMethod === "sms" ? "border-primary bg-primary/5" : "border-border"}`}>
                        <Smartphone className="w-6 h-6 mx-auto mb-1 text-primary" />
                        <div className="text-xs font-bold">رسالة جوال</div>
                      </button>
                    )}
                  </div>

                  {error && <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">{error}</p>}

                  <Button onClick={handleSendOtp} className="w-full h-11 font-bold gap-2" disabled={loading}>
                    {loading ? "جاري الإرسال..." : <><Mail className="w-4 h-4" />إرسال كود التحقق</>}
                  </Button>
                  <Button variant="ghost" onClick={resetLogin} className="w-full gap-1 text-sm">
                    <ChevronRight className="w-3 h-3" />العودة لتسجيل الدخول
                  </Button>
                </>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      {selectedMethod === "email" ? <Mail className="w-7 h-7 text-primary" /> : <Smartphone className="w-7 h-7 text-primary" />}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      تم إرسال كود التحقق إلى {selectedMethod === "email" ? "بريدك الإلكتروني" : "جوالك"}
                    </p>
                  </div>

                  <div>
                    <Label className="font-bold block text-center mb-2">كود التحقق</Label>
                    <Input type="text" inputMode="numeric" maxLength={6}
                      placeholder="••••••" dir="ltr" className="h-14 text-center text-2xl font-bold tracking-[8px]"
                      value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))} required />
                  </div>

                  {error && <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">{error}</p>}

                  <Button type="submit" className="w-full h-11 font-bold gap-2" disabled={loading || otpCode.length < 6}>
                    {loading ? "جاري التحقق..." : <><ShieldCheck className="w-4 h-4" />تحقق</>}
                  </Button>

                  <div className="text-center">
                    <button type="button" onClick={handleSendOtp} className="text-sm text-primary hover:underline">
                      إعادة إرسال الكود
                    </button>
                  </div>

                  <Button variant="ghost" type="button" onClick={resetLogin} className="w-full gap-1 text-sm">
                    <ChevronRight className="w-3 h-3" />العودة لتسجيل الدخول
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
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
      </div>
    </div>
  );
}
