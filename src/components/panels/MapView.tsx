'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { useWaypoints } from '@/contexts/WaypointContext';
import BreadcrumbTrail from '../BreadCrumbTrail';
import WaypointCreatorWindow from '../WaypointCreatorWindow';
import MapInteractionHandler from '../MapInteractionHandler';

const getCustomIcon = (color: string) =>
  L.divIcon({
    html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid #fff;"></div>`,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

const MapView: React.FC = () => {
  const { waypoints } = useWaypoints();

  return (
    <MapContainer
      center={[45.258668232508136, -93.39358681856504]} // check this out on google maps, you wont be displeased
      zoom={13}
      style={{ height: '100%', width: '100%' }}
    >
      {/* TODO: need to make this run offline*/}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <MapInteractionHandler />
      {waypoints.map((wp, index) => (
        <Marker key={index} position={wp.coordinate} icon={getCustomIcon(wp.color)}>
          <Popup>
            <div
              style={{
                backgroundColor: '#333',
                color: '#f1f1f1',
                padding: '0.5rem',
              }}
            >
              <strong>{wp.name}</strong>
              <br />
              {`Waypoint ${wp.order}`}
              <br />
              {`[${wp.coordinate[0].toFixed(6)}, ${wp.coordinate[1].toFixed(6)}]`}
            </div>
          </Popup>
        </Marker>
      ))}
      {waypoints.length > 1 && (
        <Polyline positions={waypoints.map((wp) => wp.coordinate)} color="#4a90e2" />
      )}
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 1000,
          borderRadius: '8px',
          color: '#fff',
          fontSize: '0.9rem',
          maxWidth: '300px',
        }}>
        <BreadcrumbTrail />
        <WaypointCreatorWindow />
      </div>
    </MapContainer>
  );
};

export default MapView;

