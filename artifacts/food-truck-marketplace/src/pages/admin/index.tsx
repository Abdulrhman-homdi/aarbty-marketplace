import { useState } from "react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListFoodTrucks, useListInquiries, useListContracts, useGetPlatformStats, useGetWalletBalance,
  useRespondToInquiry, useUpdateFoodTruckAvailability, useWalletDeposit, useWalletTransfer,
  getListFoodTrucksQueryKey, getListInquiriesQueryKey, getListContractsQueryKey,
  getGetPlatformStatsQueryKey, getGetWalletBalanceQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ShieldCheck, Truck, MessageSquare, FileText, Wallet,
  TrendingUp, CheckCircle2, XCircle, Clock, Eye,
  MapPin, BarChart3, ToggleLeft, ToggleRight, Search,
  ArrowDownToLine, ArrowUpRight, AlertCircle, Activity
} from "lucide-react";

export default function AdminDashboard() {
  const qc = useQueryClient();
  const { data: trucks, isLoading: tLoading } = useListFoodTrucks({}, { query: { queryKey: getListFoodTrucksQueryKey() } });
  const { data: inquiries, isLoading: iLoading } = useListInquiries({}, { query: { queryKey: getListInquiriesQueryKey() } });
  const { data: contracts, isLoading: cLoading } = useListContracts({}, { query: { queryKey: getListContractsQueryKey() } });
  const { data: stats } = useGetPlatformStats({ query: { queryKey: getGetPlatformStatsQueryKey() } });
  const { data: wallet, isLoading: walLoading } = useGetWalletBalance({ query: { queryKey: getGetWalletBalanceQueryKey() } });

  const respondMutation = useRespondToInquiry();
  const toggleMutation = useUpdateFoodTruckAvailability();
  const depositMutation = useWalletDeposit();
  const transferMutation = useWalletTransfer();

  const [truckSearch, setTruckSearch] = useState("");
  const [inqSearch, setInqSearch] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [depositDesc, setDepositDesc] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferDesc, setTransferDesc] = useState("");

  const saleCount = trucks?.filter(t => t.listingType === "sale").length ?? 0;
  const rentCount = trucks?.filter(t => t.listingType === "rent").length ?? 0;
  const total = (saleCount + rentCount) || 1;
  const pendingInquiries = inquiries?.filter(i => i.status === "pending").length ?? 0;

  const filteredTrucks = trucks?.filter(t =>
    !truckSearch || t.name.includes(truckSearch) || t.location.includes(truckSearch) || t.ownerName.includes(truckSearch)
  );
  const filteredInquiries = inquiries?.filter(i =>
    !inqSearch || i.customerName.includes(inqSearch) || (i.truckName ?? "").includes(inqSearch)
  );

  function invalidate() {
    qc.invalidateQueries({ queryKey: getListInquiriesQueryKey() });
    qc.invalidateQueries({ queryKey: getListFoodTrucksQueryKey() });
    qc.invalidateQueries({ queryKey: getGetWalletBalanceQueryKey() });
    qc.invalidateQueries({ queryKey: getGetPlatformStatsQueryKey() });
    qc.invalidateQueries({ queryKey: getListContractsQueryKey() });
  }

  function handleRespond(id: number, status: "confirmed" | "rejected") {
    respondMutation.mutate({ id, data: { status } }, { onSuccess: invalidate });
  }

  function handleToggle(id: number, current: boolean) {
    toggleMutation.mutate({ id, data: { available: !current } }, { onSuccess: invalidate });
  }

  function handleDeposit(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (!amt) return;
    depositMutation.mutate(
      { data: { amount: amt, description: depositDesc || "إيداع من الإدارة" } },
      { onSuccess: () => { setDepositAmount(""); setDepositDesc(""); invalidate(); } }
    );
  }

  function handleTransfer(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(transferAmount);
    if (!amt) return;
    transferMutation.mutate(
      { data: { amount: amt, description: transferDesc || "تحويل من الإدارة" } },
      { onSuccess: () => { setTransferAmount(""); setTransferDesc(""); invalidate(); } }
    );
  }

  const statCards = [
    { label: "إجمالي العربات", value: stats?.totalTrucks ?? 0, icon: Truck, color: "text-primary", bg: "bg-primary/10", sub: `${stats?.availableTrucks ?? 0} متاحة` },
    { label: "الاستفسارات", value: stats?.totalInquiries ?? 0, icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10", sub: `${pendingInquiries} معلّق` },
    { label: "العقود النشطة", value: stats?.activeContracts ?? 0, icon: FileText, color: "text-purple-500", bg: "bg-purple-500/10", sub: `${contracts?.length ?? 0} إجمالي` },
    { label: "حجم المعاملات", value: `${((stats?.totalTransactionVolume ?? 0) / 1000).toFixed(1)}K`, icon: Wallet, color: "text-green-500", bg: "bg-green-500/10", sub: "ريال" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-black text-white py-10 border-b border-primary/30">
        <div className="container mx-auto px-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-primary text-sm font-bold mb-1">
                <ShieldCheck className="w-4 h-4" /> لوحة الإدارة
              </div>
              <h1 className="text-2xl font-black">مركز التحكم الكامل</h1>
              <p className="text-gray-400 text-sm">إدارة ومراقبة جميع عمليات المنصة</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {pendingInquiries > 0 && (
              <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-xl px-4 py-2 text-sm">
                <AlertCircle className="w-4 h-4" />
                {pendingInquiries} استفسار يحتاج رد
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((s, i) => (
            <Card key={i} className="border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-full ${s.bg} flex items-center justify-center`}>
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                </div>
                <div className="text-3xl font-black mb-0.5">{s.value}</div>
                <div className="text-muted-foreground text-xs">{s.label}</div>
                <div className={`text-xs mt-1 font-medium ${s.color}`}>{s.sub}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />توزيع العربات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "للبيع", count: saleCount, pct: (saleCount / total) * 100 },
                { label: "للإيجار", count: rentCount, pct: (rentCount / total) * 100 },
                { label: "متاحة", count: stats?.availableTrucks ?? 0, pct: ((stats?.availableTrucks ?? 0) / total) * 100 },
                { label: "استفسارات معلّقة", count: pendingInquiries, pct: ((pendingInquiries) / ((stats?.totalInquiries ?? 1) || 1)) * 100 },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-muted-foreground">{item.count}</span>
                  </div>
                  <Progress value={item.pct} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />الملخص المالي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "الرصيد الحالي", value: wallet?.balance ?? 0, color: "text-primary", bg: "bg-primary/10" },
                  { label: "محجوز (ضمان)", value: wallet?.escrowBalance ?? 0, color: "text-orange-500", bg: "bg-orange-500/10" },
                  { label: "إجمالي الإيداعات", value: wallet?.totalDeposited ?? 0, color: "text-green-500", bg: "bg-green-500/10" },
                  { label: "إجمالي المحوّل", value: wallet?.totalTransferred ?? 0, color: "text-blue-500", bg: "bg-blue-500/10" },
                ].map((item, i) => (
                  <div key={i} className={`${item.bg} rounded-xl p-4`}>
                    <div className="text-muted-foreground text-xs mb-1">{item.label}</div>
                    <div className={`text-xl font-black ${item.color}`}>
                      {walLoading ? "..." : item.value.toLocaleString("ar-SA")}
                      <span className="text-xs font-normal text-muted-foreground"> ريال</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="trucks">
          <TabsList className="mb-6 bg-muted rounded-xl p-1 gap-1 flex-wrap h-auto">
            <TabsTrigger value="trucks" className="rounded-lg font-bold gap-1.5"><Truck className="w-4 h-4" />العربات</TabsTrigger>
            <TabsTrigger value="inquiries" className="rounded-lg font-bold gap-1.5 relative">
              <MessageSquare className="w-4 h-4" />الاستفسارات
              {pendingInquiries > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">{pendingInquiries}</span>}
            </TabsTrigger>
            <TabsTrigger value="contracts" className="rounded-lg font-bold gap-1.5"><FileText className="w-4 h-4" />العقود</TabsTrigger>
            <TabsTrigger value="wallet" className="rounded-lg font-bold gap-1.5"><Wallet className="w-4 h-4" />المحفظة</TabsTrigger>
          </TabsList>

          {/* Trucks */}
          <TabsContent value="trucks">
            <div className="space-y-3">
              <div className="relative max-w-sm">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="بحث بالاسم أو المدينة أو المالك..."
                  className="pr-9 h-10"
                  value={truckSearch}
                  onChange={e => setTruckSearch(e.target.value)}
                />
              </div>
              <div className="rounded-2xl border overflow-hidden">
                <div className="bg-muted/50 px-4 py-3 border-b flex items-center justify-between">
                  <span className="font-bold text-sm">جميع العربات ({filteredTrucks?.length ?? 0})</span>
                </div>
                {tLoading
                  ? <div className="p-4 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>
                  : (
                    <div className="divide-y">
                      {filteredTrucks?.map(truck => (
                        <div key={truck.id} className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-muted/20 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                              <Truck className="w-4 h-4 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-sm truncate">{truck.name}</div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <MapPin className="w-3 h-3 shrink-0" /><span className="truncate">{truck.location}</span>
                                <span>·</span><span className="truncate">{truck.ownerName}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-bold text-xs hidden sm:block">{truck.price.toLocaleString("ar-SA")} ر</span>
                            <Badge variant={truck.listingType === "sale" ? "default" : "secondary"} className="text-xs hidden sm:flex">
                              {truck.listingType === "sale" ? "بيع" : "إيجار"}
                            </Badge>
                            <Button
                              size="sm"
                              variant={truck.available ? "default" : "secondary"}
                              className="gap-1 text-xs h-7 px-2"
                              onClick={() => handleToggle(truck.id, truck.available)}
                              disabled={toggleMutation.isPending}
                            >
                              {truck.available ? <><ToggleRight className="w-3 h-3" />متاح</> : <><ToggleLeft className="w-3 h-3" />محجوب</>}
                            </Button>
                            <Link href={`/trucks/${truck.id}`}>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          </TabsContent>

          {/* Inquiries */}
          <TabsContent value="inquiries">
            <div className="space-y-3">
              <div className="relative max-w-sm">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="بحث بالاسم أو العربة..."
                  className="pr-9 h-10"
                  value={inqSearch}
                  onChange={e => setInqSearch(e.target.value)}
                />
              </div>
              <div className="rounded-2xl border overflow-hidden">
                <div className="bg-muted/50 px-4 py-3 border-b">
                  <span className="font-bold text-sm">جميع الاستفسارات ({filteredInquiries?.length ?? 0})</span>
                </div>
                {iLoading
                  ? <div className="p-4 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>
                  : (
                    <div className="divide-y">
                      {filteredInquiries?.map(inq => (
                        <div key={inq.id} className={`px-4 py-3 flex items-center justify-between gap-3 hover:bg-muted/20 transition-colors ${inq.status === "pending" ? "bg-orange-50/50" : ""}`}>
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                              <MessageSquare className="w-4 h-4 text-blue-500" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-sm truncate">{inq.customerName}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {inq.truckName ?? "عربة"} — {inq.type === "rent" ? "استئجار" : "شراء"}
                              </div>
                              {inq.message && (
                                <div className="text-xs text-muted-foreground italic truncate max-w-xs">"{inq.message}"</div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-muted-foreground hidden sm:block">
                              {new Date(inq.createdAt).toLocaleDateString("ar-SA")}
                            </span>
                            <Badge variant={
                              inq.status === "confirmed" ? "default" :
                              inq.status === "pending" ? "secondary" : "destructive"
                            } className="text-xs">
                              {inq.status === "pending" ? "معلّق" : inq.status === "confirmed" ? "مقبول" : "مرفوض"}
                            </Badge>
                            {inq.status === "pending" && (
                              <>
                                <Button size="sm" className="h-7 px-2 gap-1 text-xs" onClick={() => handleRespond(inq.id, "confirmed")} disabled={respondMutation.isPending}>
                                  <CheckCircle2 className="w-3 h-3" />قبول
                                </Button>
                                <Button size="sm" variant="outline" className="h-7 px-2 gap-1 text-xs text-red-500 border-red-200" onClick={() => handleRespond(inq.id, "rejected")} disabled={respondMutation.isPending}>
                                  <XCircle className="w-3 h-3" />رفض
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          </TabsContent>

          {/* Contracts */}
          <TabsContent value="contracts">
            <div className="rounded-2xl border overflow-hidden">
              <div className="bg-muted/50 px-4 py-3 border-b">
                <span className="font-bold text-sm">جميع العقود ({contracts?.length ?? 0})</span>
              </div>
              {cLoading
                ? <div className="p-4 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>
                : (
                  <div className="divide-y">
                    {contracts?.map(con => (
                      <div key={con.id} className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-muted/20 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4 text-purple-500" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-sm truncate">{con.truckName ?? "عربة"}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {con.buyerName} — عقد {con.type === "sale" ? "بيع" : "إيجار"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-bold text-sm">{con.price.toLocaleString("ar-SA")} ريال</span>
                          <Badge variant={con.status === "active" ? "default" : "secondary"} className="text-xs">
                            {con.status === "active" ? "نشط" : con.status === "completed" ? "منجز" : "ملغي"}
                          </Badge>
                          <Link href={`/contracts/${con.id}`}>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </TabsContent>

          {/* Wallet Management */}
          <TabsContent value="wallet">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <h3 className="font-bold text-lg">سجل المعاملات الكامل</h3>
                {walLoading
                  ? [1,2,3,4].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)
                  : wallet?.transactions?.map(tx => (
                    <Card key={tx.id} className="border">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                            tx.type === "deposit" ? "bg-green-500/10" : tx.type === "escrow" ? "bg-orange-500/10" : "bg-blue-500/10"
                          }`}>
                            <Wallet className={`w-4 h-4 ${
                              tx.type === "deposit" ? "text-green-500" : tx.type === "escrow" ? "text-orange-500" : "text-blue-500"
                            }`} />
                          </div>
                          <div>
                            <div className="font-medium text-sm">{tx.description || (tx.type === "deposit" ? "إيداع" : tx.type === "escrow" ? "حجز ضمان" : "تحويل")}</div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {new Date(tx.createdAt).toLocaleDateString("ar-SA")}
                              <Badge variant="outline" className="text-[10px] h-4 px-1">
                                {tx.type === "deposit" ? "إيداع" : tx.type === "escrow" ? "ضمان" : "تحويل"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className={`font-black text-base ${tx.type === "deposit" ? "text-green-500" : "text-foreground"}`}>
                          {tx.type === "deposit" ? "+" : "-"}{tx.amount.toLocaleString("ar-SA")} ر
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>

              <div className="space-y-4">
                <Card className="bg-black text-white border-none">
                  <CardContent className="p-5 space-y-3">
                    <div className="text-gray-400 text-xs font-bold uppercase tracking-wide">ملخص المحفظة</div>
                    {[
                      { label: "الرصيد المتاح", value: wallet?.balance ?? 0, color: "text-primary font-black text-2xl" },
                      { label: "محجوز ضمان", value: wallet?.escrowBalance ?? 0, color: "text-orange-400" },
                      { label: "إجمالي الإيداع", value: wallet?.totalDeposited ?? 0, color: "text-green-400" },
                      { label: "إجمالي التحويل", value: wallet?.totalTransferred ?? 0, color: "text-blue-400" },
                    ].map((item, i) => (
                      <div key={i} className={`flex justify-between items-center ${i === 0 ? "pb-3 border-b border-white/10" : ""}`}>
                        <span className="text-gray-400 text-sm">{item.label}</span>
                        <span className={item.color}>{walLoading ? "..." : item.value.toLocaleString("ar-SA")} <span className="text-xs text-gray-500">ر</span></span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Deposit */}
                <Card className="border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <ArrowDownToLine className="w-4 h-4 text-green-500" />إيداع رصيد
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleDeposit} className="space-y-2.5">
                      <Input type="number" placeholder="المبلغ (ريال)" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} min="1" required className="h-9" />
                      <Input placeholder="الوصف" value={depositDesc} onChange={e => setDepositDesc(e.target.value)} className="h-9" />
                      <Button type="submit" size="sm" className="w-full gap-2 font-bold" disabled={depositMutation.isPending}>
                        {depositMutation.isPending ? "..." : <><ArrowDownToLine className="w-3.5 h-3.5" />إيداع</>}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Transfer */}
                <Card className="border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <ArrowUpRight className="w-4 h-4 text-blue-500" />تحويل رصيد
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleTransfer} className="space-y-2.5">
                      <Input type="number" placeholder="المبلغ (ريال)" value={transferAmount} onChange={e => setTransferAmount(e.target.value)} min="1" required className="h-9" />
                      <Input placeholder="الوصف" value={transferDesc} onChange={e => setTransferDesc(e.target.value)} className="h-9" />
                      <Button type="submit" size="sm" variant="outline" className="w-full gap-2 font-bold" disabled={transferMutation.isPending}>
                        {transferMutation.isPending ? "..." : <><ArrowUpRight className="w-3.5 h-3.5" />تحويل</>}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

