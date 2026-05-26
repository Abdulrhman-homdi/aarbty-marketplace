import { Link } from "wouter";
import { Truck, Phone, Mail, MapPin, Facebook, Twitter, Instagram } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export function Footer() {
  const { user, isAuthenticated } = useAuth();

  const portalLinks = [
    ...(user?.role === "provider" ? [{ href: "/provider", label: "بوابة مقدم الخدمة" }] : []),
    ...(user?.role === "customer" ? [{ href: "/my-account", label: "بوابة المستفيد" }] : []),
    ...(user?.role === "admin" ? [{ href: "/admin", label: "لوحة الإدارة" }] : []),
    ...(isAuthenticated ? [{ href: "/dashboard", label: "لوحة التحكم" }] : []),
  ];

  return (
    <footer className="bg-black text-white border-t border-primary/30 mt-auto">
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <img src="/logo.jpeg" alt="عربتي" className="w-12 h-12 rounded-xl object-cover" />
              <span className="text-2xl font-black text-primary">عربتي</span>
            </Link>
            <p className="text-gray-400 leading-relaxed text-sm">
              المنصة الأولى في المملكة العربية السعودية لبيع وتأجير عربات الفود ترك بكل ثقة وشفافية.
            </p>
            <div className="flex gap-3 pt-2">
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-primary hover:text-black transition-colors flex items-center justify-center">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-primary hover:text-black transition-colors flex items-center justify-center">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-primary hover:text-black transition-colors flex items-center justify-center">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-primary">روابط سريعة</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
              </li>
              <li>
                <Link href="/trucks" className="hover:text-primary transition-colors">تصفح العربات</Link>
              </li>
              <li>
                <Link href="/manufacture" className="hover:text-primary transition-colors">اصنع عربتك</Link>
              </li>
              {isAuthenticated && (
                <>
                  <li>
                    <Link href="/list-truck" className="hover:text-primary transition-colors">أضف عربتك</Link>
                  </li>
                  <li>
                    <Link href="/contracts" className="hover:text-primary transition-colors">العقود الرقمية</Link>
                  </li>
                  <li>
                    <Link href="/wallet" className="hover:text-primary transition-colors">المحفظة</Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Portals */}
          {portalLinks.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-primary">بوابات المستخدمين</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                {portalLinks.map(link => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:text-primary transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-primary">تواصل معنا</h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                <span>الرياض، المملكة العربية السعودية</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <span dir="ltr">+966 50 000 0000</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <span>info@arabati.sa</span>
              </li>
              <li className="flex items-center gap-3">
                <Truck className="w-4 h-4 text-primary flex-shrink-0" />
                <span>دعم فني 24/7</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-500 text-sm">
          <p>© 2026 عربتي. جميع الحقوق محفوظة.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary transition-colors">سياسة الخصوصية</a>
            <a href="#" className="hover:text-primary transition-colors">شروط الاستخدام</a>
            <a href="#" className="hover:text-primary transition-colors">سياسة الاسترداد</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
