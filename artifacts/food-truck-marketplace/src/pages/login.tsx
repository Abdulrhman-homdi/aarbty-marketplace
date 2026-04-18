import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth, type UserRole } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Truck, User, ShieldCheck, LogIn, Eye, EyeOff } from "lucide-react";

const ROLES: { role: UserRole; label: string; desc: string; icon: typeof Truck; color: string; demo: { user: string; pass: string } }[] = [
  {
    role: "provider",
    label: "مقدم الخدمة",
    desc: "صاحب عربة فود ترك يريد البيع أو التأجير",
    icon: Truck,
    color: "text-primary",
    demo: { user: "provider@arabati.sa", pass: "123456" },
  },
  {
    role: "customer",
    label: "المستفيد",
    desc: "عميل يبحث عن عربة للشراء أو الاستئجار",
    icon: User,
    color: "text-blue-500",
    demo: { user: "customer@arabati.sa", pass: "123456" },
  },
  {
    role: "admin",
    label: "مدير المنصة",
    desc: "إدارة ومراقبة كامل عمليات المنصة",
    icon: ShieldCheck,
    color: "text-orange-500",
    demo: { user: "admin@arabati.sa", pass: "admin123" },
  },
];

const ROLE_NAMES: Record<UserRole, string> = {
  provider: "مقدم الخدمة",
  customer: "المستفيد",
  admin: "مدير المنصة",
};

const VALID_CREDS: Record<string, { pass: string; role: UserRole; name: string }> = {
  "provider@arabati.sa": { pass: "123456", role: "provider", name: "صاحب العربات" },
  "customer@arabati.sa": { pass: "123456", role: "customer", name: "محمد العمري" },
  "admin@arabati.sa": { pass: "admin123", role: "admin", name: "مدير المنصة" },
};

export default function LoginPage() {
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function fillDemo(role: UserRole) {
    const r = ROLES.find(r => r.role === role)!;
    setEmail(r.demo.user);
    setPassword(r.demo.pass);
    setSelectedRole(role);
    setError("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const cred = VALID_CREDS[email.trim().toLowerCase()];
      if (!cred || cred.pass !== password) {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
        setLoading(false);
        return;
      }
      login({ name: cred.name, role: cred.role });
      const dest = cred.role === "provider" ? "/provider" : cred.role === "admin" ? "/admin" : "/my-account";
      navigate(dest);
    }, 600);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <img src="/logo.jpeg" alt="عربتي" className="w-16 h-16 rounded-2xl mx-auto mb-3 object-cover" />
          <h1 className="text-2xl font-black">تسجيل الدخول</h1>
          <p className="text-muted-foreground text-sm mt-1">اختر نوع حسابك للمتابعة</p>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-3 gap-3">
          {ROLES.map(({ role, label, icon: Icon, color, desc }) => (
            <button
              key={role}
              onClick={() => fillDemo(role)}
              className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${
                selectedRole === role
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 bg-card"
              }`}
            >
              <Icon className={`w-6 h-6 mx-auto mb-1.5 ${color}`} />
              <div className="text-xs font-bold leading-tight">{label}</div>
            </button>
          ))}
        </div>

        {selectedRole && (
          <p className="text-xs text-center text-muted-foreground bg-muted rounded-lg py-2 px-3">
            {ROLES.find(r => r.role === selectedRole)?.desc}
          </p>
        )}

        {/* Login form */}
        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-bold">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@arabati.sa"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="h-11"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-bold">كلمة المرور</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="h-11 pl-10"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full h-11 font-bold gap-2" disabled={loading}>
                {loading ? (
                  <span className="animate-pulse">جاري الدخول...</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    تسجيل الدخول
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo hint */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p className="font-bold">بيانات تجريبية — اضغط على نوع الحساب لملء البيانات تلقائياً</p>
          <div className="flex flex-col gap-0.5">
            {ROLES.map(r => (
              <span key={r.role}>{r.label}: <span dir="ltr" className="font-mono">{r.demo.user}</span> / {r.demo.pass}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
