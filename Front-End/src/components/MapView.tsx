'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Layers, Plus, Minus, RotateCcw, Factory, Warehouse, Truck } from 'lucide-react';

interface Zone {
  id: string;
  name: string;
  type: 'industrial' | 'logistics' | 'freeZone';
  status: 'available' | 'reserved' | 'occupied';
  x: number;
  y: number;
  count?: number;
}

interface Feature {
  geometry: { type: string; coordinates: [number, number] };
  properties: { id: string; name: string; status: string };
}

export default function MapView() {
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [showLegend, setShowLegend] = useState(true);
  const [zoom, setZoom] = useState(1);

const [zones, setZones] = useState<Zone[]>([]);

  const mapStatus = (status: string): Zone['status'] => {
    switch (status) {
      case 'RESERVED':
        return 'reserved';
      case 'FULLY_OCCUPIED':
        return 'occupied';
      default:
        return 'available';
    }
  };

  useEffect(() => {
    async function loadZones() {
      const base = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${base}/api/map/zones`);
      if (!res.ok) return;
      const data: { features: Feature[] } = await res.json();
      const loaded: Zone[] = data.features.map((f) => {
        const [lon, lat] = f.geometry.coordinates;
        // Simple transformation to map percentage positions
        const x = ((lon + 9) / 18) * 100; // longitude range approx -9 to 9
        const y = ((35 - lat) / 20) * 100; // latitude approx 25-35
        return {
          id: f.properties.id,
          name: f.properties.name,
          type: 'industrial',
          status: mapStatus(f.properties.status),
          x,
          y,
          count: undefined,
        };
      });
      setZones(loaded);
    }
    loadZones();
  }, []);

  const getZoneIcon = (type: Zone['type']) => {
    switch (type) {
      case 'industrial':
        return Factory;
      case 'logistics':
        return Truck;
      case 'freeZone':
        return Warehouse;
      default:
        return Factory;
    }
  };

  const getZoneColor = (status: Zone['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-500 hover:bg-green-600';
      case 'reserved':
        return 'bg-orange-500 hover:bg-orange-600';
      case 'occupied':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getStatusText = (status: Zone['status']) => {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'reserved':
        return 'Réservé';
      case 'occupied':
        return 'Occupé';
      default:
        return 'Inconnu';
    }
  };

  const getTypeText = (type: Zone['type']) => {
    switch (type) {
      case 'industrial':
        return 'Zone Industrielle';
      case 'logistics':
        return 'Parc Logistique';
      case 'freeZone':
        return 'Zone Franche';
      default:
        return 'Zone';
    }
  };

  return (
    <div className="w-full h-[600px] relative bg-blue-50 rounded-lg overflow-hidden border">
      {/* Map Background */}
      <div
        className="w-full h-full relative bg-gradient-to-br from-blue-100 to-blue-200"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(29, 173, 250, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(29, 173, 250, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(29, 173, 250, 0.1) 0%, transparent 50%)
          `,
          transform: `scale(${zoom})`
        }}
      >
        {/* Morocco outline simulation */}
        <div className="absolute inset-0 opacity-20">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path
              d="M15 20 L25 15 L40 12 L60 18 L75 25 L85 35 L80 50 L75 65 L70 75 L60 85 L45 80 L30 75 L20 65 L15 50 Z"
              fill="none"
              stroke="#1dadfa"
              strokeWidth="0.5"
              className="drop-shadow-sm"
            />
          </svg>
        </div>

        {/* Zone markers */}
        {zones.map((zone) => {
          const Icon = getZoneIcon(zone.type);
          return (
            <div
              key={zone.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${
                selectedZone?.id === zone.id ? 'scale-125 z-20' : 'z-10'
              }`}
              style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
              onClick={() => setSelectedZone(selectedZone?.id === zone.id ? null : zone)}
            >
              <div className={`w-10 h-10 rounded-full ${getZoneColor(zone.status)} flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all`}>
                <Icon className="w-5 h-5" />
              </div>
              {zone.count && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {zone.count}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 left-4 space-y-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setZoom(Math.min(zoom + 0.2, 2))}
        >
          <Plus className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}
        >
          <Minus className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setZoom(1)}
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Legend Toggle */}
      <div className="absolute top-4 right-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowLegend(!showLegend)}
        >
          <Layers className="w-4 h-4 mr-2" />
          Légende
        </Button>
      </div>

      {/* Legend */}
      {showLegend && (
        <Card className="absolute top-16 right-4 w-64">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-600" />
              Légende des Zones
            </h3>

            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium mb-2">Types de Zones</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Factory className="w-4 h-4 text-gray-600" />
                    <span>Zones Industrielles</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="w-4 h-4 text-gray-600" />
                    <span>Parcs Logistiques</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Warehouse className="w-4 h-4 text-gray-600" />
                    <span>Zones Franches</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">États des Parcelles</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Disponible</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span>Réservé</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Occupé</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Zone Details Popup */}
      {selectedZone && (
        <Card className="absolute bottom-4 left-4 w-80">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-lg">{selectedZone.name}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedZone(null)}
              >
                ×
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{getTypeText(selectedZone.type)}</Badge>
                <Badge className={getZoneColor(selectedZone.status).replace('bg-', 'bg-').replace('hover:bg-', '')}>
                  {getStatusText(selectedZone.status)}
                </Badge>
              </div>

              {selectedZone.count && (
                <p className="text-sm text-gray-600">
                  {selectedZone.count} parcelles disponibles
                </p>
              )}

              <div className="flex gap-2 mt-3">
                <Button size="sm" className="header-red text-white">
                  Voir Détails
                </Button>
                <Button variant="outline" size="sm">
                  Réserver
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Zone count display */}
      <div className="absolute bottom-4 right-4">
        <Badge variant="secondary" className="text-sm">
          {zones.reduce((acc, zone) => acc + (zone.count || 0), 0)} zones disponibles
        </Badge>
      </div>
    </div>
  );
}
