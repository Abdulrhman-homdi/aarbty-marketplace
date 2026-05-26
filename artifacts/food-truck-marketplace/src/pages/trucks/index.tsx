import { useState } from "react";
import { useListFoodTrucks, getListFoodTrucksQueryKey } from "@workspace/api-client-react";
import { TruckCard } from "@/components/truck-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Search, SlidersHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TrucksList() {
  const [search, setSearch] = useState("");
  const [activityType, setActivityType] = useState<string>("");
  const [listingType, setListingType] = useState<string>("");
  const [location, setLocation] = useState<string>("");

  const { data: trucks, isLoading } = useListFoodTrucks({
    activityType: activityType as any,
    listingType: listingType as any,
    location: location,
  }, { query: { queryKey: getListFoodTrucksQueryKey({
    activityType: activityType as any,
    listingType: listingType as any,
    location: location,
  }) } });

  const filteredTrucks = trucks?.filter(t => t.name.includes(search) || t.description?.includes(search));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-72 space-y-8 flex-shrink-0">
          <div className="sticky top-24 space-y-6 bg-card p-6 rounded-2xl border shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b">
              <SlidersHorizontal className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">تصفية النتائج</h2>
            </div>

            <div className="space-y-3">
              <Label className="font-bold">نوع العربة</Label>
              <Select value={listingType} onValueChange={(v) => setListingType(v === "all" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="sale">للبيع</SelectItem>
                  <SelectItem value="rent">للإيجار</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="font-bold">النشاط</Label>
              <Select value={activityType} onValueChange={(v) => setActivityType(v === "all" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="food">أطعمة</SelectItem>
                  <SelectItem value="beverages">مشروبات</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="font-bold">المدينة</Label>
              <Select value={location} onValueChange={(v) => setLocation(v === "all" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="الرياض">الرياض</SelectItem>
                  <SelectItem value="جدة">جدة</SelectItem>
                  <SelectItem value="الدمام">الدمام</SelectItem>
                  <SelectItem value="مكة المكرمة">مكة المكرمة</SelectItem>
                  <SelectItem value="المدينة المنورة">المدينة المنورة</SelectItem>
                  <SelectItem value="أبها">أبها</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox id="licensed" />
                <Label htmlFor="licensed">مرخصة فقط</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox id="equipment" />
                <Label htmlFor="equipment">مع المعدات</Label>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-black mb-4">العربات المتاحة</h1>
            <div className="relative max-w-md">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="ابحث بالاسم..." 
                className="pl-4 pr-10 h-12 bg-background border-border shadow-sm rounded-xl"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-[200px] w-full rounded-xl" />
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredTrucks?.length === 0 ? (
            <div className="text-center py-24 bg-card rounded-2xl border border-dashed">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">لا توجد نتائج</h3>
              <p className="text-muted-foreground">حاول تغيير خيارات البحث أو التصفية</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTrucks?.map((truck, i) => (
                <TruckCard key={truck.id} truck={truck} delay={i * 50} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}