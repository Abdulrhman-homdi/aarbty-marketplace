import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Store, Truck, Wallet, FileText, PlusCircle, Menu,
  ShieldCheck, User, ChevronDown
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [location] = useLocation();

  const mainLinks = [
    { href: "/", label: "الرئيسية", icon: Store },
    { href: "/trucks", label: "تصفح العربات", icon: Truck },
    { href: "/wallet", label: "المحفظة", icon: Wallet },
    { href: "/contracts", label: "العقود", icon: FileText },
  ];

  const portalLinks = [
    { href: "/provider", label: "بوابة مقدم الخدمة", icon: Truck },
    { href: "/my-account", label: "بوابة المستفيد", icon: User },
    { href: "/admin", label: "لوحة الإدارة", icon: ShieldCheck },
    { href: "/dashboard", label: "لوحة التحكم", icon: Store },
  ];

  const allLinks = [...mainLinks, ...portalLinks];

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

            {/* Portals Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`gap-2 text-muted-foreground ${portalLinks.some(p => p.href === location) ? "text-foreground font-bold" : ""}`}
                >
                  <User className="w-4 h-4" />
                  البوابات
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem asChild>
                  <Link href="/provider" className="flex items-center gap-2 cursor-pointer">
                    <Truck className="w-4 h-4 text-primary" />
                    بوابة مقدم الخدمة
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/my-account" className="flex items-center gap-2 cursor-pointer">
                    <User className="w-4 h-4 text-blue-500" />
                    بوابة المستفيد
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                    <Store className="w-4 h-4 text-muted-foreground" />
                    لوحة التحكم
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="flex items-center gap-2 cursor-pointer">
                    <ShieldCheck className="w-4 h-4 text-orange-500" />
                    لوحة الإدارة
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/list-truck" className="hidden md:block">
            <Button className="gap-2 font-bold shadow-md shadow-primary/20">
              <PlusCircle className="w-4 h-4" />
              أضف عربتك
            </Button>
          </Link>

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
                  <p className="text-xs text-muted-foreground font-bold px-2 mb-1">البوابات</p>
                  {portalLinks.map((link) => (
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
                    <Button className="w-full gap-2">
                      <PlusCircle className="w-5 h-5" />
                      أضف عربتك
                    </Button>
                  </Link>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
