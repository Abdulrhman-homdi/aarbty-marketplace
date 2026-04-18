import { useParams, Link } from "wouter";
import { useGetFoodTruck, getGetFoodTruckQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { MapPin, Users, Store, Tag, CheckCircle2, Maximize, Ruler, CircleUser, ChevronRight } from "lucide-react";

export default function TruckDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0");
  
  const { data: truck, isLoading } = useGetFoodTruck(id, { 
    query: { enabled: !!id, queryKey: getGetFoodTruckQueryKey(id) } 
  });

  if (isLoading) {
    return <div className="container mx-auto px-4 py-12"><Skeleton className="h-[500px] w-full rounded-2xl" /></div>;
  }

  if (!truck) {
    return <div className="container mx-auto px-4 py-24 text-center">عربة غير موجودة</div>;
  }

  return (
    <div className="bg-background pb-20">
      {/* Gallery Header */}
      <div className="h-[40vh] md:h-[60vh] bg-muted relative">
        <img 
          src={truck.images?.[0] || "/images/truck-burger.png"} 
          alt={truck.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-8">
          <div className="flex gap-2 mb-4">
            <Badge className="bg-primary text-primary-foreground text-lg px-4 py-1.5 font-bold shadow-lg">
              {truck.listingType === "sale" ? "للبيع" : "للإيجار"}
            </Badge>
            {truck.licensed && (
              <Badge variant="secondary" className="bg-white text-black text-lg px-4 py-1.5 font-bold shadow-lg">
                مرخصة
              </Badge>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-2">{truck.name}</h1>
          <div className="flex items-center text-muted-foreground text-lg gap-2">
            <MapPin className="w-5 h-5" />
            {truck.location}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-card p-8 rounded-2xl border shadow-sm">
              <h2 className="text-2xl font-bold mb-6">الوصف</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {truck.description || "لا يوجد وصف."}
              </p>
            </section>

            <section className="bg-card p-8 rounded-2xl border shadow-sm">
              <h2 className="text-2xl font-bold mb-6">المواصفات</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <span className="text-muted-foreground flex items-center gap-2"><Store className="w-4 h-4"/> النشاط</span>
                  <span className="font-bold">{truck.activityType === "food" ? "أطعمة" : "مشروبات"}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-muted-foreground flex items-center gap-2"><Users className="w-4 h-4"/> السعة</span>
                  <span className="font-bold">{truck.capacity === "one" ? "شخص واحد" : truck.capacity === "two" ? "شخصين" : "٣+ أشخاص"}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-muted-foreground flex items-center gap-2"><Ruler className="w-4 h-4"/> الأبعاد</span>
                  <span className="font-bold" dir="ltr">{truck.dimensions || "غير محدد"}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-muted-foreground flex items-center gap-2"><Maximize className="w-4 h-4"/> المعدات</span>
                  <span className="font-bold flex items-center gap-1">
                    {truck.withEquipment ? <><CheckCircle2 className="w-4 h-4 text-green-500"/> متوفرة</> : "غير متوفرة"}
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* Action Sidebar */}
          <div className="space-y-6">
            <div className="bg-card p-8 rounded-2xl border shadow-xl sticky top-24">
              <div className="text-center pb-6 border-b mb-6">
                <div className="text-muted-foreground mb-2">السعر المطلوب</div>
                <div className="text-4xl font-black text-primary flex justify-center items-baseline gap-2">
                  {truck.price.toLocaleString("ar-SA")} <span className="text-xl text-foreground font-bold">ريال</span>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center">
                  <CircleUser className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">المالك</div>
                  <div className="font-bold text-lg">{truck.ownerName}</div>
                </div>
              </div>

              <Link href={`/inquiry/${truck.id}`}>
                <Button size="lg" className="w-full h-14 text-lg font-bold">
                  تواصل مع المالك
                </Button>
              </Link>
              
              <p className="text-center text-sm text-muted-foreground mt-4">
                الدفع يتم عبر منصة عربتي لضمان حقوقك
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}