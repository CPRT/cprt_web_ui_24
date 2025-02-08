'use client';

import React from 'react';
import { useWaypoints } from '@/contexts/WaypointContext';

const WaypointList: React.FC = () => {
  const { waypoints, removeWaypoint } = useWaypoints();

  return (
    <div style={{ padding: '1rem', height: '100%', overflowY: 'auto', backgroundColor: '#1e1e1e', color: '#f1f1f1' }}>
      <h2 style={{ borderBottom: '1px solid #444', paddingBottom: '0.5rem' }}>Waypoint List</h2>
      {waypoints.length === 0 ? (
        <p>No waypoints added. Click on the map to add one.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {waypoints.map((wp, index) => (
            <li key={index} style={{ marginBottom: '0.5rem' }}>
              {`Waypoint ${index + 1}: [${wp[0].toFixed(4)}, ${wp[1].toFixed(4)}] `}
              <button
                onClick={() => removeWaypoint(index)}
                style={{
                  marginLeft: '0.5rem',
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#444',
                  color: '#f1f1f1',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default WaypointList;

