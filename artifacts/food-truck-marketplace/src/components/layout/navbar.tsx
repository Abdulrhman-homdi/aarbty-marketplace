import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Store, Truck, Wallet, FileText, PlusCircle, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const [location] = useLocation();

  const navLinks = [
    { href: "/", label: "الرئيسية", icon: Store },
    { href: "/trucks", label: "تصفح العربات", icon: Truck },
    { href: "/dashboard", label: "لوحة التحكم", icon: Wallet },
    { href: "/contracts", label: "العقود", icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.jpeg" alt="عربتي" className="w-12 h-12 rounded-xl object-cover" />
            <span className="font-black text-xl tracking-tight text-foreground">
              عربتي
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
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

        <div className="flex items-center gap-4">
          <Link href="/list-truck" className="hidden md:block">
            <Button className="gap-2 font-bold shadow-md shadow-primary/20">
              <PlusCircle className="w-4 h-4" />
              أضف عربتك
            </Button>
          </Link>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-6 mt-8">
                <nav className="flex flex-col gap-2">
                  {navLinks.map((link) => (
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
                  <div className="h-px bg-border my-2" />
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