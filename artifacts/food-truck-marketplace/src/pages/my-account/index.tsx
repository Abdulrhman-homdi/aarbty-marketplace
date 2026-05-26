import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListInquiries, useListContracts, useGetWalletBalance, useWalletDeposit,
  getListInquiriesQueryKey, getListContractsQueryKey, getGetWalletBalanceQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@/context/auth-context";
import { apiGet2faStatus, apiToggle2fa, apiSendOtp, apiVerifyOtp } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  MessageSquare, FileText, Wallet, TrendingDown, ArrowUpRight,
  Clock, CheckCircle2, XCircle, User, PlusCircle, ArrowDownToLine,
  ShoppingCart, Home, Star, ChevronLeft, Search,
  Mail, Smartphone, ShieldCheck, ShieldOff, KeyRound
} from "lucide-react";

export default function MyAccount() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: inquiries, isLoading: inqLoading } = useListInquiries({}, { query: { queryKey: getListInquiriesQueryKey() } });
  const { data: contracts, isLoading: conLoading } = useListContracts({}, { query: { queryKey: getListContractsQueryKey() } });
  const { data: wallet, isLoading: walLoading } = useGetWalletBalance({ query: { queryKey: getGetWalletBalanceQueryKey() } });

  const depositMutation = useWalletDeposit();
  const [twoFactorStatus, setTwoFactorStatus] = useState<{ email: boolean; sms: boolean; phone: string | null } | null>(null);
  const [togglingEmail, setTogglingEmail] = useState(false);
  const [togglingSms, setTogglingSms] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState("");
  const [twoFactorSuccess, setTwoFactorSuccess] = useState("");

  // 2FA verify inline
  const [verifyMethod, setVerifyMethod] = useState<"email" | "sms" | null>(null);
  const [verifyOtp, setVerifyOtp] = useState("");
  const [verifySent, setVerifySent] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  useEffect(() => {
    apiGet2faStatus().then(setTwoFactorStatus).catch(() => {});
  }, []);

  async function handleToggle2fa(method: "email" | "sms", enabled: boolean) {
    setTwoFactorError("");
    setTwoFactorSuccess("");
    if (enabled) {
      setVerifyMethod(method);
      return;
    }
    if (method === "email") setTogglingEmail(true);
    else setTogglingSms(true);
    try {
      await apiToggle2fa(method, false);
      setTwoFactorStatus(prev => prev ? { ...prev, [method]: false } : prev);
      setTwoFactorSuccess(`تم إلغاء التحقق عبر ${method === "email" ? "البريد" : "الجوال"}`);
    } catch (err) {
      setTwoFactorError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setTogglingEmail(false);
      setTogglingSms(false);
    }
  }

  async function handleVerifySend() {
    if (!verifyMethod) return;
    setTwoFactorError("");
    setVerifyLoading(true);
    try {
      await apiSendOtp(verifyMethod);
      setVerifySent(true);
    } catch (err) {
      setTwoFactorError(err instanceof Error ? err.message : "فشل الإرسال");
    } finally {
      setVerifyLoading(false);
    }
  }

  async function handleVerifyConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (!verifyMethod) return;
    setTwoFactorError("");
    setVerifyLoading(true);
    try {
      await apiVerifyOtp(verifyOtp, verifyMethod);
      await apiToggle2fa(verifyMethod, true);
      setTwoFactorStatus(prev => prev ? { ...prev, [verifyMethod!]: true } : prev);
      setTwoFactorSuccess(`تم تفعيل التحقق الثنائي عبر ${verifyMethod === "email" ? "البريد الإلكتروني" : "رسائل الجوال"}`);
      setVerifyMethod(null);
      setVerifySent(false);
      setVerifyOtp("");
    } catch (err) {
      setTwoFactorError(err instanceof Error ? err.message : "كود غير صحيح");
    } finally {
      setVerifyLoading(false);
    }
  }

  const [depositAmount, setDepositAmount] = useState("");
  const [depositDesc, setDepositDesc] = useState("");
  const [depositSuccess, setDepositSuccess] = useState(false);

  const pendingCount = inquiries?.filter(i => i.status === "pending").length ?? 0;
  const confirmedCount = inquiries?.filter(i => i.status === "confirmed").length ?? 0;

  function handleDeposit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) return;
    depositMutation.mutate(
      { data: { amount, description: depositDesc || "إيداع من المستفيد" } },
      {
        onSuccess: () => {
          setDepositAmount("");
          setDepositDesc("");
          setDepositSuccess(true);
          setTimeout(() => setDepositSuccess(false), 3000);
          qc.invalidateQueries({ queryKey: getGetWalletBalanceQueryKey() });
        },
      }
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-black text-white py-10 border-b border-primary/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center ring-4 ring-primary/30">
                <User className="w-8 h-8 text-black" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-primary text-sm font-medium mb-1">
                  <User className="w-4 h-4" /> بوابة المستفيد
                </div>
                <h1 className="text-2xl font-black">مرحباً، {user?.name ?? "العزيز"}</h1>
                <p className="text-gray-400 text-sm">تتبّع استفساراتك وعقودك وإدارة محفظتك</p>
              </div>
            </div>
            <Link href="/trucks">
              <Button className="gap-2 h-11 font-bold">
                <Search className="w-4 h-4" />
                تصفح العربات
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "إجمالي استفساراتي", value: inquiries?.length ?? 0, icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "استفسارات مقبولة", value: confirmedCount, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
            { label: "قيد الانتظار", value: pendingCount, icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10" },
            { label: "عقودي", value: contracts?.length ?? 0, icon: FileText, color: "text-purple-500", bg: "bg-purple-500/10" },
          ].map((s, i) => (
            <Card key={i} className="border">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-muted-foreground text-xs">{s.label}</span>
                  <div className={`w-8 h-8 rounded-full ${s.bg} flex items-center justify-center`}>
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                </div>
                <div className="text-3xl font-black">{s.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Wallet Banner */}
        <Card className="bg-black text-white border-primary/20 border">
          <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                <Wallet className="w-7 h-7 text-primary" />
              </div>
              <div>
                <div className="text-gray-400 text-sm">الرصيد المتاح في المحفظة</div>
                <div className="text-4xl font-black text-primary">
                  {walLoading ? "..." : (wallet?.balance ?? 0).toLocaleString("ar-SA")}
                  <span className="text-lg text-white font-normal ml-1"> ريال</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="text-center">
                <div className="text-white font-bold">{(wallet?.escrowBalance ?? 0).toLocaleString("ar-SA")}</div>
                <div>محجوز</div>
              </div>
              <Separator orientation="vertical" className="h-8 bg-white/10" />
              <div className="text-center">
                <div className="text-white font-bold">{(wallet?.totalDeposited ?? 0).toLocaleString("ar-SA")}</div>
                <div>إجمالي الإيداع</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="inquiries">
          <TabsList className="mb-6 bg-muted rounded-xl p-1 gap-1 w-full md:w-auto">
            <TabsTrigger value="inquiries" className="rounded-lg font-bold gap-1.5 relative">
              <MessageSquare className="w-4 h-4" />استفساراتي
              {pendingCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[10px] rounded-full flex items-center justify-center">{pendingCount}</span>}
            </TabsTrigger>
            <TabsTrigger value="contracts" className="rounded-lg font-bold gap-1.5"><FileText className="w-4 h-4" />عقودي</TabsTrigger>
            <TabsTrigger value="wallet" className="rounded-lg font-bold gap-1.5"><Wallet className="w-4 h-4" />المحفظة</TabsTrigger>
            <TabsTrigger value="profile" className="rounded-lg font-bold gap-1.5"><User className="w-4 h-4" />ملفي</TabsTrigger>
          </TabsList>

          {/* Inquiries */}
          <TabsContent value="inquiries">
            <div className="space-y-4">
              {inqLoading
                ? [1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)
                : inquiries?.length === 0
                  ? (
                    <div className="text-center py-20 bg-card rounded-2xl border border-dashed">
                      <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
                      <p className="text-muted-foreground font-medium mb-4">لم تُرسل أي استفسارات بعد</p>
                      <Link href="/trucks">
                        <Button className="gap-2"><Search className="w-4 h-4" />ابحث عن عربة</Button>
                      </Link>
                    </div>
                  )
                  : inquiries?.map(inq => (
                    <Card key={inq.id} className={`border transition-shadow hover:shadow-sm ${inq.status === "confirmed" ? "border-green-200" : ""}`}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex items-start gap-4">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                              inq.status === "confirmed" ? "bg-green-500/10" :
                              inq.status === "rejected" ? "bg-red-500/10" : "bg-muted"
                            }`}>
                              {inq.status === "confirmed"
                                ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                                : inq.status === "rejected"
                                  ? <XCircle className="w-5 h-5 text-red-500" />
                                  : <Clock className="w-5 h-5 text-orange-500" />
                              }
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="font-bold">{inq.truckName ?? "عربة"}</span>
                                <Badge variant={inq.type === "rent" ? "secondary" : "default"} className="text-xs">
                                  {inq.type === "rent" ? "استئجار" : "شراء"}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">من: {inq.customerName}</div>
                              {inq.message && (
                                <div className="text-sm bg-muted rounded-lg p-2.5 mt-2 leading-relaxed text-muted-foreground">
                                  "{inq.message}"
                                </div>
                              )}
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                                <Clock className="w-3 h-3" />
                                {new Date(inq.createdAt).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <Badge variant={
                              inq.status === "confirmed" ? "default" :
                              inq.status === "pending" ? "secondary" : "destructive"
                            } className="text-xs">
                              {inq.status === "pending" ? "قيد المراجعة" : inq.status === "confirmed" ? "مقبول" : "مرفوض"}
                            </Badge>
                            {inq.status === "confirmed" && (
                              <div className="text-xs text-green-600 bg-green-50 border border-green-100 rounded-lg px-3 py-1.5 text-center">
                                تواصل مع المالك لإتمام الإجراءات
                              </div>
                            )}
                            <Link href={`/trucks/${inq.truckId}`}>
                              <Button variant="ghost" size="sm" className="text-xs h-7 gap-1">
                                <Eye className="w-3 h-3" />عرض العربة
                              </Button>
                            </Link>
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
                ? [1,2].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)
                : contracts?.length === 0
                  ? (
                    <div className="text-center py-20 bg-card rounded-2xl border border-dashed">
                      <FileText className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
                      <p className="text-muted-foreground font-medium">لا توجد عقود بعد</p>
                      <p className="text-xs text-muted-foreground mt-1">ستظهر عقودك هنا بعد قبول استفساراتك</p>
                    </div>
                  )
                  : contracts?.map(con => (
                    <Card key={con.id} className="border hover:shadow-sm transition-shadow">
                      <CardContent className="p-5 flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-purple-500" />
                          </div>
                          <div>
                            <div className="font-bold">{con.truckName ?? "عربة"}</div>
                            <div className="text-sm text-muted-foreground">
                              عقد {con.type === "sale" ? "بيع" : "إيجار"} — {con.ownerName ?? "المالك"}
                            </div>
                            {con.startDate && (
                              <div className="text-xs text-muted-foreground">{con.startDate} → {con.endDate}</div>
                            )}
                            <div className="text-xs text-muted-foreground mt-0.5">{new Date(con.createdAt).toLocaleDateString("ar-SA")}</div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-xl font-black">{con.price.toLocaleString("ar-SA")} <span className="text-xs text-muted-foreground font-normal">ريال</span></div>
                          {con.depositAmount && (
                            <div className="text-xs text-orange-500">دفعة أولى: {con.depositAmount.toLocaleString("ar-SA")}</div>
                          )}
                          <Badge variant={con.status === "active" ? "default" : "secondary"} className="text-xs">
                            {con.status === "active" ? "نشط" : con.status === "completed" ? "منجز" : "ملغي"}
                          </Badge>
                          <Link href={`/contracts/${con.id}`}>
                            <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
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
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">سجل المعاملات</h3>
                  <span className="text-xs text-muted-foreground">{wallet?.transactions?.length ?? 0} معاملة</span>
                </div>
                {walLoading
                  ? [1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)
                  : wallet?.transactions?.length === 0
                    ? (
                      <div className="text-center py-16 bg-card rounded-2xl border border-dashed">
                        <Wallet className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
                        <p className="text-muted-foreground text-sm">لا توجد معاملات بعد</p>
                      </div>
                    )
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
                              <div className="font-medium text-sm">
                                {tx.description || (tx.type === "deposit" ? "إيداع" : tx.type === "escrow" ? "حجز ضمان" : "تحويل")}
                              </div>
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
                {/* Balances */}
                <Card className="border">
                  <CardContent className="p-5 space-y-3">
                    {[
                      { label: "الرصيد المتاح", value: wallet?.balance ?? 0, color: "text-primary font-black text-xl" },
                      { label: "محجوز (ضمان)", value: wallet?.escrowBalance ?? 0, color: "text-orange-500" },
                      { label: "إجمالي الإيداع", value: wallet?.totalDeposited ?? 0, color: "text-green-600" },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">{item.label}</span>
                        <span className={item.color}>{walLoading ? "..." : item.value.toLocaleString("ar-SA")} ر</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Deposit Form */}
                <Card className="border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <ArrowDownToLine className="w-4 h-4 text-primary" />
                      إيداع رصيد
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {depositSuccess && (
                      <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-3 py-2 mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        تم الإيداع بنجاح
                      </div>
                    )}
                    <form onSubmit={handleDeposit} className="space-y-3">
                      <div>
                        <Label className="text-sm font-bold mb-1.5 block">المبلغ (ريال)</Label>
                        <Input type="number" placeholder="0.00" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} min="1" required className="h-11" />
                      </div>
                      <div>
                        <Label className="text-sm font-bold mb-1.5 block">الوصف</Label>
                        <Input placeholder="سبب الإيداع" value={depositDesc} onChange={e => setDepositDesc(e.target.value)} className="h-11" />
                      </div>
                      <Button type="submit" className="w-full font-bold gap-2" disabled={depositMutation.isPending}>
                        {depositMutation.isPending ? "جاري..." : <><ArrowDownToLine className="w-4 h-4" />إيداع</>}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Profile */}
          <TabsContent value="profile">
            <div className="max-w-lg space-y-6">
              <Card className="border">
                <CardContent className="p-8">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
                      <User className="w-10 h-10 text-black" />
                    </div>
                    <div>
                      <div className="text-2xl font-black">{user?.name}</div>
                      <Badge className="mt-1">{user?.role === "provider" ? "مقدم خدمة" : user?.role === "admin" ? "مدير" : "مستفيد"}</Badge>
                    </div>
                  </div>
                  <Separator className="mb-6" />
                  <div className="space-y-4 text-sm">
                    {[
                      { label: "نوع الحساب", value: user?.role === "provider" ? "مقدم خدمة" : user?.role === "admin" ? "مدير" : "مستفيد" },
                      { label: "الاستفسارات", value: `${inquiries?.length ?? 0} استفسار` },
                      { label: "العقود", value: `${contracts?.length ?? 0} عقد` },
                      { label: "رصيد المحفظة", value: `${(wallet?.balance ?? 0).toLocaleString("ar-SA")} ريال` },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-bold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="border border-dashed bg-muted/30">
                <CardContent className="p-6 text-center text-muted-foreground text-sm">
                  <Star className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="font-medium">برنامج المكافآت قريباً</p>
                  <p className="text-xs mt-1">اكسب نقاط مع كل عملية شراء أو استئجار</p>
                </CardContent>
              </Card>

              {/* ─── 2FA Settings ─── */}
              <Card className="border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    <h3 className="font-bold">التحقق الثنائي (2FA)</h3>
                  </div>

                  {twoFactorSuccess && (
                    <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-3 py-2 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      {twoFactorSuccess}
                    </div>
                  )}
                  {twoFactorError && (
                    <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3 text-center">
                      {twoFactorError}
                    </div>
                  )}

                  {/* Verify inline */}
                  {verifyMethod && (
                    <div className="bg-muted rounded-xl p-4 mb-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm font-bold">
                        {verifyMethod === "email" ? <Mail className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                        {verifyMethod === "email" ? "تفعيل عبر البريد الإلكتروني" : "تفعيل عبر الجوال"}
                      </div>
                      {!verifySent ? (
                        <Button onClick={handleVerifySend} disabled={verifyLoading} className="w-full gap-2" size="sm">
                          {verifyLoading ? "جاري الإرسال..." : "إرسال كود التحقق"}
                        </Button>
                      ) : (
                        <form onSubmit={handleVerifyConfirm} className="space-y-2">
                          <Input type="text" inputMode="numeric" placeholder="أدخل الكود" maxLength={6}
                            className="h-10 text-center tracking-[6px]" dir="ltr"
                            value={verifyOtp} onChange={e => setVerifyOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} />
                          <Button type="submit" disabled={verifyLoading || verifyOtp.length < 6} className="w-full gap-2" size="sm">
                            {verifyLoading ? "جاري التحقق..." : "تأكيد"}
                          </Button>
                          <button type="button" onClick={handleVerifySend} className="text-xs text-primary w-full text-center">
                            إعادة الإرسال
                          </button>
                        </form>
                      )}
                      <button onClick={() => { setVerifyMethod(null); setVerifySent(false); setVerifyOtp(""); }}
                        className="text-xs text-muted-foreground w-full text-center">إلغاء</button>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">عبر البريد الإلكتروني</span>
                        <span className="text-xs text-muted-foreground">({user?.email})</span>
                      </div>
                      <Button variant={twoFactorStatus?.email ? "default" : "outline"} size="sm"
                        onClick={() => handleToggle2fa("email", !twoFactorStatus?.email)}
                        disabled={togglingEmail} className="h-8 text-xs gap-1 min-w-[90px]">
                        {togglingEmail ? "..." : twoFactorStatus?.email ? <><ShieldCheck className="w-3 h-3" />مفعل</> : <><ShieldOff className="w-3 h-3" />غير مفعل</>}
                      </Button>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">عبر رسائل الجوال</span>
                        <span className="text-xs text-muted-foreground">{user?.phone ? `(${user.phone})` : "(غير مسجل)"}</span>
                      </div>
                      <Button variant={twoFactorStatus?.sms ? "default" : "outline"} size="sm"
                        onClick={() => handleToggle2fa("sms", !twoFactorStatus?.sms)}
                        disabled={togglingSms || !user?.phone} className="h-8 text-xs gap-1 min-w-[90px]">
                        {togglingSms ? "..." : twoFactorStatus?.sms ? <><ShieldCheck className="w-3 h-3" />مفعل</> : <><ShieldOff className="w-3 h-3" />غير مفعل</>}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

const Eye = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
