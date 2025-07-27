export type MarkerPoint = {
  name: string
  position: [number, number]
  type: 'port' | 'train' | 'bus'
}

export type Highway = {
  name: string
  path: [number, number][]
}

export const ports: MarkerPoint[] = [
  { name: 'Port de Casablanca', position: [33.609, -7.610], type: 'port' },
  { name: 'Port Tanger Med', position: [35.884, -5.5], type: 'port' }
]

export const trainStations: MarkerPoint[] = [
  { name: 'Gare Casa Voyageurs', position: [33.5899, -7.6021], type: 'train' },
  { name: 'Gare Rabat Agdal', position: [33.9983, -6.8466], type: 'train' },
  { name: 'Gare Marrakech', position: [31.6295, -7.9811], type: 'train' }
]

export const busStations: MarkerPoint[] = [
  { name: 'Gare routière Casablanca', position: [33.5785, -7.6111], type: 'bus' },
  { name: 'Gare routière Rabat', position: [34.012, -6.84], type: 'bus' }
]

export const highways: Highway[] = [
  {
    name: 'A1',
    path: [
      [35.772, -5.8],
      [34.02, -6.83],
      [33.6, -7.6]
    ]
  },
  {
    name: 'A2',
    path: [
      [33.99, -6.85],
      [34.5, -5.5]
    ]
  },
  {
    name: 'A3',
    path: [
      [33.6, -7.6],
      [32.3, -9.2],
      [30.42, -9.6]
    ]
  }
]
