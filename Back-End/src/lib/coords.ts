import proj4 from 'proj4'

const lambertMA = '+proj=lcc +lat_1=33.3 +lat_2=35.1 +lat_0=33 +lon_0=-5 +x_0=500000 +y_0=300000 +ellps=clrk80 +units=m +no_defs'

export function lambertToWGS84(x: number, y: number): [number, number] {
  const [lon, lat] = proj4(lambertMA, proj4.WGS84, [x, y])
  return [lat, lon]
}
