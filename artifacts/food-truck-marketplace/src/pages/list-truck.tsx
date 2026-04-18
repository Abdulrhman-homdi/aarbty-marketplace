import { useLocation } from "wouter";
import { useCreateFoodTruck } from "@workspace/api-client-react";
import { Store } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TruckForm, type TruckFormValues } from "@/components/truck-form";

export default function ListTruck() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createTruck = useCreateFoodTruck();

  function handleSubmit(data: TruckFormValues, images: string[]) {
    createTruck.mutate(
      { data: { ...data, images } },
      {
        onSuccess: (res) => {
          toast({ title: "تمت الإضافة بنجاح", description: "تم عرض عربتك في السوق" });
          setLocation(`/trucks/${res.id}`);
        },
        onError: () => {
          toast({ title: "خطأ", description: "حدث خطأ أثناء الإضافة", variant: "destructive" });
        },
      }
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-10 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl mx-auto flex items-center justify-center mb-6">
          <Store className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-black mb-4">أضف عربتك للسوق</h1>
        <p className="text-muted-foreground text-lg">أدخل بيانات عربتك لعرضها للبيع أو الإيجار</p>
      </div>

      <TruckForm
        onSubmit={handleSubmit}
        isPending={createTruck.isPending}
        submitLabel="نشر العربة"
      />
    </div>
  );
}
