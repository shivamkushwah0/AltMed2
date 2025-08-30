import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import type { MedicationWithDetails } from "@shared/schema";

interface MedicationCardProps {
  medication: MedicationWithDetails;
  onCompare?: () => void;
  onViewDetails: () => void;
  showFavoriteButton?: boolean;
  showCompareButton?: boolean;
}

export default function MedicationCard({ 
  medication, 
  onCompare, 
  onViewDetails,
  showFavoriteButton = true,
  showCompareButton = true
}: MedicationCardProps) {
  return (
    <Card className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-gray-900 text-lg" data-testid={`text-medication-name-${medication.id}`}>
                {medication.brandName}
              </h3>
              <Badge 
                variant={medication.category === 'otc' ? 'secondary' : 'default'}
                className="text-xs"
              >
                {medication.category === 'otc' ? 'OTC' : 'Rx'}
              </Badge>
            </div>
            {medication.genericName && (
              <p className="text-gray-500 text-sm mb-2">{medication.genericName}</p>
            )}
            <p className="text-gray-600 text-sm" data-testid={`text-medication-description-${medication.id}`}>
              {medication.description}
            </p>
            {medication.price && (
              <p className="text-primary font-semibold mt-2">${medication.price}</p>
            )}
          </div>
          
          {/* Medication Image Placeholder */}
          <div className="w-16 h-16 bg-secondary/10 rounded-lg flex items-center justify-center ml-4">
            {medication.imageUrl ? (
              <img 
                src={medication.imageUrl} 
                alt={medication.brandName}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <span className="text-2xl">💊</span>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          {showCompareButton && onCompare && (
            <Button 
              variant="outline"
              className="flex-1 py-2 text-primary font-medium hover:bg-primary/5"
              onClick={onCompare}
              data-testid={`button-compare-${medication.id}`}
            >
              Compare
            </Button>
          )}
          <Button 
            variant="outline"
            className={`${showCompareButton && onCompare ? 'flex-1' : 'w-full'} py-2`}
            onClick={onViewDetails}
            data-testid={`button-view-details-${medication.id}`}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
