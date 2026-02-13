'use client';

import { useState, useEffect } from 'react';
import { X, MapPin } from 'lucide-react';

interface LocationMapProps {
  isOpen: boolean;
  onClose: () => void;
  location: {
    lat?: number;
    lng?: number;
    address?: string;
    area?: string;
    town?: string;
    district?: string;
    zipcode?: string;
  };
  name?: string;
}

export default function LocationMap({ isOpen, onClose, location, name }: LocationMapProps) {
  const [mapLoaded, setMapLoaded] = useState(false);

  if (!isOpen) return null;

  // Convert to numbers and handle string values
  const lat = parseFloat(location?.lat) || 0;
  const lng = parseFloat(location?.lng) || 0;
  const hasValidCoordinates = lat !== 0 && lng !== 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 overflow-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden relative z-[10000]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4 flex-1">
            <MapPin className="text-accent flex-shrink-0" size={24} />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{name || 'Location'}</h2>
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                {location?.address && (
                  <p className="font-medium text-gray-700">{location.address}</p>
                )}
                <div className="flex flex-wrap gap-3 mt-2">
                  {location?.area && (
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
                      {location.area}
                    </span>
                  )}
                  {location?.town && (
                    <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-semibold">
                      {location.town}
                    </span>
                  )}
                  {location?.district && (
                    <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-semibold">
                      {location.district}
                    </span>
                  )}
                  {location?.zipcode && (
                    <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded text-xs font-semibold">
                      {location.zipcode}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative bg-gray-50 flex items-center justify-center overflow-hidden">
          {hasValidCoordinates ? (
            <div className="w-full h-full">
              {/* Embed Google Maps */}
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                src={`https://www.google.com/maps?q=${lat},${lng}&hl=en&z=15&output=embed`}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                style={{ border: 0 }}
              />
            </div>
          ) : (
            <div className="text-center p-8">
              <MapPin size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-semibold mb-4">Map coordinates not available</p>
              {location?.address && (
                <div className="bg-white p-4 rounded-lg border border-gray-200 max-w-sm mx-auto text-left">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Address Details:</p>
                  <div className="space-y-2 text-sm text-gray-600">
                    {location.address && <p><strong>Address:</strong> {location.address}</p>}
                    {location.area && <p><strong>Area:</strong> {location.area}</p>}
                    {location.town && <p><strong>Town:</strong> {location.town}</p>}
                    {location.district && <p><strong>District:</strong> {location.district}</p>}
                    {location.zipcode && <p><strong>Zipcode:</strong> {location.zipcode}</p>}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-2">
          {hasValidCoordinates && (
            <a
              href={`https://www.google.com/maps/search/${lat},${lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-accent text-white rounded-lg font-semibold hover:bg-opacity-90 transition"
            >
              Open in Google Maps
            </a>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
