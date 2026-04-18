import { useParams, Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Pencil } from "lucide-react";
import {
  useGetFoodTruck,
  useUpdateFoodTruck,
  getGetFoodTruckQueryKey,
  getListFoodTrucksQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { TruckForm, type TruckFormValues } from "@/components/truck-form";

export default function EditTruck() {
  const { id } = useParams<{ id: string }>();
  const truckId = parseInt(id, 10);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: truck, isLoading } = useGetFoodTruck(truckId, {
    query: { queryKey: getGetFoodTruckQueryKey(truckId), enabled: !!truckId },
  });

  const updateMutation = useUpdateFoodTruck();

  function handleSubmit(data: TruckFormValues, images: string[]) {
    updateMutation.mutate(
      {
        id: truckId,
        data: { ...data, images },
      },
      {
        onSuccess: () => {
          toast({ title: "تم التحديث بنجاح", description: "تم حفظ التغييرات على عربتك" });
          qc.invalidateQueries({ queryKey: getGetFoodTruckQueryKey(truckId) });
          qc.invalidateQueries({ queryKey: getListFoodTrucksQueryKey() });
          navigate(`/trucks/${truckId}`);
        },
        onError: () => {
          toast({ title: "خطأ", description: "حدث خطأ أثناء الحفظ", variant: "destructive" });
        },
      }
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Skeleton className="h-10 w-48 mb-8" />
        <Skeleton className="h-[600px] w-full rounded-3xl" />
      </div>
    );
  }

  if (!truck) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-xl font-bold text-muted-foreground mb-4">العربة غير موجودة</p>
          <Link href="/provider">
            <Button>العودة لبوابتي</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl" dir="rtl">
      <div className="mb-8">
        <Link href="/provider">
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowRight className="w-4 h-4" />
            العودة لبوابتي
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Pencil className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black">تعديل العربة</h1>
            <p className="text-muted-foreground">{truck.name}</p>
          </div>
        </div>
      </div>

      <TruckForm
        defaultValues={{
          name: truck.name,
          activityType: truck.activityType as "food" | "beverages",
          capacity: truck.capacity as "one" | "two" | "more",
          dimensions: truck.dimensions ?? undefined,
          withEquipment: truck.withEquipment,
          licensed: truck.licensed,
          location: truck.location,
          price: truck.price,
          listingType: truck.listingType as "sale" | "rent",
          ownerName: truck.ownerName,
          description: truck.description ?? undefined,
        }}
        initialImages={truck.images ?? []}
        onSubmit={handleSubmit}
        isPending={updateMutation.isPending}
        submitLabel="حفظ التغييرات"
      />
    </div>
  );
}
