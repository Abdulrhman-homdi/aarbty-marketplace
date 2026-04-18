import { Link } from "wouter";
import { useListFoodTrucks, useListInquiries, useListContracts, useGetPlatformStats, useGetWalletBalance, getListFoodTrucksQueryKey, getListInquiriesQueryKey, getListContractsQueryKey, getGetPlatformStatsQueryKey, getGetWalletBalanceQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  ShieldCheck, Truck, MessageSquare, FileText, Wallet,
  TrendingUp, Users, CheckCircle2, XCircle, Clock, Eye, MapPin, BarChart3
} from "lucide-react";

export default function AdminDashboard() {
  const { data: trucks, isLoading: tLoading } = useListFoodTrucks({}, { query: { queryKey: getListFoodTrucksQueryKey() } });
  const { data: inquiries, isLoading: iLoading } = useListInquiries({}, { query: { queryKey: getListInquiriesQueryKey() } });
  const { data: contracts, isLoading: cLoading } = useListContracts({}, { query: { queryKey: getListContractsQueryKey() } });
  const { data: stats } = useGetPlatformStats({ query: { queryKey: getGetPlatformStatsQueryKey() } });
  const { data: wallet } = useGetWalletBalance({ query: { queryKey: getGetWalletBalanceQueryKey() } });

  const saleCount = trucks?.filter(t => t.listingType === "sale").length ?? 0;
  const rentCount = trucks?.filter(t => t.listingType === "rent").length ?? 0;
  const total = (saleCount + rentCount) || 1;

  const statCards = [
    { label: "إجمالي العربات", value: stats?.totalTrucks ?? 0, icon: Truck, color: "text-primary", bg: "bg-primary/10" },
    { label: "الاستفسارات", value: stats?.totalInquiries ?? 0, icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "العقود النشطة", value: stats?.activeContracts ?? 0, icon: FileText, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "حجم المعاملات", value: `${((stats?.totalTransactionVolume ?? 0) / 1000).toFixed(0)}K`, icon: Wallet, color: "text-green-500", bg: "bg-green-500/10" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <div className="bg-black text-white py-10 border-b border-primary/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-1">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <span className="text-primary font-bold text-sm">لوحة الإدارة</span>
          </div>
          <h1 className="text-3xl font-black">مركز التحكم الكامل</h1>
          <p className="text-gray-400 text-sm mt-1">إدارة ومراقبة جميع عمليات المنصة</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 space-y-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((s, i) => (
            <Card key={i} className="border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-muted-foreground text-sm">{s.label}</span>
                  <div className={`w-9 h-9 rounded-full ${s.bg} flex items-center justify-center`}>
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                </div>
                <div className="text-3xl font-black">{s.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="w-4 h-4 text-primary" />
                توزيع نوع العرض
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium">للبيع</span>
                  <span className="text-muted-foreground">{saleCount} عربة</span>
                </div>
                <Progress value={(saleCount / total) * 100} className="h-3" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium">للإيجار</span>
                  <span className="text-muted-foreground">{rentCount} عربة</span>
                </div>
                <Progress value={(rentCount / total) * 100} className="h-3" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium">متاحة</span>
                  <span className="text-muted-foreground">{stats?.availableTrucks ?? 0} عربة</span>
                </div>
                <Progress value={((stats?.availableTrucks ?? 0) / total) * 100} className="h-3" />
              </div>
            </CardContent>
          </Card>

          <Card className="border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Wallet className="w-4 h-4 text-primary" />
                ملخص المالي
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "إجمالي الإيداعات", value: wallet?.totalDeposited ?? 0, color: "text-green-500" },
                { label: "محجوز (ضمان)", value: wallet?.escrowBalance ?? 0, color: "text-orange-500" },
                { label: "إجمالي المحوّل", value: wallet?.totalTransferred ?? 0, color: "text-blue-500" },
                { label: "الرصيد الحالي", value: wallet?.balance ?? 0, color: "text-primary" },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className={`font-black ${item.color}`}>{item.value.toLocaleString("ar-SA")} ريال</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="trucks">
          <TabsList className="mb-6 bg-muted rounded-xl p-1 gap-1">
            <TabsTrigger value="trucks" className="rounded-lg font-bold">العربات</TabsTrigger>
            <TabsTrigger value="inquiries" className="rounded-lg font-bold">الاستفسارات</TabsTrigger>
            <TabsTrigger value="contracts" className="rounded-lg font-bold">العقود</TabsTrigger>
          </TabsList>

          {/* Trucks Management */}
          <TabsContent value="trucks">
            <div className="rounded-2xl border overflow-hidden">
              <div className="bg-card p-4 border-b flex items-center justify-between">
                <h3 className="font-bold">جميع العربات ({trucks?.length ?? 0})</h3>
              </div>
              {tLoading
                ? <div className="p-6 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>
                : (
                  <div className="divide-y">
                    {trucks?.map(truck => (
                      <div key={truck.id} className="p-4 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Truck className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-bold">{truck.name}</div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" />{truck.location}
                              <span>—</span>{truck.ownerName}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-sm">{truck.price.toLocaleString("ar-SA")} ريال</span>
                          <Badge variant={truck.listingType === "sale" ? "default" : "secondary"} className="text-xs">
                            {truck.listingType === "sale" ? "للبيع" : "للإيجار"}
                          </Badge>
                          <Badge variant={truck.available ? "default" : "outline"} className="text-xs">
                            {truck.available ? "متاحة" : "غير متاحة"}
                          </Badge>
                          <Link href={`/trucks/${truck.id}`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </TabsContent>

          {/* Inquiries Management */}
          <TabsContent value="inquiries">
            <div className="rounded-2xl border overflow-hidden">
              <div className="bg-card p-4 border-b">
                <h3 className="font-bold">جميع الاستفسارات ({inquiries?.length ?? 0})</h3>
              </div>
              {iLoading
                ? <div className="p-6 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>
                : (
                  <div className="divide-y">
                    {inquiries?.map(inq => (
                      <div key={inq.id} className="p-4 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                            <MessageSquare className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <div className="font-bold">{inq.customerName}</div>
                            <div className="text-xs text-muted-foreground">
                              {inq.truckName ?? "عربة"} — {inq.type === "rent" ? "استئجار" : "شراء"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(inq.createdAt).toLocaleDateString("ar-SA")}
                          </div>
                          <Badge variant={
                            inq.status === "confirmed" ? "default" :
                            inq.status === "pending" ? "secondary" : "destructive"
                          } className="text-xs">
                            {inq.status === "pending" ? "معلّق" : inq.status === "confirmed" ? "مقبول" : "مرفوض"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </TabsContent>

          {/* Contracts Management */}
          <TabsContent value="contracts">
            <div className="rounded-2xl border overflow-hidden">
              <div className="bg-card p-4 border-b">
                <h3 className="font-bold">جميع العقود ({contracts?.length ?? 0})</h3>
              </div>
              {cLoading
                ? <div className="p-6 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>
                : (
                  <div className="divide-y">
                    {contracts?.map(con => (
                      <div key={con.id} className="p-4 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-purple-500" />
                          </div>
                          <div>
                            <div className="font-bold">{con.truckName ?? "عربة"}</div>
                            <div className="text-xs text-muted-foreground">
                              {con.buyerName} — عقد {con.type === "sale" ? "بيع" : "إيجار"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-sm">{con.price.toLocaleString("ar-SA")} ريال</span>
                          <Badge variant={con.status === "active" ? "default" : "secondary"} className="text-xs">
                            {con.status === "active" ? "نشط" : con.status === "completed" ? "منجز" : "ملغي"}
                          </Badge>
                          <Link href={`/contracts/${con.id}`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
