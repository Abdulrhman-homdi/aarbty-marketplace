import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useCreateManufacturingOrder } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, ImagePlus, X, Factory, CheckCircle2, FileText, Wrench } from "lucide-react";

const TRUCK_TYPES = [
  { value: "food", label: "عربة طعام (Food Truck)", icon: "🍔" },
  { value: "beverages", label: "عربة مشروبات (Beverage Truck)", icon: "☕" },
  { value: "custom", label: "عربة مخصصة (Custom Truck)", icon: "🛠️" },
];

const STATUS_STEPS = [
  { key: "pending", label: "استلام الطلب", icon: CheckCircle2 },
  { key: "quoted", label: "عروض الأسعار", icon: FileText },
  { key: "design", label: "مرحلة التصميم", icon: Factory },
  { key: "execution", label: "مرحلة التنفيذ", icon: Wrench },
  { key: "delivery", label: "مرحلة التسليم", icon: CheckCircle2 },
];

export default function ManufacturePage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const createOrder = useCreateManufacturingOrder();
  const logoRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef<HTMLInputElement>(null);

  const [truckType, setTruckType] = useState("");
  const [capacity, setCapacity] = useState("");
  const [materials, setMaterials] = useState("");
  const [materialsOther, setMaterialsOther] = useState("");
  const [hasSignage, setHasSignage] = useState(false);
  const [hasEquipment, setHasEquipment] = useState(false);
  const [equipmentDetails, setEquipmentDetails] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [notes, setNotes] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [filesUrls, setFilesUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [orderNum, setOrderNum] = useState("");

  async function uploadFile(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("image", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) throw new Error("فشل الرفع");
    const j = await res.json();
    return j.url;
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file);
      setLogoUrl(url);
    } catch { toast({ title: "خطأ", description: "فشل رفع الشعار", variant: "destructive" }); }
    finally { setUploading(false); if (logoRef.current) logoRef.current.value = ""; }
  }

  async function handleFilesUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all(files.map(uploadFile));
      setFilesUrls(prev => [...prev, ...urls]);
    } catch { toast({ title: "خطأ", description: "فشل رفع الملفات", variant: "destructive" }); }
    finally { setUploading(false); if (filesRef.current) filesRef.current.value = ""; }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!truckType || !capacity || !customerName || !customerPhone) {
      toast({ title: "تنبيه", description: "يرجى تعبئة الحقول المطلوبة", variant: "destructive" });
      return;
    }
    const finalMaterials = materials === "other" ? (materialsOther || "أخرى") : materials;
    createOrder.mutate(
      {
        data: {
          truckType: truckType as "food" | "beverages" | "custom",
          capacity,
          materials: finalMaterials,
          hasSignage,
          hasEquipment,
          equipmentDetails: hasEquipment ? equipmentDetails : undefined,
          additionalDetails: additionalDetails || undefined,
          logoUrl: logoUrl || undefined,
          filesUrls,
          notes: notes || undefined,
          customerName,
          customerPhone,
          customerEmail: customerEmail || undefined,
        },
      },
      {
        onSuccess: (order) => {
          setOrderNum(order.orderNumber);
          setSubmitted(true);
        },
        onError: () => toast({ title: "خطأ", description: "حدث خطأ أثناء الإرسال", variant: "destructive" }),
      }
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
        <div className="max-w-lg w-full text-center space-y-6">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-3xl font-black">تم استلام طلبك!</h1>
          <div className="p-4 bg-muted rounded-2xl">
            <p className="text-muted-foreground text-sm mb-1">رقم الطلب</p>
            <p className="text-2xl font-black tracking-widest text-primary">{orderNum}</p>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            سيتم إشعارك بعروض الأسعار من المصنعين في أقرب وقت. احتفظ برقم طلبك للمتابعة.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate("/manufacture")} variant="outline">طلب جديد</Button>
            <Button onClick={() => navigate("/")}>العودة للرئيسية</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Hero */}
      <div className="bg-black text-white py-14 border-b border-primary/30">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 text-primary text-sm font-bold mb-4 bg-primary/10 px-4 py-2 rounded-full">
            <Factory className="w-4 h-4" /> منصة التصنيع
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">اصنع عربتك</h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            صمّم عربتك بالمواصفات الي تبي، وانتظر عروض الأسعار من أفضل المصانع في المملكة
          </p>
          {/* Steps */}
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            {STATUS_STEPS.map((step, i) => (
              <div key={step.key} className="flex items-center gap-2 text-sm text-gray-400">
                <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-black">
                  {i + 1}
                </div>
                {step.label}
                {i < STATUS_STEPS.length - 1 && <span className="text-gray-600 mx-1">←</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* نوع العربة */}
          <div className="bg-card p-6 rounded-3xl border shadow-sm space-y-4">
            <h2 className="text-xl font-black flex items-center gap-2"><span className="w-8 h-8 bg-primary text-black rounded-xl flex items-center justify-center text-sm font-black">١</span> نوع العربة</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {TRUCK_TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTruckType(t.value)}
                  className={`p-4 rounded-2xl border-2 text-right transition-all flex flex-col gap-2 ${truckType === t.value ? "border-primary bg-primary/5" : "border-muted hover:border-primary/40"}`}
                >
                  <span className="text-2xl">{t.icon}</span>
                  <span className="font-bold text-sm leading-tight">{t.label}</span>
                </button>
              ))}
            </div>
            {!truckType && <p className="text-xs text-red-500">* مطلوب</p>}
          </div>

          {/* المواصفات */}
          <div className="bg-card p-6 rounded-3xl border shadow-sm space-y-5">
            <h2 className="text-xl font-black flex items-center gap-2"><span className="w-8 h-8 bg-primary text-black rounded-xl flex items-center justify-center text-sm font-black">٢</span> تخصيص العربة</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="font-bold">السعة *</Label>
                <Select value={capacity} onValueChange={setCapacity}>
                  <SelectTrigger><SelectValue placeholder="اختر السعة" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2-4">٢ - ٤ أشخاص</SelectItem>
                    <SelectItem value="2-6">٢ - ٦ أشخاص</SelectItem>
                    <SelectItem value="other">أخرى (حدد في التفاصيل)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-bold">نوع المواد *</Label>
                <Select value={materials} onValueChange={setMaterials}>
                  <SelectTrigger><SelectValue placeholder="اختر المواد" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="steel">ستيل (Steel)</SelectItem>
                    <SelectItem value="cladding">كلادينق (Cladding)</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent>
                </Select>
                {materials === "other" && (
                  <Input placeholder="حدد نوع المواد..." value={materialsOther} onChange={e => setMaterialsOther(e.target.value)} className="mt-2" />
                )}
              </div>
            </div>

            <div className="flex flex-col gap-5 p-5 bg-muted/40 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-bold text-base">لوحة إعلانية</Label>
                  <p className="text-sm text-muted-foreground">هل ترغب في إضافة لوحة إعلانية؟</p>
                </div>
                <Switch checked={hasSignage} onCheckedChange={setHasSignage} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-bold text-base">المواد التشغيلية</Label>
                  <p className="text-sm text-muted-foreground">هل تريد توفير المواد التشغيلية؟</p>
                </div>
                <Switch checked={hasEquipment} onCheckedChange={setHasEquipment} />
              </div>
            </div>

            {hasEquipment && (
              <div className="space-y-2">
                <Label className="font-bold">حدد المواد التشغيلية المطلوبة</Label>
                <Textarea
                  rows={3}
                  placeholder="مثال: فريزر، شاشة، نظام POS، مولد كهربائي..."
                  value={equipmentDetails}
                  onChange={e => setEquipmentDetails(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label className="font-bold">تفاصيل إضافية</Label>
              <Textarea
                rows={3}
                placeholder="أي تفاصيل إضافية عن التصميم أو المواصفات..."
                value={additionalDetails}
                onChange={e => setAdditionalDetails(e.target.value)}
              />
            </div>
          </div>

          {/* رفع الملفات */}
          <div className="bg-card p-6 rounded-3xl border shadow-sm space-y-5">
            <h2 className="text-xl font-black flex items-center gap-2"><span className="w-8 h-8 bg-primary text-black rounded-xl flex items-center justify-center text-sm font-black">٣</span> رفع الملفات</h2>

            {/* Logo */}
            <div className="space-y-3">
              <Label className="font-bold">شعار العلامة التجارية</Label>
              <div className="flex items-center gap-4">
                {logoUrl ? (
                  <div className="relative group w-20 h-20 rounded-xl overflow-hidden border-2 border-primary/30">
                    <img src={logoUrl} alt="شعار" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setLogoUrl("")} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => logoRef.current?.click()} disabled={uploading}
                    className="w-20 h-20 rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50">
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ImagePlus className="w-5 h-5" /><span className="text-[10px] font-bold">الشعار</span></>}
                  </button>
                )}
                <p className="text-xs text-muted-foreground">ارفع شعار علامتك التجارية (PNG/JPG)</p>
              </div>
              <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </div>

            {/* Design files */}
            <div className="space-y-3">
              <Label className="font-bold">ملفات التصميم</Label>
              <div className="flex flex-wrap gap-3">
                {filesUrls.map((url, i) => (
                  <div key={i} className="relative group w-20 h-20 rounded-xl overflow-hidden border-2 border-muted">
                    <img src={url} alt={`ملف ${i + 1}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setFilesUrls(prev => prev.filter((_, j) => j !== i))}
                      className="absolute top-1 left-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => filesRef.current?.click()} disabled={uploading}
                  className="w-20 h-20 rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50">
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Upload className="w-5 h-5" /><span className="text-[10px] font-bold">رفع</span></>}
                </button>
              </div>
              <input ref={filesRef} type="file" accept="image/*,application/pdf" multiple className="hidden" onChange={handleFilesUpload} />
              <p className="text-xs text-muted-foreground">صور أو ملفات PDF توضح التصميم المطلوب</p>
            </div>

            <div className="space-y-2">
              <Label className="font-bold">ملاحظات إضافية</Label>
              <Textarea rows={3} placeholder="أي ملاحظات تريد إيصالها للمصنع..." value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
          </div>

          {/* بيانات التواصل */}
          <div className="bg-card p-6 rounded-3xl border shadow-sm space-y-5">
            <h2 className="text-xl font-black flex items-center gap-2"><span className="w-8 h-8 bg-primary text-black rounded-xl flex items-center justify-center text-sm font-black">٤</span> بيانات التواصل</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="font-bold">الاسم الكامل *</Label>
                <Input placeholder="اسمك الكامل" value={customerName} onChange={e => setCustomerName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">رقم الجوال *</Label>
                <Input placeholder="05xxxxxxxx" dir="ltr" className="text-right" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-bold">البريد الإلكتروني (اختياري)</Label>
              <Input type="email" placeholder="example@email.com" dir="ltr" className="text-right" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} />
            </div>
          </div>

          {/* Submit */}
          <Button type="submit" size="lg" className="w-full h-16 text-xl font-black gap-3" disabled={createOrder.isPending || uploading}>
            {createOrder.isPending ? (
              <><Loader2 className="w-6 h-6 animate-spin" /> جاري الإرسال...</>
            ) : (
              <><Factory className="w-6 h-6" /> أرسل طلبك الآن</>
            )}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            ارسل طلبك وانتظر عروض الأسعار من المصنعين 🏭
          </p>
        </form>
      </div>
    </div>
  );
}
