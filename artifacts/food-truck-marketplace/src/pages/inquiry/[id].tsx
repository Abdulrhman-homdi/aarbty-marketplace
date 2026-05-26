import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useGetFoodTruck,
  useCreateInquiry,
  getGetFoodTruckQueryKey,
  getListInquiriesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { MessageSquare, ArrowRight, CheckCircle, Truck, ShoppingBag, Key, UserCheck } from "lucide-react";

export default function InquiryForm() {
  const { id } = useParams<{ id: string }>();
  const truckId = parseInt(id, 10);
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: truck } = useGetFoodTruck(truckId, {
    query: { queryKey: getGetFoodTruckQueryKey(truckId), enabled: !!truckId },
  });

  const createMutation = useCreateInquiry();
  const [submitted, setSubmitted] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    message: "",
    type: "rent" as "sale" | "rent",
  });

  useEffect(() => {
    if (user && !autoFilled && !form.customerName) {
      setForm(prev => ({
        ...prev,
        customerName: user.name || prev.customerName,
        customerEmail: user.email || prev.customerEmail,
        customerPhone: user.phone || prev.customerPhone,
      }));
      setAutoFilled(true);
    }
  }, [user, autoFilled, form.customerName]);

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleAutoFill() {
    if (!user) return;
    setForm(prev => ({
      ...prev,
      customerName: user.name || prev.customerName,
      customerEmail: user.email || prev.customerEmail,
      customerPhone: user.phone || prev.customerPhone,
    }));
    setAutoFilled(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.customerName || !form.customerEmail) return;

    createMutation.mutate(
      {
        data: {
          truckId,
          customerName: form.customerName,
          customerEmail: form.customerEmail,
          customerPhone: form.customerPhone || undefined,
          message: form.message ? `[${form.type === "rent" ? "استئجار" : "شراء"}] ${form.message}` : undefined,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListInquiriesQueryKey() });
          setSubmitted(true);
        },
      }
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-black text-foreground mb-3">
            تم إرسال الاستفسار
          </h1>
          <p className="text-muted-foreground mb-2">
            شكراً لتواصلك معنا. سيتم إخطار مالك العربة بطلبك وسيرد عليك قريباً.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            ستتلقى إشعاراً على بريدك الإلكتروني عند تأكيد التوفر.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/trucks">
              <Button className="font-bold">تصفح المزيد من العربات</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="font-bold">الرئيسية</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <Link href={truck ? `/trucks/${truck.id}` : "/trucks"}>
          <Button variant="ghost" className="gap-2 mb-6">
            <ArrowRight className="w-4 h-4" />
            العودة للعربة
          </Button>
        </Link>

        {truck && (
          <Card className="mb-6 border-2 border-primary/20 bg-primary/5">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                <Truck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-black text-lg">{truck.name}</p>
                <p className="text-sm text-muted-foreground">
                  {truck.location} — {Number(truck.price).toLocaleString("ar-SA")} ريال
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              استفسار عن توفر العربة
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              أرسل استفساراً للمالك وسيردّ عليك في أقرب وقت
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="font-bold">نوع الطلب <span className="text-destructive">*</span></Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm(p => ({ ...p, type: "rent" }))}
                    className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 font-bold transition-all ${form.type === "rent" ? "border-primary bg-primary/10 text-primary" : "border-muted text-muted-foreground hover:border-primary/40"}`}
                  >
                    <Key className="w-5 h-5" />
                    استفسار عن إيجار
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(p => ({ ...p, type: "sale" }))}
                    className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 font-bold transition-all ${form.type === "sale" ? "border-primary bg-primary/10 text-primary" : "border-muted text-muted-foreground hover:border-primary/40"}`}
                  >
                    <ShoppingBag className="w-5 h-5" />
                    استفسار عن شراء
                  </button>
                </div>
              </div>
              {user && (
                <Button type="button" variant="outline" size="sm" onClick={handleAutoFill}
                  className={`gap-2 mb-2 ${autoFilled ? "bg-green-50 border-green-200 text-green-700" : ""}`}>
                  <UserCheck className="w-4 h-4" />
                  {autoFilled ? "تم التعبئة تلقائياً" : "تعبئة بياناتي تلقائياً"}
                </Button>
              )}
              <div className="space-y-2">
                <Label className="font-bold">
                  الاسم الكامل <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="أدخل اسمك الكامل"
                  value={form.customerName}
                  onChange={(e) => handleChange("customerName", e.target.value)}
                  required
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">
                  البريد الإلكتروني <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="email"
                  placeholder="example@email.com"
                  value={form.customerEmail}
                  onChange={(e) => handleChange("customerEmail", e.target.value)}
                  required
                  className="text-left"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">رقم الجوال</Label>
                <Input
                  type="tel"
                  placeholder="05xxxxxxxx"
                  value={form.customerPhone}
                  onChange={(e) => handleChange("customerPhone", e.target.value)}
                  className="text-left"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">رسالة الاستفسار</Label>
                <Textarea
                  placeholder="اكتب استفساراتك هنا، مثل: هل العربة متوفرة في تاريخ معين؟ ما هي إمكانية التفاوض على السعر؟"
                  value={form.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  rows={5}
                  className="text-right resize-none"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 font-bold text-lg"
                disabled={createMutation.isPending || !form.customerName || !form.customerEmail}
              >
                {createMutation.isPending ? "جاري الإرسال..." : "إرسال الاستفسار"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
