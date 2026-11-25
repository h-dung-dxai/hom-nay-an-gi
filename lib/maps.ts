export const mapsSearchUrl = (keyword: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${keyword} gần đây`)}`;
