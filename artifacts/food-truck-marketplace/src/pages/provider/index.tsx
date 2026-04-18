import { useState } from "react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListFoodTrucks, useListInquiries, useListContracts, useGetWalletBalance,
  useRespondToInquiry, useUpdateFoodTruckAvailability, useWalletDeposit, useCreateContract,
  getListFoodTrucksQueryKey, getListInquiriesQueryKey, getListContractsQueryKey, getGetWalletBalanceQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Truck, PlusCircle, MessageSquare, FileText, TrendingUp,
  CheckCircle2, Clock, XCircle, MapPin, Eye, ToggleLeft, ToggleRight,
  Wallet, ArrowDownToLine, ScrollText, ChevronLeft, AlertCircle, User, Pencil
} from "lucide-react";

export default function ProviderDashboard() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: trucks, isLoading: trucksLoading } = useListFoodTrucks({}, { query: { queryKey: getListFoodTrucksQueryKey() } });
  const { data: inquiries, isLoading: inqLoading } = useListInquiries({}, { query: { queryKey: getListInquiriesQueryKey() } });
  const { data: contracts, isLoading: conLoading } = useListContracts({}, { query: { queryKey: getListContractsQueryKey() } });
  const { data: wallet, isLoading: walLoading } = useGetWalletBalance({ query: { queryKey: getGetWalletBalanceQueryKey() } });

  const respondMutation = useRespondToInquiry();
  const toggleAvailMutation = useUpdateFoodTruckAvailability();
  const depositMutation = useWalletDeposit();
  const createContractMutation = useCreateContract();

  const [depositAmount, setDepositAmount] = useState("");
  const [depositDesc, setDepositDesc] = useState("");
  const [contractForm, setContractForm] = useState({
    truckId: "",
    buyerName: "",
    price: "",
    depositAmount: "",
    type: "sale" as "sale" | "rent",
    rentalDuration: "monthly" as "monthly" | "yearly",
    rentalPeriodCount: "",
    startDate: "",
    endDate: "",
  });
  const [contractOpen, setContractOpen] = useState(false);
  const [selectedInqId, setSelectedInqId] = useState<number | null>(null);

  const totalRevenue = contracts?.filter(c => c.status === "completed").reduce((s, c) => s + c.price, 0) ?? 0;
  const pending = inquiries?.filter(i => i.status === "pending").length ?? 0;

  function invalidateAll() {
    qc.invalidateQueries({ queryKey: getListInquiriesQueryKey() });
    qc.invalidateQueries({ queryKey: getListContractsQueryKey() });
    qc.invalidateQueries({ queryKey: getGetWalletBalanceQueryKey() });
    qc.invalidateQueries({ queryKey: getListFoodTrucksQueryKey() });
  }

  function handleRespond(id: number, status: "confirmed" | "rejected") {
    respondMutation.mutate({ id, data: { status } }, { onSuccess: invalidateAll });
  }

  function handleToggleAvail(id: number, current: boolean) {
    toggleAvailMutation.mutate({ id, data: { available: !current } }, { onSuccess: invalidateAll });
  }

  function handleDeposit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) return;
    depositMutation.mutate(
      { data: { amount, description: depositDesc || "إيداع من مقدم الخدمة" } },
      {
        onSuccess: () => {
          setDepositAmount("");
          setDepositDesc("");
          qc.invalidateQueries({ queryKey: getGetWalletBalanceQueryKey() });
        },
      }
    );
  }

  function handleCreateContract(e: React.FormEvent) {
    e.preventDefault();
    const truck = trucks?.find(t => t.id === parseInt(contractForm.truckId));
    const price = parseFloat(contractForm.price);
    const deposit = contractForm.depositAmount ? parseFloat(contractForm.depositAmount) : undefined;
    const periodCount = contractForm.rentalPeriodCount ? parseInt(contractForm.rentalPeriodCount) : undefined;

    createContractMutation.mutate(
      {
        data: {
          truckId: parseInt(contractForm.truckId),
          truckName: truck?.name,
          buyerName: contractForm.buyerName,
          ownerName: user?.name ?? "مقدم الخدمة",
          price,
          type: contractForm.type,
          depositAmount: deposit,
          rentalDuration: contractForm.type === "rent" ? contractForm.rentalDuration : undefined,
          rentalPeriodCount: contractForm.type === "rent" ? periodCount : undefined,
          startDate: contractForm.startDate || undefined,
          endDate: contractForm.endDate || undefined,
        },
      },
      {
        onSuccess: () => {
          setContractOpen(false);
          setContractForm({ truckId: "", buyerName: "", price: "", depositAmount: "", type: "sale", rentalDuration: "monthly", rentalPeriodCount: "", startDate: "", endDate: "" });
          invalidateAll();
        },
      }
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-black text-white py-10 border-b border-primary/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                <Truck className="w-7 h-7 text-black" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-primary mb-1 text-sm font-medium">
                  <Truck className="w-4 h-4" /> بوابة مقدم الخدمة
                </div>
                <h1 className="text-2xl font-black">مرحباً، {user?.name ?? "صاحب العربات"}</h1>
                <p className="text-gray-400 text-sm">إدارة عرباتك واستفساراتك وعقودك ومحفظتك</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Dialog open={contractOpen} onOpenChange={setContractOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2 h-11 border-white/20 text-white hover:bg-white/10 hover:text-white">
                    <ScrollText className="w-4 h-4" />
                    إنشاء عقد
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="font-black text-xl">إنشاء عقد جديد</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateContract} className="space-y-4 mt-2">
                    <div className="space-y-2">
                      <Label className="font-bold">العربة</Label>
                      <Select value={contractForm.truckId} onValueChange={v => setContractForm(p => ({ ...p, truckId: v }))}>
                        <SelectTrigger><SelectValue placeholder="اختر عربة" /></SelectTrigger>
                        <SelectContent>
                          {trucks?.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold">نوع العقد</Label>
                      <Select value={contractForm.type} onValueChange={v => setContractForm(p => ({ ...p, type: v as "sale" | "rent" }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sale">بيع</SelectItem>
                          <SelectItem value="rent">إيجار</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold">اسم المشتري / المستأجر</Label>
                      <Input placeholder="الاسم الكامل" value={contractForm.buyerName} onChange={e => setContractForm(p => ({ ...p, buyerName: e.target.value }))} required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="font-bold">القيمة الإجمالية (ريال)</Label>
                        <Input type="number" min="1" placeholder="0" value={contractForm.price} onChange={e => setContractForm(p => ({ ...p, price: e.target.value }))} required />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold">الدفعة الأولى / العربون</Label>
                        <Input type="number" min="0" placeholder="30% تلقائياً" value={contractForm.depositAmount} onChange={e => setContractForm(p => ({ ...p, depositAmount: e.target.value }))} />
                      </div>
                    </div>
                    {contractForm.type === "rent" && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="font-bold">دورية السداد</Label>
                            <Select value={contractForm.rentalDuration} onValueChange={v => setContractForm(p => ({ ...p, rentalDuration: v as "monthly" | "yearly" }))}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="monthly">شهرياً</SelectItem>
                                <SelectItem value="yearly">سنوياً</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="font-bold">عدد الأقساط</Label>
                            <Input type="number" min="2" placeholder="مثال: 12" value={contractForm.rentalPeriodCount} onChange={e => setContractForm(p => ({ ...p, rentalPeriodCount: e.target.value }))} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="font-bold">تاريخ البداية</Label>
                            <Input type="date" value={contractForm.startDate} onChange={e => setContractForm(p => ({ ...p, startDate: e.target.value }))} />
                          </div>
                          <div className="space-y-2">
                            <Label className="font-bold">تاريخ النهاية</Label>
                            <Input type="date" value={contractForm.endDate} onChange={e => setContractForm(p => ({ ...p, endDate: e.target.value }))} />
                          </div>
                        </div>
                        {contractForm.price && contractForm.rentalPeriodCount && parseInt(contractForm.rentalPeriodCount) > 1 && (
                          <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                            <p className="text-xs text-muted-foreground mb-1">معاينة جدول الدفعات</p>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-bold">الدفعة الأولى</span>
                              <span className="font-black text-primary">
                                {(contractForm.depositAmount ? parseFloat(contractForm.depositAmount) : parseFloat(contractForm.price) * 0.3).toLocaleString("ar-SA")} ريال
                              </span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-sm font-bold">
                                {parseInt(contractForm.rentalPeriodCount) - 1} قسط {contractForm.rentalDuration === "monthly" ? "شهري" : "سنوي"}
                              </span>
                              <span className="font-black text-green-700">
                                {(() => {
                                  const price = parseFloat(contractForm.price);
                                  const dep = contractForm.depositAmount ? parseFloat(contractForm.depositAmount) : price * 0.3;
                                  const remaining = price - dep;
                                  const installment = remaining / (parseInt(contractForm.rentalPeriodCount) - 1);
                                  return installment.toLocaleString("ar-SA", { maximumFractionDigits: 2 });
                                })()} ريال / قسط
                              </span>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    <Button type="submit" className="w-full font-bold" disabled={createContractMutation.isPending}>
                      {createContractMutation.isPending ? "جاري الإنشاء..." : "إنشاء العقد"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
              <Link href="/list-truck">
                <Button className="gap-2 h-11 font-bold">
                  <PlusCircle className="w-5 h-5" />
                  أضف عربة
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "إجمالي العربات", value: trucks?.length ?? 0, icon: Truck, color: "text-primary" },
            { label: "استفسارات معلّقة", value: pending, icon: AlertCircle, color: "text-orange-500" },
            { label: "عقود نشطة", value: contracts?.filter(c => c.status === "active").length ?? 0, icon: FileText, color: "text-purple-500" },
            { label: "عقود منجزة", value: contracts?.filter(c => c.status === "completed").length ?? 0, icon: CheckCircle2, color: "text-green-500" },
          ].map((stat, i) => (
            <Card key={i} className="border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-muted-foreground text-sm">{stat.label}</span>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className="text-3xl font-black">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Revenue + Wallet summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-primary text-primary-foreground border-none">
            <CardContent className="p-7 flex items-center justify-between">
              <div>
                <div className="opacity-80 text-sm mb-1">إجمالي الإيرادات المنجزة</div>
                <div className="text-4xl font-black">{totalRevenue.toLocaleString("ar-SA")} <span className="text-xl font-bold">ريال</span></div>
              </div>
              <TrendingUp className="w-14 h-14 opacity-25" />
            </CardContent>
          </Card>
          <Card className="border">
            <CardContent className="p-7 flex items-center justify-between">
              <div>
                <div className="text-muted-foreground text-sm mb-1">رصيد المحفظة</div>
                <div className="text-4xl font-black">{walLoading ? "..." : (wallet?.balance ?? 0).toLocaleString("ar-SA")} <span className="text-xl font-normal text-muted-foreground">ريال</span></div>
                {(wallet?.escrowBalance ?? 0) > 0 && (
                  <div className="text-sm text-orange-500 mt-1">محجوز: {wallet!.escrowBalance.toLocaleString("ar-SA")} ريال</div>
                )}
              </div>
              <Wallet className="w-14 h-14 text-primary opacity-20" />
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="trucks">
          <TabsList className="mb-6 bg-muted rounded-xl p-1 gap-1 w-full md:w-auto">
            <TabsTrigger value="trucks" className="rounded-lg font-bold gap-1.5"><Truck className="w-4 h-4" />عرباتي</TabsTrigger>
            <TabsTrigger value="inquiries" className="rounded-lg font-bold gap-1.5 relative">
              <MessageSquare className="w-4 h-4" />الاستفسارات
              {pending > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">{pending}</span>}
            </TabsTrigger>
            <TabsTrigger value="contracts" className="rounded-lg font-bold gap-1.5"><FileText className="w-4 h-4" />العقود</TabsTrigger>
            <TabsTrigger value="wallet" className="rounded-lg font-bold gap-1.5"><Wallet className="w-4 h-4" />المحفظة</TabsTrigger>
          </TabsList>

          {/* My Trucks */}
          <TabsContent value="trucks">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {trucksLoading
                ? [1,2,3].map(i => <Skeleton key={i} className="h-52 rounded-2xl" />)
                : trucks?.map(truck => (
                  <Card key={truck.id} className="border hover:shadow-md transition-all">
                    <div className="h-36 bg-muted rounded-t-xl overflow-hidden">
                      <img src={truck.images?.[0] || "/images/truck-placeholder.jpg"} alt={truck.name} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = "/logo.jpeg"; }} />
                    </div>
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-base leading-tight">{truck.name}</h3>
                          <div className="flex items-center gap-1 text-muted-foreground text-xs mt-1">
                            <MapPin className="w-3 h-3" />{truck.location}
                          </div>
                        </div>
                        <Badge variant={truck.listingType === "sale" ? "default" : "secondary"} className="text-xs shrink-0">
                          {truck.listingType === "sale" ? "للبيع" : "للإيجار"}
                        </Badge>
                      </div>
                      <div className="text-xl font-black text-primary mb-4">
                        {truck.price.toLocaleString("ar-SA")} <span className="text-xs text-muted-foreground font-normal">ريال</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/trucks/${truck.id}`}>
                          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                            <Eye className="w-3.5 h-3.5" />عرض
                          </Button>
                        </Link>
                        <Link href={`/edit-truck/${truck.id}`}>
                          <Button variant="outline" size="sm" className="gap-1.5 text-xs border-primary/40 text-primary hover:bg-primary/10">
                            <Pencil className="w-3.5 h-3.5" />تعديل
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant={truck.available ? "default" : "secondary"}
                          className="gap-1.5 text-xs"
                          onClick={() => handleToggleAvail(truck.id, truck.available)}
                          disabled={toggleAvailMutation.isPending}
                        >
                          {truck.available
                            ? <><ToggleRight className="w-3.5 h-3.5" />متاحة</>
                            : <><ToggleLeft className="w-3.5 h-3.5" />محجوبة</>
                          }
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              <Link href="/list-truck">
                <Card className="border-2 border-dashed hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer h-full min-h-[200px] flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <PlusCircle className="w-10 h-10 mx-auto mb-2 text-primary/50" />
                    <div className="font-bold">أضف عربة جديدة</div>
                  </div>
                </Card>
              </Link>
            </div>
          </TabsContent>

          {/* Inquiries */}
          <TabsContent value="inquiries">
            <div className="space-y-4">
              {inqLoading
                ? [1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)
                : inquiries?.length === 0
                  ? (
                    <div className="text-center py-20 bg-card rounded-2xl border border-dashed">
                      <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
                      <p className="text-muted-foreground font-medium">لا توجد استفسارات حتى الآن</p>
                    </div>
                  )
                  : inquiries?.map(inq => (
                    <Card key={inq.id} className={`border transition-shadow hover:shadow-sm ${inq.status === "pending" ? "border-orange-200 bg-orange-50/30" : ""}`}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex items-start gap-4">
                            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                              <User className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold">{inq.customerName}</span>
                                <Badge variant={inq.type === "rent" ? "secondary" : "default"} className="text-xs">
                                  {inq.type === "rent" ? "استئجار" : "شراء"}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground font-medium mb-1">{inq.truckName ?? "عربة"}</div>
                              {inq.message && (
                                <div className="text-sm bg-muted rounded-lg p-3 mt-2 leading-relaxed">"{inq.message}"</div>
                              )}
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                                <Clock className="w-3 h-3" />
                                {new Date(inq.createdAt).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <Badge variant={inq.status === "confirmed" ? "default" : inq.status === "pending" ? "secondary" : "destructive"} className="text-xs">
                              {inq.status === "pending" ? "قيد الانتظار" : inq.status === "confirmed" ? "مقبول" : "مرفوض"}
                            </Badge>
                            {inq.status === "pending" && (
                              <div className="flex gap-2 mt-1">
                                <Button
                                  size="sm"
                                  className="gap-1.5 h-9 px-4 font-bold"
                                  onClick={() => handleRespond(inq.id, "confirmed")}
                                  disabled={respondMutation.isPending}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  قبول
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-1.5 h-9 px-4 text-red-500 border-red-200 hover:bg-red-50"
                                  onClick={() => handleRespond(inq.id, "rejected")}
                                  disabled={respondMutation.isPending}
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  رفض
                                </Button>
                              </div>
                            )}
                            {inq.status === "confirmed" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5 h-8 text-xs"
                                onClick={() => {
                                  const truck = trucks?.find(t => t.name === inq.truckName);
                                  setContractForm(p => ({
                                    ...p,
                                    truckId: truck ? String(truck.id) : "",
                                    truckName: inq.truckName ?? "",
                                    buyerName: inq.customerName,
                                    type: inq.type,
                                  }));
                                  setContractOpen(true);
                                }}
                              >
                                <ScrollText className="w-3 h-3" />
                                إنشاء عقد
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
            </div>
          </TabsContent>

          {/* Contracts */}
          <TabsContent value="contracts">
            <div className="space-y-4">
              {conLoading
                ? [1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)
                : contracts?.length === 0
                  ? (
                    <div className="text-center py-20 bg-card rounded-2xl border border-dashed">
                      <FileText className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
                      <p className="text-muted-foreground font-medium">لا توجد عقود بعد</p>
                      <Button size="sm" className="mt-4 gap-2" onClick={() => setContractOpen(true)}>
                        <PlusCircle className="w-4 h-4" />إنشاء عقد
                      </Button>
                    </div>
                  )
                  : contracts?.map(con => (
                    <Card key={con.id} className="border hover:shadow-sm transition-shadow">
                      <CardContent className="p-5 flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                            <ScrollText className="w-5 h-5 text-purple-500" />
                          </div>
                          <div>
                            <div className="font-bold">{con.truckName ?? "عربة"}</div>
                            <div className="text-sm text-muted-foreground">عقد {con.type === "sale" ? "بيع" : "إيجار"} — {con.buyerName}</div>
                            {con.startDate && con.endDate && (
                              <div className="text-xs text-muted-foreground mt-0.5">{con.startDate} → {con.endDate}</div>
                            )}
                            <div className="text-xs text-muted-foreground">{new Date(con.createdAt).toLocaleDateString("ar-SA")}</div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-xl font-black">{con.price.toLocaleString("ar-SA")} <span className="text-xs text-muted-foreground font-normal">ريال</span></div>
                          {con.depositAmount && (
                            <div className="text-xs text-orange-500">دفعة أولى: {con.depositAmount.toLocaleString("ar-SA")} ريال</div>
                          )}
                          <Badge variant={con.status === "active" ? "default" : con.status === "completed" ? "secondary" : "destructive"} className="text-xs">
                            {con.status === "active" ? "نشط" : con.status === "completed" ? "منجز" : "ملغي"}
                          </Badge>
                          <Link href={`/contracts/${con.id}`}>
                            <Button variant="ghost" size="sm" className="text-xs h-7 gap-1">
                              <ChevronLeft className="w-3 h-3" />عرض العقد
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
            </div>
          </TabsContent>

          {/* Wallet */}
          <TabsContent value="wallet">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <h3 className="font-bold text-lg">سجل المعاملات</h3>
                {walLoading
                  ? [1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)
                  : wallet?.transactions?.length === 0
                    ? <div className="text-center py-12 text-muted-foreground bg-card rounded-2xl border border-dashed">لا توجد معاملات</div>
                    : wallet?.transactions?.map(tx => (
                      <Card key={tx.id} className="border">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === "deposit" ? "bg-green-500/10" : tx.type === "escrow" ? "bg-orange-500/10" : "bg-blue-500/10"}`}>
                              <Wallet className={`w-4 h-4 ${tx.type === "deposit" ? "text-green-500" : tx.type === "escrow" ? "text-orange-500" : "text-blue-500"}`} />
                            </div>
                            <div>
                              <div className="font-medium text-sm">{tx.description || (tx.type === "deposit" ? "إيداع" : tx.type === "escrow" ? "حجز ضمان" : "تحويل")}</div>
                              <div className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString("ar-SA")}</div>
                            </div>
                          </div>
                          <div className={`font-black text-base ${tx.type === "deposit" ? "text-green-500" : "text-foreground"}`}>
                            {tx.type === "deposit" ? "+" : "-"}{tx.amount.toLocaleString("ar-SA")} ريال
                          </div>
                        </CardContent>
                      </Card>
                    ))}
              </div>

              <div className="space-y-4">
                {/* Balance Summary */}
                <Card className="bg-black text-white border-none">
                  <CardContent className="p-6 space-y-3">
                    <div className="text-gray-400 text-sm">ملخص المحفظة</div>
                    <Separator className="bg-white/10" />
                    {[
                      { label: "الرصيد المتاح", value: wallet?.balance ?? 0, color: "text-primary" },
                      { label: "محجوز (ضمان)", value: wallet?.escrowBalance ?? 0, color: "text-orange-400" },
                      { label: "إجمالي الإيداعات", value: wallet?.totalDeposited ?? 0, color: "text-green-400" },
                      { label: "إجمالي المحوّل", value: wallet?.totalTransferred ?? 0, color: "text-blue-400" },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">{item.label}</span>
                        <span className={`font-black ${item.color}`}>{(walLoading ? 0 : item.value).toLocaleString("ar-SA")} ر</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Deposit Form */}
                <Card className="border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <ArrowDownToLine className="w-4 h-4 text-primary" />
                      إيداع أموال
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleDeposit} className="space-y-3">
                      <div>
                        <Label className="text-sm font-bold mb-1.5 block">المبلغ (ريال)</Label>
                        <Input type="number" placeholder="0.00" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} min="1" required className="h-11" />
                      </div>
                      <div>
                        <Label className="text-sm font-bold mb-1.5 block">الوصف (اختياري)</Label>
                        <Input placeholder="وصف المعاملة" value={depositDesc} onChange={e => setDepositDesc(e.target.value)} className="h-11" />
                      </div>
                      <Button type="submit" className="w-full font-bold gap-2" disabled={depositMutation.isPending}>
                        {depositMutation.isPending ? "جاري الإيداع..." : <><ArrowDownToLine className="w-4 h-4" />إيداع</>}
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
