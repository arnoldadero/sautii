import React, { useEffect, useRef, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { MapPinIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

interface Location {
  latitude: number;
  longitude: number;
  address: string;
  county: string;
  constituency?: string;
  ward?: string;
}

interface LocationSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (location: Location) => void;
  initialLocation?: Location;
}

declare global {
  interface Window {
    google: any;
  }
}

const LocationSearch: React.FC<LocationSearchProps> = ({
  isOpen,
  onClose,
  onSelect,
  initialLocation,
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadGoogleMaps = async () => {
      if (!window.google) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        script.onload = initializeMap;
      } else {
        initializeMap();
      }
    };

    if (isOpen) {
      loadGoogleMaps();
    }
  }, [isOpen]);

  const initializeMap = () => {
    if (!mapRef.current) return;

    const defaultLocation = { lat: -1.2921, lng: 36.8219 }; // Nairobi
    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: initialLocation
        ? { lat: initialLocation.latitude, lng: initialLocation.longitude }
        : defaultLocation,
      zoom: 12,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
    });

    const markerInstance = new window.google.maps.Marker({
      map: mapInstance,
      position: initialLocation
        ? { lat: initialLocation.latitude, lng: initialLocation.longitude }
        : defaultLocation,
      draggable: true,
    });

    mapInstance.addListener('click', (e: google.maps.MouseEvent) => {
      markerInstance.setPosition(e.latLng);
      updateLocationDetails(e.latLng);
    });

    markerInstance.addListener('dragend', () => {
      updateLocationDetails(markerInstance.getPosition());
    });

    setMap(mapInstance);
    setMarker(markerInstance);

    // Initialize the search box
    const searchBox = new window.google.maps.places.SearchBox(
      document.getElementById('location-search-input')
    );

    mapInstance.addListener('bounds_changed', () => {
      searchBox.setBounds(mapInstance.getBounds() as google.maps.LatLngBounds);
    });

    searchBox.addListener('places_changed', () => {
      const places = searchBox.getPlaces();
      if (places.length === 0) return;

      const place = places[0];
      if (!place.geometry || !place.geometry.location) return;

      if (place.geometry.viewport) {
        mapInstance.fitBounds(place.geometry.viewport);
      } else {
        mapInstance.setCenter(place.geometry.location);
        mapInstance.setZoom(17);
      }

      markerInstance.setPosition(place.geometry.location);
      updateLocationDetails(place.geometry.location);
    });
  };

  const updateLocationDetails = async (latLng: google.maps.LatLng) => {
    const geocoder = new window.google.maps.Geocoder();
    
    try {
      const response = await geocoder.geocode({ location: latLng });
      if (response.results[0]) {
        const place = response.results[0];
        let county = '';
        let constituency = '';
        let ward = '';

        // Extract administrative areas from address components
        place.address_components.forEach((component: any) => {
          if (component.types.includes('administrative_area_level_1')) {
            county = component.long_name;
          } else if (component.types.includes('administrative_area_level_2')) {
            constituency = component.long_name;
          } else if (component.types.includes('administrative_area_level_3')) {
            ward = component.long_name;
          }
        });

        setSelectedLocation({
          latitude: latLng.lat(),
          longitude: latLng.lng(),
          address: place.formatted_address,
          county,
          constituency,
          ward,
        });
      }
    } catch (error) {
      console.error('Geocoding failed:', error);
    }
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onSelect(selectedLocation);
      onClose();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-lg max-w-3xl w-full mx-4 shadow-xl">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-lg font-medium">
                Select Location
              </Dialog.Title>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="mt-4">
              <Input
                id="location-search-input"
                type="text"
                placeholder="Search for a location..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                leftIcon={<MapPinIcon className="h-5 w-5 text-gray-400" />}
              />
            </div>
          </div>

          <div className="h-96" ref={mapRef} />

          {selectedLocation && (
            <div className="p-4 border-t">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700">
                  Selected Location
                </h4>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedLocation.address}
                </p>
              </div>

              <div className="flex justify-end gap-4">
                <Button variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleConfirm}>
                  Confirm Location
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default LocationSearch;
