
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';
import { Neighborhood } from '@/data/neighborhoods';

// Fix Leaflet icon issues
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface BerlinMapProps {
  neighborhoods: Neighborhood[];
  selectedRoomType: keyof Neighborhood['averageRent'];
  highlight?: string[];
  selectedNeighborhood?: string;
  onNeighborhoodSelect?: (neighborhood: string) => void;
}

export const BerlinMap = ({ 
  neighborhoods, 
  selectedRoomType, 
  highlight = [], 
  selectedNeighborhood,
  onNeighborhoodSelect 
}: BerlinMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const { t } = useTranslation();
  
  // Initialize map
  useEffect(() => {
    if (mapRef.current && !leafletMap.current) {
      // Initialize map centered on Berlin
      leafletMap.current = L.map(mapRef.current).setView([52.52, 13.405], 11);
      
      // Add OpenStreetMap tiles with attribution
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(leafletMap.current);
    }
    
    // Clean up map on component unmount
    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);
  
  // Add/update markers when neighborhoods change
  useEffect(() => {
    if (!leafletMap.current || neighborhoods.length === 0) return;
    
    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => {
      marker.remove();
    });
    markersRef.current = {};
    
    // Add neighborhood markers to the map
    neighborhoods.forEach((neighborhood) => {
      const isHighlighted = highlight.includes(neighborhood.id);
      
      const markerColor = isHighlighted 
        ? 'text-green-500 bg-white p-2 rounded-full border-2 border-green-500' 
        : 'text-gray-700 bg-white p-2 rounded-full';
      
      const icon = L.divIcon({
        className: 'custom-marker-icon',
        html: `<div class="${markerColor} shadow-md" style="display: flex; justify-content: center; align-items: center;">
                <span style="font-weight: bold;">${neighborhood.transportZone}</span>
              </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      
      const marker = L.marker([neighborhood.lat, neighborhood.lng], { icon })
        .addTo(leafletMap.current!)
        .bindPopup(`
          <div class="neighborhood-popup">
            <h3 class="font-bold text-lg">${neighborhood.name}</h3>
            <p class="text-sm mb-1">${neighborhood.description}</p>
            <div class="text-sm font-semibold mt-2">
              ${t('neighborhoods.tableHeaders.rent')}: €${neighborhood.averageRent[selectedRoomType]}/mo
            </div>
            <div class="text-xs text-gray-600">
              ${t('neighborhoods.tableHeaders.zone')}: ${neighborhood.transportZone}
            </div>
          </div>
        `);
      
      // Add click listener for marker selection
      marker.on('click', () => {
        if (onNeighborhoodSelect) {
          onNeighborhoodSelect(neighborhood.id);
        }
      });
      
      // Store marker reference
      markersRef.current[neighborhood.id] = marker;
    });
  }, [neighborhoods, highlight, selectedRoomType, t, onNeighborhoodSelect]);
  
  // When highlighted neighborhoods change, update the marker styles
  useEffect(() => {
    if (!leafletMap.current || neighborhoods.length === 0) return;
    
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      const isHighlighted = highlight.includes(id);
      
      // Update marker icon to reflect highlight state
      const markerColor = isHighlighted 
        ? 'text-green-500 bg-white p-2 rounded-full border-2 border-green-500' 
        : 'text-gray-700 bg-white p-2 rounded-full';
      
      const icon = L.divIcon({
        className: 'custom-marker-icon',
        html: `<div class="${markerColor} shadow-md" style="display: flex; justify-content: center; align-items: center;">
                <span style="font-weight: bold;">${neighborhoods.find(n => n.id === id)?.transportZone || '?'}</span>
              </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      
      marker.setIcon(icon);
      
      // Open popup for first highlighted neighborhood
      if (isHighlighted && highlight.indexOf(id) === 0) {
        marker.openPopup();
      }
    });
  }, [highlight, neighborhoods]);
  
  // When selected neighborhood changes, update the map
  useEffect(() => {
    if (!leafletMap.current || !selectedNeighborhood) return;
    
    const marker = markersRef.current[selectedNeighborhood];
    
    if (marker) {
      const position = marker.getLatLng();
      
      // Fly to the selected neighborhood
      leafletMap.current.flyTo([position.lat, position.lng], 13, {
        duration: 1.5,
      });
      
      // Open the popup
      marker.openPopup();
    }
  }, [selectedNeighborhood]);
  
  return (
    <div 
      ref={mapRef} 
      className="w-full h-full rounded-xl border border-berlin-amber/20 overflow-hidden shadow-md"
      aria-label={t('map.ariaLabel') || 'Map of Berlin neighborhoods'}
    />
  );
};
