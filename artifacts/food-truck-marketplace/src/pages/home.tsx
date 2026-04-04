import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useListFoodTrucks, useGetPlatformStats, getListFoodTrucksQueryKey, getGetPlatformStatsQueryKey } from "@workspace/api-client-react";
import { TruckCard } from "@/components/truck-card";
import { Search, TrendingUp, Store, FileText } from "lucide-react";

export default function Home() {
  const { data: stats } = useGetPlatformStats({ query: { queryKey: getGetPlatformStatsQueryKey() } });
  const { data: trucks } = useListFoodTrucks({}, { query: { queryKey: getListFoodTrucksQueryKey() } });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hero-bg.png" 
            alt="Food truck market" 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />
        </div>
        
        <div className="container relative z-10 mx-auto px-4 pt-20">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight animate-in fade-in slide-in-from-bottom-8 duration-700">
              <span className="text-primary block mb-2">سوق الفود ترك</span>
              المكان الأول لبيع وتأجير العربات في المملكة
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
              اكتشف مئات العربات الجاهزة للعمل، تواصل مع الملاك مباشرة، وابدأ مشروعك اليوم بكل ثقة وأمان.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              <div className="relative flex-1">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  placeholder="ابحث عن عربة، موقع، أو نشاط..." 
                  className="w-full h-14 pr-12 text-lg bg-background/95 border-none shadow-xl focus-visible:ring-primary rounded-xl"
                />
              </div>
              <Link href="/trucks">
                <Button size="lg" className="h-14 px-8 text-lg font-bold rounded-xl shadow-xl shadow-primary/20">
                  تصفح العربات
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Store className="w-6 h-6 text-primary" />
              </div>
              <div className="text-3xl font-black mb-1">{stats?.totalTrucks || "0"}</div>
              <div className="text-muted-foreground text-sm font-medium">عربة مسجلة</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div className="text-3xl font-black mb-1">{stats?.activeContracts || "0"}</div>
              <div className="text-muted-foreground text-sm font-medium">عقد نشط</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div className="text-3xl font-black mb-1">{stats?.totalInquiries || "0"}</div>
              <div className="text-muted-foreground text-sm font-medium">طلب استفسار</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Store className="w-6 h-6 text-primary" />
              </div>
              <div className="text-3xl font-black mb-1">{stats?.availableTrucks || "0"}</div>
              <div className="text-muted-foreground text-sm font-medium">عربة متاحة</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Trucks */}
      <section className="py-20 container mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-black mb-2">أحدث العربات</h2>
            <p className="text-muted-foreground">تصفح أحدث العربات المضافة للبيع أو الإيجار</p>
          </div>
          <Link href="/trucks">
            <Button variant="ghost" className="font-bold">
              عرض الكل
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {trucks?.slice(0, 8).map((truck, i) => (
            <TruckCard key={truck.id} truck={truck} delay={i * 100} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-black via-transparent to-transparent" />
        <div className="container relative mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-4xl font-black mb-6">هل تملك عربة فود ترك؟</h2>
          <p className="text-xl mb-10 opacity-90">
            انضم إلى أكبر منصة متخصصة في المملكة، واعرض عربتك للبيع أو الإيجار للآلاف من المهتمين.
          </p>
          <Link href="/list-truck">
            <Button size="lg" variant="secondary" className="h-14 px-8 text-lg font-bold rounded-xl shadow-2xl">
              أضف عربتك الآن
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}