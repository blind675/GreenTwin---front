interface Coordinates {
  latitude: number;
  longitude: number;
}

interface LocationOptions {
  samples?: number;
  timeout?: number;
  maxDistance?: number; // Maximum distance in meters to consider a reading valid
}

/**
 * Calculate distance between two coordinates in meters using the Haversine formula
 */
export const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (coord1.latitude * Math.PI) / 180;
  const φ2 = (coord2.latitude * Math.PI) / 180;
  const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

/**
 * Calculate the median value of an array of numbers
 */
const calculateMedian = (values: number[]): number => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
};

/**
 * Get precise location by taking multiple samples, filtering outliers, and averaging
 */
export const getPreciseLocation = (
  options: LocationOptions = {}
): Promise<Coordinates> => {
  const {
    samples = 5,
    timeout = 10000,
    maxDistance = 10 // 10 meters max distance for valid readings
  } = options;

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    const readings: Coordinates[] = [];
    let completedReadings = 0;
    let timeoutId: number | null = null;

    // Set a global timeout
    const globalTimeoutId = setTimeout(() => {
      if (timeoutId) clearTimeout(timeoutId);

      if (readings.length > 0) {
        // Process whatever readings we have
        processReadings();
      } else {
        reject(new Error('Location detection timed out'));
      }
    }, timeout);

    const processReadings = () => {
      clearTimeout(globalTimeoutId);

      if (readings.length === 0) {
        reject(new Error('No valid location readings obtained'));
        return;
      }

      if (readings.length === 1) {
        // If we only have one reading, just use it
        resolve(readings[0]);
        return;
      }

      // Calculate the median location as a reference point
      const latitudes = readings.map(r => r.latitude);
      const longitudes = readings.map(r => r.longitude);

      const medianLocation: Coordinates = {
        latitude: calculateMedian(latitudes),
        longitude: calculateMedian(longitudes)
      };

      // Filter out outliers based on distance from median
      const validReadings = readings.filter(reading =>
        calculateDistance(reading, medianLocation) <= maxDistance
      );

      if (validReadings.length === 0) {
        // If all readings were filtered out as outliers, use the median
        resolve(medianLocation);
        return;
      }

      // Calculate the average of valid readings
      const avgLatitude = validReadings.reduce((sum, r) => sum + r.latitude, 0) / validReadings.length;
      const avgLongitude = validReadings.reduce((sum, r) => sum + r.longitude, 0) / validReadings.length;

      resolve({
        latitude: avgLatitude,
        longitude: avgLongitude
      });
    };

    const getNextReading = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          readings.push({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });

          completedReadings++;

          if (completedReadings < samples) {
            // Wait a short time before getting the next reading
            timeoutId = setTimeout(getNextReading, 500) as unknown as number;
          } else {
            processReadings();
          }
        },
        (error) => {
          console.warn('Error getting location:', error);
          completedReadings++;

          if (completedReadings < samples) {
            // Try again even if this reading failed
            timeoutId = setTimeout(getNextReading, 500) as unknown as number;
          } else if (readings.length > 0) {
            // Process whatever readings we have
            processReadings();
          } else {
            clearTimeout(globalTimeoutId);
            reject(new Error('Failed to get location: ' + error.message));
          }
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    };

    // Start getting readings
    getNextReading();
  });
};
