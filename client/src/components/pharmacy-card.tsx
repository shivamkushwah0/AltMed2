import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PharmacyCardProps {
  pharmacy: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    phone?: string;
    stock?: Array<{
      stockLevel: string;
      medication: {
        brandName: string;
      };
    }>;
  };
}

export default function PharmacyCard({ pharmacy }: PharmacyCardProps) {
  // Determine overall stock status
  const getStockStatus = () => {
    if (!pharmacy.stock || pharmacy.stock.length === 0) {
      return { label: "Unknown", variant: "secondary" as const };
    }
    
    const hasInStock = pharmacy.stock.some(item => item.stockLevel === 'in_stock');
    const hasLowStock = pharmacy.stock.some(item => item.stockLevel === 'low_stock');
    const allOutOfStock = pharmacy.stock.every(item => item.stockLevel === 'out_of_stock');
    
    if (allOutOfStock) {
      return { label: "Out of Stock", variant: "destructive" as const };
    } else if (hasInStock) {
      return { label: "In Stock", variant: "default" as const };
    } else if (hasLowStock) {
      return { label: "Low Stock", variant: "secondary" as const };
    }
    
    return { label: "Unknown", variant: "secondary" as const };
  };

  const stockStatus = getStockStatus();

  return (
    <Card className="bg-white border border-gray-200 rounded-xl" data-testid={`card-pharmacy-${pharmacy.id}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900" data-testid={`text-pharmacy-name-${pharmacy.id}`}>
              {pharmacy.name}
            </h3>
            <p className="text-gray-600 text-sm" data-testid={`text-pharmacy-address-${pharmacy.id}`}>
              {pharmacy.address}, {pharmacy.city}, {pharmacy.state}
            </p>
            {pharmacy.phone && (
              <p className="text-gray-500 text-sm mt-1">{pharmacy.phone}</p>
            )}
            <div className="flex items-center mt-2">
              <MapPin className="h-3 w-3 text-gray-400 mr-1" />
              <span className="text-gray-500 text-xs">0.5 miles away</span>
            </div>
          </div>
          <div className="text-right">
            <Badge 
              variant={stockStatus.variant}
              className={`
                ${stockStatus.variant === 'default' ? 'bg-secondary/10 text-secondary hover:bg-secondary/20' : ''}
                ${stockStatus.variant === 'secondary' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : ''}
                ${stockStatus.variant === 'destructive' ? 'bg-red-100 text-red-800 hover:bg-red-200' : ''}
              `}
              data-testid={`badge-stock-status-${pharmacy.id}`}
            >
              {stockStatus.label}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
