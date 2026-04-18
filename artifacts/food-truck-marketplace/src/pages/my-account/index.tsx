import { Link } from "wouter";
import { useListInquiries, useListContracts, useGetWalletBalance, getListInquiriesQueryKey, getListContractsQueryKey, getGetWalletBalanceQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, FileText, Wallet, TrendingDown, ArrowUpRight, Clock, CheckCircle2, XCircle, User } from "lucide-react";

export default function MyAccount() {
  const { data: inquiries, isLoading: inqLoading } = useListInquiries({}, { query: { queryKey: getListInquiriesQueryKey() } });
  const { data: contracts, isLoading: conLoading } = useListContracts({}, { query: { queryKey: getListContractsQueryKey() } });
  const { data: wallet, isLoading: walLoading } = useGetWalletBalance({ query: { queryKey: getGetWalletBalanceQueryKey() } });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-black text-white py-10 border-b border-primary/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
              <User className="w-8 h-8 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-primary mb-1 text-sm font-medium">
                <User className="w-4 h-4" />
                بوابة المستفيد
              </div>
              <h1 className="text-2xl font-black">حسابي</h1>
              <p className="text-gray-400 text-sm mt-0.5">تتبّع استفساراتك وعقودك ومحفظتك</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-black">{inquiries?.length ?? 0}</div>
                <div className="text-sm text-muted-foreground">استفساراتي</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <div className="text-2xl font-black">{contracts?.length ?? 0}</div>
                <div className="text-sm text-muted-foreground">عقودي</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border bg-primary text-primary-foreground">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-black/20 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-black">
                  {walLoading ? "..." : (wallet?.balance ?? 0).toLocaleString("ar-SA")}
                </div>
                <div className="text-sm opacity-80">رصيد المحفظة (ريال)</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="inquiries">
          <TabsList className="mb-6 bg-muted rounded-xl p-1 gap-1">
            <TabsTrigger value="inquiries" className="rounded-lg font-bold">استفساراتي</TabsTrigger>
            <TabsTrigger value="contracts" className="rounded-lg font-bold">عقودي</TabsTrigger>
            <TabsTrigger value="wallet" className="rounded-lg font-bold">المحفظة</TabsTrigger>
          </TabsList>

          {/* Inquiries Tab */}
          <TabsContent value="inquiries">
            <div className="space-y-4">
              {inqLoading
                ? [1,2].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)
                : inquiries?.length === 0
                  ? (
                    <div className="text-center py-20 bg-card rounded-2xl border border-dashed">
                      <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">لم تُرسل أي استفسارات بعد</p>
                      <Link href="/trucks">
                        <Button className="mt-4" size="sm">تصفح العربات</Button>
                      </Link>
                    </div>
                  )
                  : inquiries?.map(inq => (
                    <Card key={inq.id} className="border hover:shadow-sm transition-shadow">
                      <CardContent className="p-6 flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="font-bold">{inq.truckName ?? "عربة"}</div>
                            <div className="text-sm text-muted-foreground">
                              {inq.type === "rent" ? "طلب استئجار" : "طلب شراء"} — {inq.message?.slice(0, 40)}...
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <Clock className="w-3 h-3" />
                              {new Date(inq.createdAt).toLocaleDateString("ar-SA")}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {inq.status === "confirmed" && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                          {inq.status === "rejected" && <XCircle className="w-4 h-4 text-red-500" />}
                          <Badge variant={
                            inq.status === "confirmed" ? "default" :
                            inq.status === "pending" ? "secondary" : "destructive"
                          }>
                            {inq.status === "pending" ? "قيد المراجعة" : inq.status === "confirmed" ? "مقبول" : "مرفوض"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
            </div>
          </TabsContent>

          {/* Contracts Tab */}
          <TabsContent value="contracts">
            <div className="space-y-4">
              {conLoading
                ? [1,2].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)
                : contracts?.length === 0
                  ? (
                    <div className="text-center py-20 bg-card rounded-2xl border border-dashed">
                      <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">لا توجد عقود حتى الآن</p>
                    </div>
                  )
                  : contracts?.map(con => (
                    <Card key={con.id} className="border hover:shadow-sm transition-shadow">
                      <CardContent className="p-6 flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-purple-500" />
                          </div>
                          <div>
                            <div className="font-bold">{con.truckName ?? "عربة"}</div>
                            <div className="text-sm text-muted-foreground">عقد {con.type === "sale" ? "بيع" : "إيجار"}</div>
                            <div className="text-xs text-muted-foreground">{new Date(con.createdAt).toLocaleDateString("ar-SA")}</div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-xl font-black">{con.price.toLocaleString("ar-SA")} ريال</div>
                          <Badge variant={con.status === "active" ? "default" : "secondary"} className="text-xs">
                            {con.status === "active" ? "نشط" : con.status === "completed" ? "منجز" : "ملغي"}
                          </Badge>
                          <Link href={`/contracts/${con.id}`}>
                            <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                              <ArrowUpRight className="w-3 h-3" />
                              عرض العقد
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
            </div>
          </TabsContent>

          {/* Wallet Tab */}
          <TabsContent value="wallet">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[
                  { label: "الرصيد المتاح", value: wallet?.balance ?? 0, icon: Wallet, color: "text-primary" },
                  { label: "محجوز (ضمان)", value: wallet?.escrowBalance ?? 0, icon: TrendingDown, color: "text-orange-500" },
                  { label: "إجمالي المحوّل", value: wallet?.totalTransferred ?? 0, icon: ArrowUpRight, color: "text-green-500" },
                ].map((item, i) => (
                  <Card key={i} className="border">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">{item.label}</span>
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                      </div>
                      <div className="text-2xl font-black">
                        {walLoading ? "..." : item.value.toLocaleString("ar-SA")} <span className="text-sm font-normal text-muted-foreground">ريال</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <h3 className="font-bold text-lg">سجل المعاملات</h3>
              {walLoading
                ? [1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)
                : wallet?.transactions?.map(tx => (
                  <Card key={tx.id} className="border">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tx.type === "deposit" ? "bg-green-500/10" : tx.type === "escrow" ? "bg-orange-500/10" : "bg-blue-500/10"
                        }`}>
                          <Wallet className={`w-4 h-4 ${
                            tx.type === "deposit" ? "text-green-500" : tx.type === "escrow" ? "text-orange-500" : "text-blue-500"
                          }`} />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{tx.description || (tx.type === "deposit" ? "إيداع" : tx.type === "escrow" ? "حجز ضمان" : "تحويل")}</div>
                          <div className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString("ar-SA")}</div>
                        </div>
                      </div>
                      <div className={`font-black text-lg ${tx.type === "deposit" ? "text-green-500" : "text-foreground"}`}>
                        {tx.type === "deposit" ? "+" : "-"}{tx.amount.toLocaleString("ar-SA")} ريال
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
