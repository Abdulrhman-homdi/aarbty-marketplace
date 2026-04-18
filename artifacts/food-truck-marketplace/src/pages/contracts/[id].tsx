import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  useGetContract,
  getGetContractQueryKey,
} from "@workspace/api-client-react";
import { FileText, ArrowRight, Printer, User, Truck, DollarSign, Calendar, CalendarRange, ListOrdered, CheckCircle2, Clock } from "lucide-react";

export default function ContractDetail() {
  const { id } = useParams<{ id: string }>();
  const contractId = parseInt(id, 10);

  const { data: contract, isLoading } = useGetContract(contractId, {
    query: { queryKey: getGetContractQueryKey(contractId), enabled: !!contractId },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <p className="text-muted-foreground">جاري تحميل العقد...</p>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-xl font-bold text-muted-foreground">العقد غير موجود</p>
          <Link href="/contracts">
            <Button className="mt-4">العودة للعقود</Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusLabels: Record<string, string> = {
    draft: "مسودة",
    active: "نشط",
    completed: "مكتمل",
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <Link href="/contracts">
            <Button variant="ghost" className="gap-2">
              <ArrowRight className="w-4 h-4" />
              العودة للعقود
            </Button>
          </Link>
          <Button variant="outline" className="gap-2" onClick={() => window.print()}>
            <Printer className="w-4 h-4" />
            طباعة
          </Button>
        </div>

        <Card className="border-2 print:border-0 print:shadow-none">
          <CardHeader className="border-b bg-primary/5 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
                <FileText className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black">
                  عقد {contract.type === "sale" ? "بيع" : "إيجار"} عربة فود ترك
                </CardTitle>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    رقم العقد: #{contract.id}
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-white">
                    {statusLabels[contract.status]}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Parties */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-4 bg-muted/30 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-5 h-5 text-primary" />
                  <h3 className="font-black">{contract.type === "sale" ? "البائع" : "المؤجر"}</h3>
                </div>
                <p className="font-bold">{contract.ownerName}</p>
                {contract.ownerEmail && (
                  <p className="text-sm text-muted-foreground">{contract.ownerEmail}</p>
                )}
              </div>
              <div className="p-4 bg-muted/30 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-5 h-5 text-blue-600" />
                  <h3 className="font-black">{contract.type === "sale" ? "المشتري" : "المستأجر"}</h3>
                </div>
                <p className="font-bold">{contract.buyerName}</p>
                {contract.buyerEmail && (
                  <p className="text-sm text-muted-foreground">{contract.buyerEmail}</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Truck Info */}
            <div className="p-4 bg-muted/30 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Truck className="w-5 h-5 text-primary" />
                <h3 className="font-black">تفاصيل العربة</h3>
              </div>
              <p className="font-bold">
                {contract.truckName ?? `عربة رقم #${contract.truckId}`}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                نوع العقد: {contract.type === "sale" ? "بيع نهائي" : "إيجار"}
              </p>
              {contract.rentalDuration && (
                <p className="text-sm text-muted-foreground">
                  مدة الإيجار: {contract.rentalDuration === "monthly" ? "شهري" : "سنوي"}
                </p>
              )}
            </div>

            <Separator />

            {/* Financial */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-primary" />
                <h3 className="font-black">التفاصيل المالية</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="text-muted-foreground">القيمة الإجمالية للعقد</span>
                  <span className="font-black text-xl text-primary">
                    {Number(contract.price).toLocaleString("ar-SA")} ريال
                  </span>
                </div>
                {contract.depositAmount != null && (
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <span className="text-muted-foreground">الدفعة الأولى / العربون</span>
                    <span className="font-black text-orange-600">
                      {Number(contract.depositAmount).toLocaleString("ar-SA")} ريال
                    </span>
                  </div>
                )}
                {contract.remainingAmount != null && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <span className="text-muted-foreground">المبلغ المتبقي بعد العربون</span>
                    <span className="font-black text-blue-600">
                      {Number(contract.remainingAmount).toLocaleString("ar-SA")} ريال
                    </span>
                  </div>
                )}
                {contract.type === "rent" && contract.monthlyPayment != null && (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                    <span className="text-muted-foreground">
                      قيمة القسط {contract.rentalDuration === "monthly" ? "الشهري" : "السنوي"}
                    </span>
                    <span className="font-black text-green-700">
                      {Number(contract.monthlyPayment).toLocaleString("ar-SA", { maximumFractionDigits: 2 })} ريال
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Rental Payment Schedule */}
            {contract.type === "rent" && contract.rentalPeriodCount && contract.rentalPeriodCount > 1 && contract.monthlyPayment != null && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <ListOrdered className="w-5 h-5 text-primary" />
                    <h3 className="font-black">جدول الدفعات التفصيلي</h3>
                  </div>
                  <div className="overflow-hidden rounded-xl border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/60">
                        <tr>
                          <th className="p-3 text-right font-bold text-muted-foreground">رقم الدفعة</th>
                          <th className="p-3 text-right font-bold text-muted-foreground">نوع الدفعة</th>
                          <th className="p-3 text-right font-bold text-muted-foreground">المبلغ (ريال)</th>
                          <th className="p-3 text-right font-bold text-muted-foreground">الموعد</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* First payment = deposit */}
                        <tr className="border-t bg-orange-50/50">
                          <td className="p-3 font-bold">1</td>
                          <td className="p-3">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                              <CheckCircle2 className="w-3 h-3" />
                              عربون
                            </span>
                          </td>
                          <td className="p-3 font-black text-orange-600">
                            {Number(contract.depositAmount).toLocaleString("ar-SA")}
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {contract.startDate
                              ? new Date(contract.startDate).toLocaleDateString("ar-SA")
                              : "عند التوقيع"}
                          </td>
                        </tr>
                        {/* Remaining installments */}
                        {Array.from({ length: contract.rentalPeriodCount - 1 }, (_, i) => {
                          const installmentNum = i + 2;
                          let dueDate: string | null = null;
                          if (contract.startDate) {
                            const d = new Date(contract.startDate);
                            if (contract.rentalDuration === "monthly") {
                              d.setMonth(d.getMonth() + i + 1);
                            } else {
                              d.setFullYear(d.getFullYear() + i + 1);
                            }
                            dueDate = d.toLocaleDateString("ar-SA");
                          }
                          return (
                            <tr key={installmentNum} className={`border-t ${i % 2 === 0 ? "bg-white" : "bg-muted/20"}`}>
                              <td className="p-3 font-bold">{installmentNum}</td>
                              <td className="p-3">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                                  <Clock className="w-3 h-3" />
                                  قسط {contract.rentalDuration === "monthly" ? "شهري" : "سنوي"}
                                </span>
                              </td>
                              <td className="p-3 font-black text-blue-700">
                                {Number(contract.monthlyPayment).toLocaleString("ar-SA", { maximumFractionDigits: 2 })}
                              </td>
                              <td className="p-3 text-muted-foreground text-xs">
                                {dueDate ?? "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-muted/60 border-t-2">
                        <tr>
                          <td colSpan={2} className="p-3 font-black">الإجمالي</td>
                          <td className="p-3 font-black text-primary text-base">
                            {Number(contract.price).toLocaleString("ar-SA")} ريال
                          </td>
                          <td className="p-3 text-xs text-muted-foreground">
                            {contract.rentalPeriodCount} دفعة
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  {contract.startDate && contract.endDate && (
                    <div className="flex items-center gap-3 mt-3 p-3 bg-muted/30 rounded-lg text-sm">
                      <CalendarRange className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">
                        مدة العقد من <strong>{new Date(contract.startDate).toLocaleDateString("ar-SA")}</strong> إلى <strong>{new Date(contract.endDate).toLocaleDateString("ar-SA")}</strong>
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}

            {contract.terms && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <h3 className="font-black">الشروط والأحكام</h3>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-xl">
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {contract.terms}
                    </p>
                  </div>
                </div>
              </>
            )}

            <Separator />

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              تاريخ إنشاء العقد: {new Date(contract.createdAt).toLocaleDateString("ar-SA")}
            </div>

            <div className="p-4 border-2 border-primary/20 rounded-xl text-center">
              <p className="text-xs text-muted-foreground">
                هذا العقد موثق رقمياً عبر منصة سوق عربات الفود ترك ويُعدّ ملزماً قانونياً لجميع الأطراف
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
