import { useState } from "react";
import { Link } from "wouter";
import { useListFoodTrucks, useListInquiries, useListContracts, getListFoodTrucksQueryKey, getListInquiriesQueryKey, getListContractsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Truck, PlusCircle, MessageSquare, FileText, TrendingUp,
  CheckCircle2, Clock, XCircle, MapPin, Eye, Settings, Star
} from "lucide-react";

export default function ProviderDashboard() {
  const { data: trucks, isLoading: trucksLoading } = useListFoodTrucks({}, { query: { queryKey: getListFoodTrucksQueryKey() } });
  const { data: inquiries, isLoading: inqLoading } = useListInquiries({}, { query: { queryKey: getListInquiriesQueryKey() } });
  const { data: contracts, isLoading: conLoading } = useListContracts({}, { query: { queryKey: getListContractsQueryKey() } });

  const totalRevenue = contracts?.filter(c => c.status === "completed").reduce((s, c) => s + c.price, 0) ?? 0;
  const pending = inquiries?.filter(i => i.status === "pending").length ?? 0;
  const activeTrucks = trucks?.filter(t => t.available).length ?? 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header Banner */}
      <div className="bg-black text-white py-10 border-b border-primary/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-primary mb-2 text-sm font-medium">
                <Truck className="w-4 h-4" />
                بوابة مقدم الخدمة
              </div>
              <h1 className="text-3xl font-black">مرحباً، صاحب العربات</h1>
              <p className="text-gray-400 mt-1">إدارة عرباتك واستفساراتك وعقودك من مكان واحد</p>
            </div>
            <Link href="/list-truck">
              <Button className="gap-2 h-12 px-6 font-bold">
                <PlusCircle className="w-5 h-5" />
                أضف عربة جديدة
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 space-y-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "إجمالي العربات", value: trucks?.length ?? 0, icon: Truck, color: "text-primary" },
            { label: "عربات متاحة", value: activeTrucks, icon: CheckCircle2, color: "text-green-500" },
            { label: "استفسارات جديدة", value: pending, icon: MessageSquare, color: "text-blue-500" },
            { label: "العقود المنجزة", value: contracts?.filter(c => c.status === "completed").length ?? 0, icon: FileText, color: "text-purple-500" },
          ].map((stat, i) => (
            <Card key={i} className="border shadow-sm">
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

        {/* Revenue Card */}
        <Card className="bg-primary text-primary-foreground border-none">
          <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-primary-foreground/80 text-sm mb-1">إجمالي الإيرادات</div>
              <div className="text-4xl font-black">{totalRevenue.toLocaleString("ar-SA")} <span className="text-xl font-bold">ريال</span></div>
            </div>
            <TrendingUp className="w-16 h-16 opacity-30" />
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="trucks">
          <TabsList className="mb-6 bg-muted rounded-xl p-1 gap-1">
            <TabsTrigger value="trucks" className="rounded-lg font-bold">عرباتي</TabsTrigger>
            <TabsTrigger value="inquiries" className="rounded-lg font-bold">الاستفسارات</TabsTrigger>
            <TabsTrigger value="contracts" className="rounded-lg font-bold">العقود</TabsTrigger>
          </TabsList>

          {/* My Trucks */}
          <TabsContent value="trucks">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trucksLoading
                ? [1,2,3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)
                : trucks?.map(truck => (
                  <Card key={truck.id} className="group border hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg mb-1">{truck.name}</h3>
                          <div className="flex items-center gap-1 text-muted-foreground text-sm">
                            <MapPin className="w-3.5 h-3.5" />
                            {truck.location}
                          </div>
                        </div>
                        <Badge variant={truck.available ? "default" : "secondary"} className="text-xs">
                          {truck.available ? "متاحة" : "غير متاحة"}
                        </Badge>
                      </div>
                      <div className="text-2xl font-black text-primary mb-4">
                        {truck.price.toLocaleString("ar-SA")} <span className="text-sm text-muted-foreground font-normal">ريال</span>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/trucks/${truck.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full gap-1.5">
                            <Eye className="w-3.5 h-3.5" />
                            عرض
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="gap-1.5">
                          <Settings className="w-3.5 h-3.5" />
                          تعديل
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          {/* Inquiries */}
          <TabsContent value="inquiries">
            <div className="space-y-4">
              {inqLoading
                ? [1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)
                : inquiries?.length === 0
                  ? <div className="text-center py-20 text-muted-foreground">لا توجد استفسارات</div>
                  : inquiries?.map(inq => (
                    <Card key={inq.id} className="border hover:shadow-sm transition-shadow">
                      <CardContent className="p-6 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-bold">{inq.customerName}</div>
                            <div className="text-sm text-muted-foreground">{inq.truckName ?? "عربة"} — {inq.type === "rent" ? "استئجار" : "شراء"}</div>
                            <div className="text-xs text-muted-foreground">{new Date(inq.createdAt).toLocaleDateString("ar-SA")}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={
                            inq.status === "confirmed" ? "default" :
                            inq.status === "pending" ? "secondary" : "destructive"
                          }>
                            {inq.status === "pending" ? "قيد الانتظار" : inq.status === "confirmed" ? "مقبول" : "مرفوض"}
                          </Badge>
                          {inq.status === "pending" && (
                            <div className="flex gap-2">
                              <Button size="sm" className="gap-1 h-8">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                قبول
                              </Button>
                              <Button size="sm" variant="outline" className="gap-1 h-8">
                                <XCircle className="w-3.5 h-3.5" />
                                رفض
                              </Button>
                            </div>
                          )}
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
                  ? <div className="text-center py-20 text-muted-foreground">لا توجد عقود</div>
                  : contracts?.map(con => (
                    <Card key={con.id} className="border hover:shadow-sm transition-shadow">
                      <CardContent className="p-6 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-bold">{con.truckName ?? "عربة"}</div>
                            <div className="text-sm text-muted-foreground">عقد {con.type === "sale" ? "بيع" : "إيجار"} — {con.buyerName}</div>
                            <div className="text-xs text-muted-foreground">{new Date(con.createdAt).toLocaleDateString("ar-SA")}</div>
                          </div>
                        </div>
                        <div className="text-left flex flex-col items-end gap-2">
                          <div className="font-black text-lg">{con.price.toLocaleString("ar-SA")} ريال</div>
                          <Badge variant={con.status === "active" ? "default" : "secondary"} className="text-xs">
                            {con.status === "active" ? "نشط" : con.status === "completed" ? "منجز" : "ملغي"}
                          </Badge>
                          <Link href={`/contracts/${con.id}`}>
                            <Button variant="ghost" size="sm" className="text-xs h-7">عرض العقد</Button>
                          </Link>
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
