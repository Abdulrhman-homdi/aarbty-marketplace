import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ImagePlus, X, Loader2, Upload } from "lucide-react";

export const truckFormSchema = z.object({
  name: z.string().min(3, "الاسم مطلوب"),
  activityType: z.enum(["food", "beverages"]),
  capacity: z.enum(["one", "two", "more"]),
  dimensions: z.string().optional(),
  operatorsCount: z.coerce.number().optional(),
  withEquipment: z.boolean(),
  licensed: z.boolean(),
  location: z.string().min(2, "المدينة مطلوبة"),
  price: z.coerce.number().min(1, "السعر مطلوب"),
  listingType: z.enum(["sale", "rent"]),
  ownerName: z.string().min(3, "اسم المالك مطلوب"),
  description: z.string().optional(),
});

export type TruckFormValues = z.infer<typeof truckFormSchema>;

interface TruckFormProps {
  defaultValues?: Partial<TruckFormValues>;
  initialImages?: string[];
  onSubmit: (data: TruckFormValues, images: string[]) => void;
  isPending: boolean;
  submitLabel: string;
}

export function TruckForm({ defaultValues, initialImages = [], onSubmit, isPending, submitLabel }: TruckFormProps) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const form = useForm<TruckFormValues>({
    resolver: zodResolver(truckFormSchema),
    defaultValues: {
      name: "",
      activityType: "food",
      capacity: "one",
      withEquipment: false,
      licensed: false,
      location: "",
      price: 0,
      listingType: "sale",
      ownerName: "",
      description: "",
      ...defaultValues,
    },
  });

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("image", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) throw new Error("فشل الرفع");
        const json = await res.json();
        setImages((prev) => [...prev, json.url]);
      }
    } catch {
      alert("حدث خطأ أثناء رفع الصورة");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((i) => i !== url));
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => onSubmit(data, images))} className="space-y-8 bg-card p-8 rounded-3xl border shadow-sm" dir="rtl">

        {/* Images Upload */}
        <div className="space-y-3">
          <label className="text-sm font-bold">صور العربة</label>
          <div className="flex flex-wrap gap-3">
            {images.map((url) => (
              <div key={url} className="relative group w-28 h-28 rounded-xl overflow-hidden border-2 border-muted">
                <img src={url} alt="صورة العربة" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute top-1 left-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-28 h-28 rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <ImagePlus className="w-6 h-6" />
                    <span className="text-xs font-bold">إضافة صورة</span>
                  </>
                )}
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <p className="text-xs text-muted-foreground">الحد الأقصى ٥ صور، بحجم ٥ ميغابايت لكل صورة (JPG/PNG/WEBP)</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>اسم العربة / العلامة التجارية</FormLabel>
              <FormControl><Input placeholder="مثال: برجر ستيشن" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="ownerName" render={({ field }) => (
            <FormItem>
              <FormLabel>اسم المالك</FormLabel>
              <FormControl><Input placeholder="الاسم الكامل" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField control={form.control} name="listingType" render={({ field }) => (
            <FormItem>
              <FormLabel>نوع العرض</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="sale">للبيع</SelectItem>
                  <SelectItem value="rent">للإيجار</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="price" render={({ field }) => (
            <FormItem>
              <FormLabel>السعر بالريال</FormLabel>
              <FormControl><Input type="number" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField control={form.control} name="activityType" render={({ field }) => (
            <FormItem>
              <FormLabel>النشاط</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="food">أطعمة</SelectItem>
                  <SelectItem value="beverages">مشروبات</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="location" render={({ field }) => (
            <FormItem>
              <FormLabel>المدينة</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="اختر المدينة" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="الرياض">الرياض</SelectItem>
                  <SelectItem value="جدة">جدة</SelectItem>
                  <SelectItem value="الدمام">الدمام</SelectItem>
                  <SelectItem value="مكة المكرمة">مكة المكرمة</SelectItem>
                  <SelectItem value="المدينة المنورة">المدينة المنورة</SelectItem>
                  <SelectItem value="أبها">أبها</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField control={form.control} name="capacity" render={({ field }) => (
            <FormItem>
              <FormLabel>السعة (العمالة)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="one">شخص واحد</SelectItem>
                  <SelectItem value="two">شخصين</SelectItem>
                  <SelectItem value="more">٣ أشخاص فأكثر</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="dimensions" render={({ field }) => (
            <FormItem>
              <FormLabel>الأبعاد (اختياري)</FormLabel>
              <FormControl><Input placeholder="مثال: 3x2 متر" dir="ltr" className="text-right" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="flex flex-col md:flex-row gap-8 p-6 bg-muted rounded-xl">
          <FormField control={form.control} name="withEquipment" render={({ field }) => (
            <FormItem className="flex items-center gap-4 space-y-0">
              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              <div className="space-y-1">
                <FormLabel className="text-base">تشمل المعدات</FormLabel>
                <p className="text-sm text-muted-foreground">العربة مجهزة للعمل</p>
              </div>
            </FormItem>
          )} />
          <FormField control={form.control} name="licensed" render={({ field }) => (
            <FormItem className="flex items-center gap-4 space-y-0">
              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              <div className="space-y-1">
                <FormLabel className="text-base">مرخصة</FormLabel>
                <p className="text-sm text-muted-foreground">توجد رخصة بلدية سارية</p>
              </div>
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>تفاصيل إضافية</FormLabel>
            <FormControl><Textarea rows={4} placeholder="اذكر تفاصيل المعدات، حالة العربة، وأي معلومات أخرى..." {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <Button type="submit" size="lg" className="w-full h-14 text-lg font-bold" disabled={isPending || uploading}>
          {isPending ? (
            <><Loader2 className="w-5 h-5 ml-2 animate-spin" /> جاري الحفظ...</>
          ) : (
            <><Upload className="w-5 h-5 ml-2" /> {submitLabel}</>
          )}
        </Button>
      </form>
    </Form>
  );
}
