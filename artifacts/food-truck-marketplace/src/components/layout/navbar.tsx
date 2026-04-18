import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Store, Truck, Wallet, FileText, PlusCircle, Menu,
  User, ChevronDown, LogOut, LogIn
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useAuth, type UserRole } from "@/context/auth-context";
import { Badge } from "@/components/ui/badge";

const ROLE_LABELS: Record<UserRole, string> = {
  provider: "مقدم الخدمة",
  customer: "المستفيد",
  admin: "مدير المنصة",
};

const ROLE_DEST: Record<UserRole, string> = {
  provider: "/provider",
  customer: "/my-account",
  admin: "/admin",
};

export function Navbar() {
  const [location, navigate] = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  const mainLinks = [
    { href: "/", label: "الرئيسية", icon: Store },
    { href: "/trucks", label: "تصفح العربات", icon: Truck },
    { href: "/wallet", label: "المحفظة", icon: Wallet },
    { href: "/contracts", label: "العقود", icon: FileText },
  ];

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.jpeg" alt="عربتي" className="w-11 h-11 rounded-xl object-cover" />
            <span className="font-black text-xl tracking-tight text-foreground">عربتي</span>
          </Link>

          <nav className="hidden md:flex items-center gap-0.5">
            {mainLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={location === link.href ? "secondary" : "ghost"}
                  className={`gap-2 ${location === link.href ? "font-bold" : "text-muted-foreground"}`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Button>
              </Link>
            ))}

          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/list-truck" className="hidden md:block">
            <Button className="gap-2 font-bold shadow-md shadow-primary/20">
              <PlusCircle className="w-4 h-4" />
              أضف عربتك
            </Button>
          </Link>

          {/* Auth button */}
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="hidden md:flex gap-2 items-center h-9 px-3">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-black" />
                  </div>
                  <span className="text-sm font-bold max-w-24 truncate">{user.name}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                  {ROLE_LABELS[user.role]}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={ROLE_DEST[user.role]} className="flex items-center gap-2 cursor-pointer font-bold">
                    <User className="w-4 h-4 text-primary" />
                    بوابتي
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-500 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login" className="hidden md:block">
              <Button variant="outline" className="gap-2 h-9 px-4">
                <LogIn className="w-4 h-4" />
                تسجيل الدخول
              </Button>
            </Link>
          )}

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-6 mt-8">
                <Link href="/" className="flex items-center gap-2 mb-2">
                  <img src="/logo.jpeg" alt="عربتي" className="w-10 h-10 rounded-xl object-cover" />
                  <span className="font-black text-lg">عربتي</span>
                </Link>

                {isAuthenticated && user && (
                  <div className="flex items-center gap-3 px-2 py-3 bg-primary/10 rounded-xl">
                    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                      <User className="w-4 h-4 text-black" />
                    </div>
                    <div>
                      <div className="font-bold text-sm">{user.name}</div>
                      <Badge variant="secondary" className="text-xs mt-0.5">{ROLE_LABELS[user.role]}</Badge>
                    </div>
                  </div>
                )}

                <nav className="flex flex-col gap-1">
                  <p className="text-xs text-muted-foreground font-bold px-2 mb-1">الرئيسية</p>
                  {mainLinks.map((link) => (
                    <Link key={link.href} href={link.href}>
                      <Button
                        variant={location === link.href ? "secondary" : "ghost"}
                        className="w-full justify-start gap-3"
                      >
                        <link.icon className="w-5 h-5" />
                        {link.label}
                      </Button>
                    </Link>
                  ))}

                  <div className="h-px bg-border my-3" />
                  <Link href="/list-truck">
                    <Button className="w-full gap-2 mb-2">
                      <PlusCircle className="w-5 h-5" />
                      أضف عربتك
                    </Button>
                  </Link>

                  {isAuthenticated ? (
                    <Button variant="outline" className="w-full gap-2 text-red-500 border-red-200" onClick={handleLogout}>
                      <LogOut className="w-4 h-4" />
                      تسجيل الخروج
                    </Button>
                  ) : (
                    <Link href="/login">
                      <Button variant="outline" className="w-full gap-2">
                        <LogIn className="w-4 h-4" />
                        تسجيل الدخول
                      </Button>
                    </Link>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
