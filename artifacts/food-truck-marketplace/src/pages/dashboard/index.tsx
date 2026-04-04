import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useListFoodTrucks,
  useListInquiries,
  useGetWalletBalance,
  useGetPlatformStats,
  useRespondToInquiry,
  useDeleteFoodTruck,
  useUpdateFoodTruckAvailability,
  getListFoodTrucksQueryKey,
  getListInquiriesQueryKey,
  getGetWalletBalanceQueryKey,
  getGetPlatformStatsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { TruckCard } from "@/components/truck-card";
import {
  Truck,
  MessageSquare,
  Wallet,
  TrendingUp,
  CheckCircle,
  XCircle,
  PlusCircle,
  Eye,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { data: trucks, isLoading: trucksLoading } = useListFoodTrucks(
    {},
    { query: { queryKey: getListFoodTrucksQueryKey() } }
  );
  const { data: inquiries, isLoading: inquiriesLoading } = useListInquiries(
    {},
    { query: { queryKey: getListInquiriesQueryKey() } }
  );
  const { data: wallet } = useGetWalletBalance({
    query: { queryKey: getGetWalletBalanceQueryKey() },
  });
  const { data: stats } = useGetPlatformStats({
    query: { queryKey: getGetPlatformStatsQueryKey() },
  });

  const respondMutation = useRespondToInquiry();
  const deleteMutation = useDeleteFoodTruck();
  const availabilityMutation = useUpdateFoodTruckAvailability();

  function handleRespond(id: number, status: "confirmed" | "rejected") {
    respondMutation.mutate(
      { id, data: { status } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getListInquiriesQueryKey(),
          });
        },
      }
    );
  }

  function handleDelete(id: number) {
    if (confirm("هل أنت متأكد من حذف هذه العربة؟")) {
      deleteMutation.mutate(
        { id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: getListFoodTrucksQueryKey(),
            });
          },
        }
      );
    }
  }

  function handleToggleAvailability(id: number, current: boolean) {
    availabilityMutation.mutate(
      { id, data: { available: !current } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getListFoodTrucksQueryKey(),
          });
        },
      }
    );
  }

  const statusLabels: Record<string, string> = {
    pending: "قيد الانتظار",
    confirmed: "مؤكد",
    rejected: "مرفوض",
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    confirmed: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-foreground">لوحة التحكم</h1>
            <p className="text-muted-foreground mt-1">
              إدارة عرباتك واستفساراتك وعقودك
            </p>
          </div>
          <Link href="/list-truck">
            <Button className="gap-2 font-bold">
              <PlusCircle className="w-4 h-4" />
              أضف عربة جديدة
            </Button>
          </Link>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-2 border-primary/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Truck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-black">{stats?.totalTrucks ?? 0}</p>
                  <p className="text-xs text-muted-foreground">إجمالي العربات</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-primary/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-yellow-700" />
                </div>
                <div>
                  <p className="text-2xl font-black">{stats?.pendingInquiries ?? 0}</p>
                  <p className="text-xs text-muted-foreground">استفسارات معلقة</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-primary/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-green-700" />
                </div>
                <div>
                  <p className="text-2xl font-black">
                    {(wallet?.balance ?? 0).toLocaleString("ar-SA")}
                  </p>
                  <p className="text-xs text-muted-foreground">رصيد المحفظة (ريال)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-primary/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <p className="text-2xl font-black">{stats?.activeContracts ?? 0}</p>
                  <p className="text-xs text-muted-foreground">عقود نشطة</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="trucks">
          <TabsList className="mb-6 bg-muted/50 p-1 rounded-xl h-auto">
            <TabsTrigger value="trucks" className="rounded-lg px-6 py-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              عرباتي ({trucks?.length ?? 0})
            </TabsTrigger>
            <TabsTrigger value="inquiries" className="rounded-lg px-6 py-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              الاستفسارات ({inquiries?.length ?? 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trucks">
            {trucksLoading ? (
              <div className="text-center py-20 text-muted-foreground">جاري التحميل...</div>
            ) : trucks && trucks.length > 0 ? (
              <div className="space-y-4">
                {trucks.map((truck) => (
                  <Card key={truck.id} className="border-2 hover:border-primary/30 transition-colors">
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Truck className="w-7 h-7 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-lg truncate">{truck.name}</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {truck.location}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`text-xs ${truck.listingType === "sale" ? "border-blue-200 text-blue-700" : "border-green-200 text-green-700"}`}
                            >
                              {truck.listingType === "sale" ? "للبيع" : "للإيجار"}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`text-xs ${truck.available ? "border-green-200 text-green-700" : "border-red-200 text-red-700"}`}
                            >
                              {truck.available ? "متوفرة" : "غير متوفرة"}
                            </Badge>
                          </div>
                          <p className="font-black text-primary mt-1">
                            {Number(truck.price).toLocaleString("ar-SA")} ريال
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleAvailability(truck.id, truck.available)}
                          className="gap-1"
                        >
                          {truck.available ? (
                            <ToggleRight className="w-4 h-4 text-green-600" />
                          ) : (
                            <ToggleLeft className="w-4 h-4 text-red-500" />
                          )}
                          <span className="hidden sm:inline">
                            {truck.available ? "إخفاء" : "إظهار"}
                          </span>
                        </Button>
                        <Link href={`/trucks/${truck.id}`}>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Eye className="w-4 h-4" />
                            <span className="hidden sm:inline">عرض</span>
                          </Button>
                        </Link>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(truck.id)}
                          className="gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">حذف</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Truck className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-xl font-bold text-muted-foreground">لا توجد عربات مسجلة</p>
                <Link href="/list-truck">
                  <Button className="mt-4 gap-2 font-bold">
                    <PlusCircle className="w-4 h-4" />
                    أضف أول عربة
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="inquiries">
            {inquiriesLoading ? (
              <div className="text-center py-20 text-muted-foreground">جاري التحميل...</div>
            ) : inquiries && inquiries.length > 0 ? (
              <div className="space-y-4">
                {inquiries.map((inquiry) => (
                  <Card key={inquiry.id} className="border-2 hover:border-primary/30 transition-colors">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-lg">{inquiry.customerName}</h3>
                            <Badge className={`text-xs border ${statusColors[inquiry.status]}`} variant="outline">
                              {statusLabels[inquiry.status]}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            <span className="font-medium">العربة:</span> {inquiry.truckName ?? `#${inquiry.truckId}`}
                          </p>
                          <p className="text-sm text-muted-foreground mb-1">
                            <span className="font-medium">البريد:</span> {inquiry.customerEmail}
                          </p>
                          {inquiry.customerPhone && (
                            <p className="text-sm text-muted-foreground mb-1">
                              <span className="font-medium">الجوال:</span> {inquiry.customerPhone}
                            </p>
                          )}
                          {inquiry.message && (
                            <p className="text-sm mt-2 p-3 bg-muted rounded-lg">
                              {inquiry.message}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(inquiry.createdAt).toLocaleDateString("ar-SA")}
                          </p>
                        </div>
                        {inquiry.status === "pending" && (
                          <div className="flex flex-col gap-2 flex-shrink-0">
                            <Button
                              size="sm"
                              className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handleRespond(inquiry.id, "confirmed")}
                            >
                              <CheckCircle className="w-4 h-4" />
                              تأكيد التوفر
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="gap-2"
                              onClick={() => handleRespond(inquiry.id, "rejected")}
                            >
                              <XCircle className="w-4 h-4" />
                              رفض
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-xl font-bold text-muted-foreground">لا توجد استفسارات بعد</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
