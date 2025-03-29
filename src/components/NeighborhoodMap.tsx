import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { Neighborhood, getNeighborhoods, fetchNeighborhoods } from '@/data/neighborhoods';
import { BerlinMap } from './BerlinMap';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useTranslation } from 'react-i18next';

interface NeighborhoodMapProps {
  affordableRent: number;
  roomType: keyof Neighborhood['averageRent'];
}

export function NeighborhoodMap({ affordableRent, roomType }: NeighborhoodMapProps) {
  const { t } = useTranslation();
  const [affordable, setAffordable] = useState<Neighborhood[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [highlightedIds, setHighlightedIds] = useState<string[]>([]);
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState<string | undefined>(undefined);
  const isMobile = useIsMobile();
  
  // Load neighborhood data
  useEffect(() => {
    const loadData = async () => {
      // First try to get already loaded neighborhoods
      let currentNeighborhoods = getNeighborhoods();
      
      // If empty, fetch them
      if (currentNeighborhoods.length === 0) {
        currentNeighborhoods = await fetchNeighborhoods();
      }
      
      setNeighborhoods(currentNeighborhoods);
      
      // Find the most recent update date
      const mostRecentUpdate = currentNeighborhoods.reduce((latest, neighborhood) => {
        if (!neighborhood.lastUpdated) return latest;
        return !latest || new Date(neighborhood.lastUpdated) > new Date(latest) 
          ? neighborhood.lastUpdated 
          : latest;
      }, '');
      
      setLastUpdated(mostRecentUpdate);
    };
    
    loadData();
  }, []);
  
  // Filter neighborhoods by budget
  useEffect(() => {
    if (neighborhoods.length === 0) return;
    
    const filtered = neighborhoods.filter(n => n.averageRent[roomType] <= affordableRent);
    const sorted = [...filtered].sort((a, b) => a.averageRent[roomType] - b.averageRent[roomType]);
    
    setAffordable(sorted);
    
    // Highlight top 5 affordable neighborhoods
    const topFiveIds = sorted.slice(0, 5).map(n => n.id);
    setHighlightedIds(topFiveIds);
    
    // Set the first neighborhood as selected by default if there are any
    if (topFiveIds.length > 0 && !selectedNeighborhoodId) {
      setSelectedNeighborhoodId(topFiveIds[0]);
    }
  }, [affordableRent, roomType, neighborhoods, selectedNeighborhoodId]);

  const getRoomTypeLabel = () => {
    switch(roomType) {
      case 'oneRoom': return t('calculator.rooms.one');
      case 'twoRoom': return t('calculator.rooms.two');
      case 'threeRoom': return t('calculator.rooms.three');
      case 'fourPlusRoom': return t('calculator.rooms.fourPlus');
      default: return 'Apartment';
    }
  };
  
  const getAffordabilityPercentage = () => {
    return neighborhoods.length > 0 
      ? Math.round((affordable.length / neighborhoods.length) * 100)
      : 0;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (e) {
      return dateString;
    }
  };

  const toggleHighlight = (neighborhoodId: string) => {
    setSelectedNeighborhoodId(neighborhoodId);
    
    // Ensure the clicked neighborhood is highlighted
    if (!highlightedIds.includes(neighborhoodId)) {
      setHighlightedIds([...highlightedIds, neighborhoodId]);
    }
  };

  return (
    <Card className="berlin-card w-full animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>{t('neighborhoods.title')}</CardTitle>
          {lastUpdated && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{t('neighborhoods.updated')}: {formatDate(lastUpdated)}</span>
            </div>
          )}
        </div>
        <CardDescription>
          {affordable.length === 0 
            ? t('neighborhoods.noMatch')
            : t('neighborhoods.affordable', { 
                percentage: getAffordabilityPercentage(), 
                roomType: getRoomTypeLabel() 
              })
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          {/* Table Section */}
          <div>
            {affordable.length > 0 ? (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('neighborhoods.tableHeaders.neighborhood')}</TableHead>
                      <TableHead>{t('neighborhoods.tableHeaders.zone')}</TableHead>
                      <TableHead>{t('neighborhoods.tableHeaders.rent')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {affordable.map((neighborhood) => (
                      <TableRow 
                        key={neighborhood.id}
                        className={`cursor-pointer ${selectedNeighborhoodId === neighborhood.id ? 'bg-berlin-amber/10' : ''}`}
                        onClick={() => toggleHighlight(neighborhood.id)}
                      >
                        <TableCell className="font-medium">{neighborhood.name}</TableCell>
                        <TableCell>{neighborhood.transportZone}</TableCell>
                        <TableCell>€{neighborhood.averageRent[roomType].toFixed(0)}/mo</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[250px] text-center">
                <h3 className="text-lg font-medium mb-1">{t('neighborhoods.noResults.title')}</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  {t('neighborhoods.noResults.description')}
                </p>
              </div>
            )}
          </div>
          
          {/* Map Section - below table on all screen sizes */}
          <div>
            <div className="h-[450px] w-full bg-muted rounded-lg overflow-hidden">
              {neighborhoods.length > 0 ? (
                <div className="h-full w-full">
                  <BerlinMap 
                    neighborhoods={neighborhoods}
                    selectedRoomType={roomType}
                    highlight={highlightedIds}
                    selectedNeighborhood={selectedNeighborhoodId}
                    onNeighborhoodSelect={toggleHighlight}
                  />
                </div>
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    Loading neighborhood data...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
