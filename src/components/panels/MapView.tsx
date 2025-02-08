'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import { useWaypoints } from '@/contexts/WaypointContext';

const MapView: React.FC = () => {
  const { waypoints, addWaypoint } = useWaypoints();

  // A helper component to capture clicks and add to context
  const MapClickHandler: React.FC = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        addWaypoint([lat, lng]);
      },
    });
    return null;
  };

  return (
    <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <MapClickHandler />
      {waypoints.map((position, index) => (
        <Marker key={index} position={position}>
          <Popup>
            <div style={{ backgroundColor: '#333', color: '#f1f1f1' }}>
              Waypoint {index + 1}
            </div>
          </Popup>
        </Marker>
      ))}
      {waypoints.length > 1 && <Polyline positions={waypoints} color="#4a90e2" />}
    </MapContainer>
  );
};

export default MapView;
