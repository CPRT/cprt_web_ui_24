'use client';
import React, { useEffect, useState } from 'react';
import ROSLIB from 'roslib';
import { useROS } from '@/ros/ROSContext';

interface GasSensorReading {
    temperature_c: number;
    pressure_pa: number;
    humidity_rh: number;
    co2_ppm: number;
    tvoc_ppb: number;
  }

const SciencePanel: React.FC = () => {
  const { ros } = useROS();
  const [data, setData] = useState<GasSensorReading | null> (null);

  useEffect(() => {
    if (!ros) return; 

    const gasSensorTopic = new ROSLIB.Topic({
        ros,
        name: '/gas_sensor',
        messageType: 'interfaces/msg/GasSensorReading',
    });
    
    const handleReading = (msg: any) => {
        setData({
            temperature_c: msg.temperature_c,
            pressure_pa: msg.pressure_pa,
            humidity_rh: msg.humidity_rh,
            co2_ppm: msg.co2_ppm,
            tvoc_ppb: msg.tvoc_ppb
        });
    };

    gasSensorTopic.subscribe(handleReading);
    return () => gasSensorTopic.unsubscribe(handleReading);
}, [ros]); 

return (
    <div style={{ 
      backgroundColor: '#1e1e1e', 
      color: '#f1f1f1',
      height: '100%',
      padding: '1rem'
    }}>
      <h2 style={{ 
        borderBottom: '1px solid #444', 
        paddingBottom: '0.3rem',
        color: '#f1f1f1',
        margin: 0,
        marginBottom: '0.5rem'
      }}>
        Science
      </h2>

      {!data ? (
        <p style={{ color: '#f1f1f1' }}>Waiting for sensor data...</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li
            style={{
              marginBottom: '0.3rem',
              padding: '0.3rem',
              border: '1px solid #444',
              borderRadius: '3px',
              backgroundColor: '#2d2d2d'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.8rem' }}>
                <div style={{ minWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <label style={{ marginRight: '0.3rem', color: '#aaa' }}>Temperature:</label>
                    <span style={{ color: '#f1f1f1', fontSize: '0.8rem' }}>{data.temperature_c.toFixed(1)}°C</span>
                </div>
                <div style={{ minWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <label style={{ marginRight: '0.3rem', color: '#aaa' }}>Pressure:</label>
                    <span style={{ color: '#f1f1f1', fontSize: '0.8rem' }}>{data.pressure_pa.toFixed(0)} Pa</span>
                </div>
                <div style={{ minWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <label style={{ marginRight: '0.3rem', color: '#aaa' }}>Humidity:</label>
                    <span style={{ color: '#f1f1f1', fontSize: '0.8rem' }}>{data.humidity_rh.toFixed(1)}%</span>
                </div>
                <div style={{ minWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <label style={{ marginRight: '0.3rem', color: '#aaa' }}>CO₂:</label>
                    <span style={{ color: '#f1f1f1', fontSize: '0.8rem' }}>{data.co2_ppm} ppm</span>
                </div>
                <div style={{ minWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <label style={{ marginRight: '0.3rem', color: '#aaa' }}>TVOC:</label>
                    <span style={{ color: '#f1f1f1', fontSize: '0.8rem' }}>{data.tvoc_ppb} ppb</span>
                </div>
            </div>
          </li>
        </ul>
      )}
    </div>
  );
};
    export default SciencePanel;