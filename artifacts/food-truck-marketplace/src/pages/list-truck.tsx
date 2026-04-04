import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateFoodTruck } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Store, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
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

export default function ListTruck() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createTruck = useCreateFoodTruck();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
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
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createTruck.mutate(
      { data },
      {
        onSuccess: (res) => {
          toast({ title: "تمت الإضافة بنجاح", description: "تم عرض عربتك في السوق" });
          setLocation(`/trucks/${res.id}`);
        },
        onError: () => {
          toast({ title: "خطأ", description: "حدث خطأ أثناء الإضافة", variant: "destructive" });
        }
      }
    );
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-10 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl mx-auto flex items-center justify-center mb-6">
          <Store className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-black mb-4">أضف عربتك للسوق</h1>
        <p className="text-muted-foreground text-lg">أدخل بيانات عربتك لعرضها للبيع أو الإيجار</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 bg-card p-8 rounded-3xl border shadow-sm">
          
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="اختر المدينة" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="الرياض">الرياض</SelectItem>
                    <SelectItem value="جدة">جدة</SelectItem>
                    <SelectItem value="الدمام">الدمام</SelectItem>
                    <SelectItem value="مكة المكرمة">مكة المكرمة</SelectItem>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              <FormControl><Textarea rows={4} placeholder="اذكر تفاصيل المعدات، حالة العربة، وأي معلومات أخرى تهم المشتري..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <Button type="submit" size="lg" className="w-full h-14 text-lg font-bold" disabled={createTruck.isPending}>
            {createTruck.isPending ? "جاري النشر..." : "نشر العربة"}
          </Button>
        </form>
      </Form>
    </div>
  );
}