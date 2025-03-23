
import { useQuery } from "@tanstack/react-query";

export interface Neighborhood {
  id: string;
  name: string;
  averageRent: {
    oneRoom: number;
    twoRoom: number;
    threeRoom: number;
    fourPlusRoom: number;
  };
  averageUtilitiesPerSqm: number;
  transportZone: 'A' | 'B' | 'C';
  groceryCostFactor: number;
  description: string;
  lastUpdated?: string;
  lat: number;
  lng: number;
}

// Initialize with empty array
let neighborhoodsData: Neighborhood[] = [];

// Add coordinates to Berlin neighborhoods
export const neighborhoodCoordinates: Record<string, [number, number]> = {
  "mitte": [52.520, 13.405],
  "friedrichshain": [52.515, 13.454],
  "kreuzberg": [52.498, 13.422],
  "neukoelln": [52.481, 13.449],
  "charlottenburg": [52.505, 13.304],
  "prenzlauer-berg": [52.542, 13.414],
  "schoeneberg": [52.484, 13.350],
  "wedding": [52.549, 13.366],
  "lichtenberg": [52.516, 13.489],
  "steglitz": [52.456, 13.326],
  "spandau": [52.535, 13.201],
  "reinickendorf": [52.585, 13.356]
};

export const fetchNeighborhoods = async (): Promise<Neighborhood[]> => {
  if (neighborhoodsData.length > 0) {
    return neighborhoodsData;
  }
  
  try {
    const response = await fetch('/data/neighborhoods.json');
    if (!response.ok) {
      throw new Error('Failed to fetch neighborhood data');
    }
    
    const data = await response.json();
    
    // Add coordinates to each neighborhood
    neighborhoodsData = data.map((neighborhood: Omit<Neighborhood, 'lat' | 'lng'>) => {
      const coords = neighborhoodCoordinates[neighborhood.id] || [52.520, 13.405]; // Default to Mitte if not found
      return {
        ...neighborhood,
        lat: coords[0],
        lng: coords[1]
      };
    });
    
    return neighborhoodsData;
  } catch (error) {
    console.error('Error loading neighborhood data:', error);
    return [];
  }
};

// Export the neighborhoods array for direct access
export const neighborhoods = neighborhoodsData;

export const getNeighborhoods = (): Neighborhood[] => {
  return neighborhoodsData;
};

export const getAffordableNeighborhoods = (budget: number, roomsNeeded: keyof Neighborhood['averageRent']) => {
  return neighborhoodsData
    .filter(neighborhood => {
      const rentAmount = neighborhood.averageRent[roomsNeeded];
      return rentAmount <= budget;
    })
    .sort((a, b) => a.averageRent[roomsNeeded] - b.averageRent[roomsNeeded]);
};

export const useNeighborhoods = () => {
  return useQuery({
    queryKey: ['neighborhoods'],
    queryFn: fetchNeighborhoods,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useAffordableNeighborhoods = (budget: number, roomsNeeded: keyof Neighborhood['averageRent']) => {
  const { data: allNeighborhoods = [], ...rest } = useNeighborhoods();
  
  const affordableNeighborhoods = allNeighborhoods
    .filter(neighborhood => {
      const rentAmount = neighborhood.averageRent[roomsNeeded];
      return rentAmount <= budget;
    })
    .sort((a, b) => a.averageRent[roomsNeeded] - b.averageRent[roomsNeeded]);
  
  return {
    data: affordableNeighborhoods,
    ...rest
  };
};
