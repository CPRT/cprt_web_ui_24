'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { useWaypoints } from '@/contexts/WaypointContext';
import BreadcrumbTrail from '../BreadCrumbTrail';
import WaypointCreatorWindow from '../WaypointCreatorWindow';
import MapInteractionHandler from '../MapInteractionHandler';
import MapCompass from '../MapCompass';

const getCustomIcon = (color: string) =>
  L.divIcon({
    html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid #fff;"></div>`,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

type MapViewProps = {
  offline: boolean;
};

const MapView: React.FC<MapViewProps> = ({offline}) => {
  const { waypoints } = useWaypoints();

  return (
    <MapContainer
      center={[45.387295, -75.700974]} 
      zoom={15}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url={offline? "http://localhost:80/{z}/{x}/{y}.png" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
        attribution="&copy; Maptiler server"
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
      <div
        style={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            zIndex: 1000,
            borderRadius: '8px',
            color: '#fff',
            fontSize: '0.9rem',
            maxWidth: '300px',
          }}>
        <MapCompass/>
      </div>
    </MapContainer>
  );
};

export default MapView;

