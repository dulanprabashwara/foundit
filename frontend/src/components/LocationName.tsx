import React, { useState, useEffect } from 'react';

interface LocationNameProps {
  latitude: number;
  longitude: number;
  fallback?: string;
  className?: string;
}

export default function LocationName({ latitude, longitude, fallback, className }: LocationNameProps) {
  const [name, setName] = useState<string>('Loading...');

  useEffect(() => {
    let mounted = true;
    
    const fetchName = async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        if (!mounted) return;
        
        if (data && data.address) {
          const city = data.address.city || data.address.town || data.address.village || data.address.county || '';
          const state = data.address.state || data.address.country || '';
          const locName = city && state ? `${city}, ${state}` : data.display_name.split(',').slice(0, 2).join(', ');
          setName(locName || fallback || `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
        } else {
          setName(fallback || `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
        }
      } catch (err) {
        if (mounted) {
          setName(fallback || `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
        }
      }
    };
    
    fetchName();
    
    return () => {
      mounted = false;
    };
  }, [latitude, longitude, fallback]);

  return <span className={className}>{name}</span>;
}
