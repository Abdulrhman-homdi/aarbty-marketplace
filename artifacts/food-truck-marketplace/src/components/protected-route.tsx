import { useLocation } from "wouter";
import { useAuth, type UserRole } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { LockKeyhole } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground text-sm">جاري التحقق...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 p-8">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <LockKeyhole className="w-10 h-10 text-primary" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black">هذه الصفحة محمية</h2>
          <p className="text-muted-foreground">يجب تسجيل الدخول للوصول إلى هذه البوابة</p>
        </div>
        <Button size="lg" className="h-12 px-8 font-bold gap-2" onClick={() => navigate("/login")}>
          تسجيل الدخول
        </Button>
      </div>
    );
  }

  if (requiredRole && user?.role !== requiredRole && user?.role !== "admin") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 p-8">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
          <LockKeyhole className="w-10 h-10 text-red-500" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black">غير مصرح لك</h2>
          <p className="text-muted-foreground">ليس لديك صلاحية الوصول إلى هذه البوابة</p>
        </div>
        <Button size="lg" variant="outline" className="h-12 px-8 font-bold" onClick={() => navigate("/")}>
          العودة للرئيسية
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
