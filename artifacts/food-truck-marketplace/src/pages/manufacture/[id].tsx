import { useParams, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetManufacturingOrder,
  useAcceptManufacturerQuote,
  getGetManufacturingOrderQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRight, Factory, CheckCircle2, Clock, FileText,
  Wrench, Truck, Phone, Mail, Package, Star, Loader2,
} from "lucide-react";

const STATUS_STEPS = [
  { key: "pending",   label: "استلام الطلب",   icon: CheckCircle2, color: "text-gray-500" },
  { key: "quoted",    label: "عروض الأسعار",   icon: FileText,     color: "text-blue-500" },
  { key: "accepted",  label: "اختيار المصنع",  icon: Star,         color: "text-yellow-500" },
  { key: "design",    label: "مرحلة التصميم",  icon: Factory,      color: "text-purple-500" },
  { key: "execution", label: "مرحلة التنفيذ",  icon: Wrench,       color: "text-orange-500" },
  { key: "delivery",  label: "التسليم",         icon: Truck,        color: "text-green-500" },
  { key: "completed", label: "مكتمل",           icon: CheckCircle2, color: "text-green-700" },
];

const STATUS_LABELS: Record<string, string> = {
  pending: "قيد الانتظار",
  quoted: "وردت عروض",
  accepted: "تم اختيار المصنع",
  design: "مرحلة التصميم",
  execution: "قيد التنفيذ",
  delivery: "في مرحلة التسليم",
  completed: "مكتمل",
};

const TRUCK_TYPE_LABELS: Record<string, string> = {
  food: "عربة طعام",
  beverages: "عربة مشروبات",
  custom: "عربة مخصصة",
};

const MATERIALS_LABELS: Record<string, string> = {
  steel: "ستيل",
  cladding: "كلادينق",
};

export default function ManufacturingOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const orderId = parseInt(id, 10);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: order, isLoading } = useGetManufacturingOrder(orderId, {
    query: { queryKey: getGetManufacturingOrderQueryKey(orderId), enabled: !!orderId },
  });

  const acceptMutation = useAcceptManufacturerQuote();

  function handleAccept(quoteId: number) {
    acceptMutation.mutate(
      { id: orderId, quoteId },
      {
        onSuccess: () => {
          toast({ title: "تم قبول العرض", description: "بدأت مرحلة التصميم" });
          qc.invalidateQueries({ queryKey: getGetManufacturingOrderQueryKey(orderId) });
        },
        onError: () => toast({ title: "خطأ", description: "حدث خطأ أثناء القبول", variant: "destructive" }),
      }
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full rounded-3xl" />
        <Skeleton className="h-48 w-full rounded-3xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-xl font-bold text-muted-foreground mb-4">الطلب غير موجود</p>
          <Link href="/manufacture"><Button>طلب جديد</Button></Link>
        </div>
      </div>
    );
  }

  const currentStepIdx = STATUS_STEPS.findIndex(s => s.key === order.status);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="container mx-auto px-4 py-10 max-w-3xl space-y-8">
        <div>
          <Link href="/manufacture">
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowRight className="w-4 h-4" /> العودة
            </Button>
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-black">طلب تصنيع</h1>
              <p className="text-muted-foreground font-mono">{order.orderNumber}</p>
            </div>
            <Badge className="text-sm px-4 py-1.5 font-bold">
              {STATUS_LABELS[order.status] ?? order.status}
            </Badge>
          </div>
        </div>

        {/* Timeline */}
        <Card className="border">
          <CardContent className="p-6">
            <h2 className="font-black mb-5">مراحل الطلب</h2>
            <div className="relative">
              <div className="flex items-start gap-0">
                {STATUS_STEPS.map((step, i) => {
                  const done = i <= currentStepIdx;
                  const active = i === currentStepIdx;
                  const Icon = step.icon;
                  return (
                    <div key={step.key} className="flex-1 flex flex-col items-center relative">
                      {i < STATUS_STEPS.length - 1 && (
                        <div className={`absolute top-4 right-1/2 w-full h-0.5 ${done ? "bg-primary" : "bg-muted"}`} style={{ zIndex: 0 }} />
                      )}
                      <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${active ? "border-primary bg-primary" : done ? "border-primary bg-primary/20" : "border-muted bg-muted"}`}>
                        <Icon className={`w-4 h-4 ${active ? "text-black" : done ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <p className={`text-[10px] font-bold mt-2 text-center leading-tight max-w-[60px] ${active ? "text-primary" : done ? "text-foreground" : "text-muted-foreground"}`}>
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card className="border">
          <CardContent className="p-6 space-y-5">
            <h2 className="font-black text-xl">تفاصيل الطلب</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-muted/30 rounded-xl">
                <p className="text-xs text-muted-foreground mb-1">نوع العربة</p>
                <p className="font-bold">{TRUCK_TYPE_LABELS[order.truckType] ?? order.truckType}</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-xl">
                <p className="text-xs text-muted-foreground mb-1">السعة</p>
                <p className="font-bold">{order.capacity}</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-xl">
                <p className="text-xs text-muted-foreground mb-1">المواد</p>
                <p className="font-bold">{MATERIALS_LABELS[order.materials] ?? order.materials}</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-xl">
                <p className="text-xs text-muted-foreground mb-1">لوحة إعلانية</p>
                <p className="font-bold">{order.hasSignage ? "نعم" : "لا"}</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-xl">
                <p className="text-xs text-muted-foreground mb-1">مواد تشغيلية</p>
                <p className="font-bold">{order.hasEquipment ? "نعم" : "لا"}</p>
              </div>
            </div>

            {order.equipmentDetails && (
              <div className="p-3 bg-muted/30 rounded-xl">
                <p className="text-xs text-muted-foreground mb-1">المواد التشغيلية المطلوبة</p>
                <p className="text-sm">{order.equipmentDetails}</p>
              </div>
            )}
            {order.additionalDetails && (
              <div className="p-3 bg-muted/30 rounded-xl">
                <p className="text-xs text-muted-foreground mb-1">تفاصيل إضافية</p>
                <p className="text-sm">{order.additionalDetails}</p>
              </div>
            )}
            {order.notes && (
              <div className="p-3 bg-muted/30 rounded-xl">
                <p className="text-xs text-muted-foreground mb-1">ملاحظات</p>
                <p className="text-sm">{order.notes}</p>
              </div>
            )}

            {/* Files */}
            {order.logoUrl && (
              <div className="space-y-2">
                <p className="text-sm font-bold text-muted-foreground">الشعار</p>
                <img src={order.logoUrl} alt="شعار" className="w-20 h-20 object-cover rounded-xl border" />
              </div>
            )}
            {order.filesUrls && order.filesUrls.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-bold text-muted-foreground">ملفات التصميم</p>
                <div className="flex flex-wrap gap-2">
                  {order.filesUrls.map((url, i) => (
                    <img key={i} src={url} alt={`ملف ${i + 1}`} className="w-20 h-20 object-cover rounded-xl border" />
                  ))}
                </div>
              </div>
            )}

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">اسم العميل</p>
                  <p className="font-bold">{order.customerName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">الجوال</p>
                  <p className="font-bold" dir="ltr">{order.customerPhone}</p>
                </div>
              </div>
              {order.customerEmail && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">البريد</p>
                    <p className="font-bold text-sm" dir="ltr">{order.customerEmail}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quotes */}
        {order.quotes && order.quotes.length > 0 && (
          <Card className="border">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-black text-xl">عروض الأسعار ({order.quotes.length})</h2>
              <div className="space-y-3">
                {order.quotes.map(quote => {
                  const isAccepted = quote.id === order.acceptedQuoteId || quote.status === "accepted";
                  const isRejected = quote.status === "rejected";
                  return (
                    <div key={quote.id} className={`p-5 rounded-2xl border-2 transition-all ${isAccepted ? "border-primary bg-primary/5" : isRejected ? "border-muted bg-muted/20 opacity-60" : "border-muted hover:border-primary/30"}`}>
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-black text-lg">{quote.manufacturerName}</p>
                            {isAccepted && (
                              <Badge className="gap-1 text-xs"><CheckCircle2 className="w-3 h-3" />مقبول</Badge>
                            )}
                            {isRejected && (
                              <Badge variant="secondary" className="text-xs opacity-70">مرفوض</Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                              <p className="text-xs text-muted-foreground">السعر</p>
                              <p className="text-2xl font-black text-primary">{Number(quote.price).toLocaleString("ar-SA")} <span className="text-sm font-normal">ريال</span></p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">مدة التنفيذ</p>
                              <p className="font-black">{quote.duration} <span className="text-sm font-normal">يوم</span></p>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{quote.details}</p>
                        </div>
                        {!isAccepted && !isRejected && order.status === "quoted" && (
                          <Button
                            size="sm"
                            className="font-bold gap-1.5 shrink-0"
                            onClick={() => handleAccept(quote.id)}
                            disabled={acceptMutation.isPending}
                          >
                            {acceptMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" />قبول العرض</>}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {order.status === "pending" && (
          <div className="text-center p-8 bg-muted/30 rounded-3xl border border-dashed">
            <Clock className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="font-bold text-muted-foreground">طلبك قيد المراجعة من المصنعين</p>
            <p className="text-sm text-muted-foreground mt-1">ستصلك عروض الأسعار قريباً</p>
          </div>
        )}
      </div>
    </div>
  );
}

