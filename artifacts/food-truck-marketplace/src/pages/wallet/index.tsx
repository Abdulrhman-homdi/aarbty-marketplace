import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  useGetWalletBalance,
  useWalletDeposit,
  useWalletTransfer,
  getGetWalletBalanceQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Wallet, ArrowDownCircle, ArrowUpCircle, Shield, TrendingUp } from "lucide-react";

export default function WalletPage() {
  const queryClient = useQueryClient();
  const { data: wallet, isLoading } = useGetWalletBalance({
    query: { queryKey: getGetWalletBalanceQueryKey() },
  });
  const depositMutation = useWalletDeposit();
  const transferMutation = useWalletTransfer();

  const [depositAmount, setDepositAmount] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [depositDesc, setDepositDesc] = useState("");

  function handleDeposit() {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) return;
    depositMutation.mutate(
      { data: { amount, description: depositDesc || "إيداع رصيد" } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetWalletBalanceQueryKey() });
          setDepositAmount("");
          setDepositDesc("");
        },
      }
    );
  }

  function handleTransfer() {
    const amount = parseFloat(transferAmount);
    if (!amount || amount <= 0) return;
    transferMutation.mutate(
      { data: { amount, description: "تحويل للمالك" } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetWalletBalanceQueryKey() });
          setTransferAmount("");
        },
      }
    );
  }

  const txTypeLabels: Record<string, string> = {
    deposit: "إيداع",
    escrow: "ضمان",
    transfer: "تحويل",
  };

  const txTypeColors: Record<string, string> = {
    deposit: "bg-green-100 text-green-800",
    escrow: "bg-yellow-100 text-yellow-800",
    transfer: "bg-blue-100 text-blue-800",
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-foreground">المحفظة الإلكترونية</h1>
          <p className="text-muted-foreground mt-1">
            نظام الدفع الآمن عبر الضمان
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">جاري التحميل...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Balances */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="border-2 border-primary bg-primary/5">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Wallet className="w-6 h-6 text-primary" />
                      <span className="font-bold text-muted-foreground">الرصيد المتاح</span>
                    </div>
                    <p className="text-4xl font-black text-primary">
                      {(wallet?.balance ?? 0).toLocaleString("ar-SA")}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">ريال سعودي</p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-orange-200 bg-orange-50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Shield className="w-6 h-6 text-orange-600" />
                      <span className="font-bold text-muted-foreground">رصيد الضمان</span>
                    </div>
                    <p className="text-4xl font-black text-orange-600">
                      {(wallet?.escrowBalance ?? 0).toLocaleString("ar-SA")}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">ريال سعودي</p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-green-200 bg-green-50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <ArrowDownCircle className="w-5 h-5 text-green-600" />
                      <span className="font-bold text-muted-foreground">إجمالي الإيداعات</span>
                    </div>
                    <p className="text-3xl font-black text-green-700">
                      {(wallet?.totalDeposited ?? 0).toLocaleString("ar-SA")}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">ريال سعودي</p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-blue-200 bg-blue-50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <ArrowUpCircle className="w-5 h-5 text-blue-600" />
                      <span className="font-bold text-muted-foreground">إجمالي التحويلات</span>
                    </div>
                    <p className="text-3xl font-black text-blue-700">
                      {(wallet?.totalTransferred ?? 0).toLocaleString("ar-SA")}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">ريال سعودي</p>
                  </CardContent>
                </Card>
              </div>

              {/* Transaction History */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    سجل المعاملات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {wallet?.transactions && wallet.transactions.length > 0 ? (
                    <div className="space-y-3">
                      {wallet.transactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Badge className={`text-xs ${txTypeColors[tx.type]}`} variant="secondary">
                              {txTypeLabels[tx.type]}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {tx.description ?? "معاملة مالية"}
                            </span>
                          </div>
                          <div className="text-left">
                            <p className={`font-black ${tx.type === "deposit" ? "text-green-600" : tx.type === "transfer" ? "text-blue-600" : "text-orange-600"}`}>
                              {tx.type === "deposit" ? "+" : "-"}
                              {Number(tx.amount).toLocaleString("ar-SA")} ريال
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(tx.createdAt).toLocaleDateString("ar-SA")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-muted-foreground">
                      <Wallet className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>لا توجد معاملات بعد</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ArrowDownCircle className="w-5 h-5 text-green-600" />
                    إيداع رصيد
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    type="number"
                    placeholder="المبلغ بالريال"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="text-right"
                  />
                  <Input
                    placeholder="وصف العملية (اختياري)"
                    value={depositDesc}
                    onChange={(e) => setDepositDesc(e.target.value)}
                    className="text-right"
                  />
                  <Button
                    className="w-full font-bold"
                    onClick={handleDeposit}
                    disabled={depositMutation.isPending}
                  >
                    {depositMutation.isPending ? "جاري الإيداع..." : "إيداع"}
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ArrowUpCircle className="w-5 h-5 text-blue-600" />
                    تحويل للمالك
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    type="number"
                    placeholder="المبلغ بالريال"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="text-right"
                  />
                  <Button
                    variant="outline"
                    className="w-full font-bold border-blue-200 text-blue-700 hover:bg-blue-50"
                    onClick={handleTransfer}
                    disabled={transferMutation.isPending}
                  >
                    {transferMutation.isPending ? "جاري التحويل..." : "تحويل"}
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-muted bg-muted/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-sm mb-1">نظام الضمان الآمن</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        تُحتفظ المبالغ في محفظة الضمان حتى اكتمال الصفقة، مما يضمن حقوق الطرفين.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
