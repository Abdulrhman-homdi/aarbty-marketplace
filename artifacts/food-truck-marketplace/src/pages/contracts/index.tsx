import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useListContracts,
  getListContractsQueryKey,
} from "@workspace/api-client-react";
import { FileText, Eye, CheckCircle, Clock, XCircle } from "lucide-react";

export default function ContractsList() {
  const { data: contracts, isLoading } = useListContracts(
    {},
    { query: { queryKey: getListContractsQueryKey() } }
  );

  const statusIcons: Record<string, React.ReactNode> = {
    draft: <Clock className="w-4 h-4 text-yellow-600" />,
    active: <CheckCircle className="w-4 h-4 text-green-600" />,
    completed: <CheckCircle className="w-4 h-4 text-blue-600" />,
  };

  const statusLabels: Record<string, string> = {
    draft: "مسودة",
    active: "نشط",
    completed: "مكتمل",
  };

  const statusColors: Record<string, string> = {
    draft: "border-yellow-200 text-yellow-700 bg-yellow-50",
    active: "border-green-200 text-green-700 bg-green-50",
    completed: "border-blue-200 text-blue-700 bg-blue-50",
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-foreground">العقود</h1>
          <p className="text-muted-foreground mt-1">
            إدارة عقود البيع والإيجار الإلكترونية
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">جاري التحميل...</div>
        ) : contracts && contracts.length > 0 ? (
          <div className="space-y-4">
            {contracts.map((contract) => (
              <Card key={contract.id} className="border-2 hover:border-primary/30 transition-all hover:shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-black text-xl">
                            عقد {contract.type === "sale" ? "بيع" : "إيجار"} — {contract.truckName ?? `عربة #${contract.truckId}`}
                          </h3>
                          <Badge
                            variant="outline"
                            className={`text-xs ${statusColors[contract.status]}`}
                          >
                            {statusIcons[contract.status]}
                            <span className="mr-1">{statusLabels[contract.status]}</span>
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-xs ${contract.type === "sale" ? "border-blue-200 text-blue-700" : "border-green-200 text-green-700"}`}
                          >
                            {contract.type === "sale" ? "بيع" : "إيجار"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                          <div>
                            <p className="text-xs text-muted-foreground">البائع / المؤجر</p>
                            <p className="font-bold text-sm">{contract.ownerName}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">المشتري / المستأجر</p>
                            <p className="font-bold text-sm">{contract.buyerName}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">القيمة الإجمالية</p>
                            <p className="font-black text-primary">
                              {Number(contract.price).toLocaleString("ar-SA")} ريال
                            </p>
                          </div>
                          {contract.depositAmount && (
                            <div>
                              <p className="text-xs text-muted-foreground">العربون</p>
                              <p className="font-bold text-sm text-orange-600">
                                {Number(contract.depositAmount).toLocaleString("ar-SA")} ريال
                              </p>
                            </div>
                          )}
                        </div>
                        {contract.rentalDuration && (
                          <p className="text-xs text-muted-foreground mt-2">
                            مدة الإيجار: {contract.rentalDuration === "monthly" ? "شهري" : "سنوي"}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          تاريخ الإنشاء: {new Date(contract.createdAt).toLocaleDateString("ar-SA")}
                        </p>
                      </div>
                    </div>
                    <Link href={`/contracts/${contract.id}`}>
                      <Button variant="outline" size="sm" className="gap-2 flex-shrink-0">
                        <Eye className="w-4 h-4" />
                        عرض
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-xl font-bold text-muted-foreground">لا توجد عقود بعد</p>
            <p className="text-sm text-muted-foreground mt-2">
              ستظهر العقود هنا بعد إتمام عمليات البيع أو الإيجار
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
