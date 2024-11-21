import React, { useEffect, useRef, useState } from 'react';
import { MapPinIcon } from '@heroicons/react/24/outline';
import { Input } from '../common/Input';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface LocationSearchProps {
  onLocationSelect: (location: Location | null) => void;
  initialLocation?: Location | null;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  onLocationSelect,
  initialLocation
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const dummyMapDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.google && !autocompleteService.current) {
      autocompleteService.current = new google.maps.places.AutocompleteService();
      if (dummyMapDiv.current) {
        placesService.current = new google.maps.places.PlacesService(dummyMapDiv.current);
      }
    }
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query || !autocompleteService.current) return;

    setLoading(true);
    try {
      const response = await autocompleteService.current.getPlacePredictions({
        input: query,
        componentRestrictions: { country: 'ke' }, // Restrict to Kenya
        types: ['geocode']
      });
      setPredictions(response.predictions);
    } catch (error) {
      console.error('Error fetching predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlace = (prediction: google.maps.places.AutocompletePrediction) => {
    if (!placesService.current) return;

    placesService.current.getDetails(
      {
        placeId: prediction.place_id,
        fields: ['geometry', 'formatted_address']
      },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          const location = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            address: place.formatted_address || prediction.description
          };
          onLocationSelect(location);
          setSearchQuery('');
          setPredictions([]);
        }
      }
    );
  };

  const handleClear = () => {
    setSearchQuery('');
    setPredictions([]);
    onLocationSelect(null);
  };

  return (
    <div className="relative">
      {/* Hidden div for Places Service */}
      <div ref={dummyMapDiv} style={{ display: 'none' }} />

      <div className="relative">
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search for a location..."
          className="pr-10"
        />
        {(searchQuery || initialLocation) && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500"
          >
            ×
          </button>
        )}
      </div>

      {initialLocation && !searchQuery && (
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <MapPinIcon className="h-4 w-4 mr-1" />
          {initialLocation.address}
        </div>
      )}

      {predictions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200">
          <ul className="py-1">
            {predictions.map((prediction) => (
              <li
                key={prediction.place_id}
                onClick={() => handleSelectPlace(prediction)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              >
                <div className="flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{prediction.description}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {loading && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 p-4 text-center text-sm text-gray-500">
          Loading...
        </div>
      )}
    </div>
  );
};
