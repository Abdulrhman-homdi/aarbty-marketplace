import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Store, Tag } from "lucide-react";
import type { FoodTruck } from "@workspace/api-client-react";

export function TruckCard({ truck, delay = 0 }: { truck: FoodTruck; delay?: number }) {
  return (
    <Card 
      className="overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-border bg-card animate-in fade-in slide-in-from-bottom-4"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img 
          src={truck.images?.[0] || "/images/truck-burger.png"} 
          alt={truck.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 right-3 flex gap-2">
          <Badge className="bg-primary text-primary-foreground font-bold px-3 py-1">
            {truck.listingType === "sale" ? "للبيع" : "للإيجار"}
          </Badge>
          {truck.licensed && (
            <Badge variant="secondary" className="bg-white/90 text-black backdrop-blur-sm shadow-sm">
              مرخصة
            </Badge>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
          <h3 className="text-xl font-bold text-white mb-1">{truck.name}</h3>
          <div className="flex items-center text-white/80 text-sm">
            <MapPin className="w-4 h-4 ml-1" />
            {truck.location}
          </div>
        </div>
      </div>
      <CardContent className="p-4 grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center text-muted-foreground gap-2">
          <Store className="w-4 h-4 text-primary" />
          <span>{truck.activityType === "food" ? "أطعمة" : "مشروبات"}</span>
        </div>
        <div className="flex items-center text-muted-foreground gap-2">
          <Users className="w-4 h-4 text-primary" />
          <span>سعة {truck.capacity === "one" ? "١" : truck.capacity === "two" ? "٢" : "+٣"}</span>
        </div>
        <div className="flex items-center text-muted-foreground gap-2">
          <Tag className="w-4 h-4 text-primary" />
          <span>{truck.price.toLocaleString("ar-SA")} ريال</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 border-t border-border mt-2">
        <Link href={`/trucks/${truck.id}`} className="w-full mt-4">
          <Button className="w-full font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            عرض التفاصيل
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}