import proj4 from 'proj4'

const lambertMA = '+proj=lcc +lat_1=33.3 +lat_2=35.1 +lat_0=33 +lon_0=-5 +x_0=500000 +y_0=300000 +ellps=clrk80 +units=m +no_defs'

export function lambertToWGS84(x: number, y: number): [number, number] {
  const [lon, lat] = proj4(lambertMA, proj4.WGS84, [x, y])
  return [lat, lon]
}

export function polygonCentroid(vertices: { lambertX: number, lambertY: number }[]): [number, number] | null {
  if (!vertices.length) return null
  const pts = vertices.map(v => [v.lambertX, v.lambertY])
  if (pts.length < 3) {
    const sum = pts.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1]], [0,0])
    return [sum[0] / pts.length, sum[1] / pts.length]
  }
  let area = 0
  let cx = 0
  let cy = 0
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i]
    const [x2, y2] = pts[(i + 1) % pts.length]
    const f = x1 * y2 - x2 * y1
    area += f
    cx += (x1 + x2) * f
    cy += (y1 + y2) * f
  }
  area *= 0.5
  if (area === 0) {
    const sum = pts.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1]], [0,0])
    return [sum[0] / pts.length, sum[1] / pts.length]
  }
  cx /= (6 * area)
  cy /= (6 * area)
  return [cx, cy]
}

