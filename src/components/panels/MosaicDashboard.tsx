'use client';

import React, { useState, useCallback, ReactElement } from 'react';
import {
  Mosaic,
  MosaicWindow,
  MosaicNode,
  MosaicPath,
} from 'react-mosaic-component';
import 'react-mosaic-component/react-mosaic-component.css';
import ROSMonitor from '@/components/panels/ROSMonitor'; // Your ROSMonitor component
import NodeManagerPanel from './NodeManagerPanel';
import WebRTCClientPanel from './WebRTCClientPanel';
import MapView from './MapView';
import WaypointList from './WaypointList';

// Define mosaic keys for three panels.
type MosaicKey = 'mapView' | 'rosMonitor' | 'waypointList' | 'nodeManager' | 'webrtcStream';


const MosaicDashboard: React.FC = () => {
  // Initialize the mosaic layout with three panels.
  const [mosaicLayout, setMosaicLayout] = useState<MosaicNode<MosaicKey> | null>({
    direction: 'row',
    first: {
      direction: 'column',
      first: 'mapView',
      second: 'webrtcStream',
      splitPercentage: 50,
    },
    second: {
      direction: 'column',
      first: 'nodeManager',
      second: {
        direction: 'row',
        first: 'rosMonitor',
        second: 'waypointList',
        splitPercentage: 50,
      },
      splitPercentage: 50,
    },
    splitPercentage: 60,
  });

  // Render function for each mosaic tile.
  const renderTile = (id: MosaicKey, path: MosaicPath): ReactElement => {
    switch (id) {
      case 'mapView':
        return (
          <MosaicWindow<MosaicKey> title="Map View" path={path}>
            <div style={{ height: '100%', backgroundColor: '#121212' }}>
              <MapView />
            </div>
          </MosaicWindow>
        );
      case 'rosMonitor':
        return (
          <MosaicWindow<MosaicKey> title="ROS Monitor" path={path}>
            <ROSMonitor />
          </MosaicWindow>
        );
      case 'waypointList':
        return (
          <MosaicWindow<MosaicKey> title="Waypoint List" path={path}>
            <WaypointList />
          </MosaicWindow>
        );
      case 'nodeManager':
        return (
          <MosaicWindow<MosaicKey> title="Node Manager" path={path}>
            <NodeManagerPanel />
          </MosaicWindow>
        );
      case 'webrtcStream':
        return (
          <MosaicWindow<MosaicKey> title="Video Stream" path={path}>
            <WebRTCClientPanel config={{ mockMode: true, signalingUrl: 'ws://localhost:8443' }} />
          </MosaicWindow>
        )
      default:
        return <div>Unknown tile</div>;
    }
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Mosaic<MosaicKey>
        renderTile={renderTile}
        initialValue={mosaicLayout}
        onChange={setMosaicLayout}
      />
      {/* Global dark mode style overrides for mosaic components */}
      <style jsx global>{`
        .mosaic {
          background-color: #121212;
        }
        .mosaic-window {
          background-color: #1e1e1e;
          color: #f1f1f1;
          border: 1px solid #333;
        }
        .mosaic-window-title {
          background-color: #2d2d2d;
          color: #f1f1f1;
          border-bottom: 1px solid #444;
        }
        .mosaic-window-body {
          background-color: #1e1e1e;
          color: #f1f1f1;
        }
      `}</style>
    </div>
  );
};

export default MosaicDashboard;

