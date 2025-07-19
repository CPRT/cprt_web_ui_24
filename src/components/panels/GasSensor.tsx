'use client';
import React, { useEffect, useState } from 'react';
import ROSLIB from 'roslib';
import { useROS } from '@/ros/ROSContext';

interface GasSensorReading {
    temperature_c: number | null;
    pressure_pa: number | null;
    humidity_rh: number | null;
    co2_ppm: number | null;
    tvoc_ppb: number | null;
    ozone_ppb: number | null;
    hydrogen_ppb: number | null;
  }

const SciencePanel: React.FC = () => {
  const { ros } = useROS();
  const [data, setData] = useState<GasSensorReading> ({
    temperature_c: null,
    pressure_pa: null,
    humidity_rh: null,
    co2_ppm: null,
    tvoc_ppb: null,
    ozone_ppb: null,
    hydrogen_ppb: null,
  });

  useEffect(() => {
    if (!ros) return; 

    const gasSensorTopic = new ROSLIB.Topic({
        ros,
        name: '/gas_sensor',
        messageType: 'interfaces/msg/GasSensorReading',
    });
    const ozoneTopic = new ROSLIB.Topic({
        ros,
        name: '/ozone_sensor',
        messageType: 'std_msgs/Float64',
    });
    const hydrogenTopic = new ROSLIB.Topic({
        ros,
        name: '/hydrogen_sensor',
        messageType: 'std_msgs/Float64',
    });
    
    const handleGasReading = (msg: any) => {
      data.temperature_c = msg.temperature_c;
      data.pressure_pa = msg.pressure_pa;
      data.humidity_rh = msg.humidity_rh;
      data.co2_ppm = msg.co2_ppm;
      data.tvoc_ppb = msg.tvoc_ppb;
      data.ozone_ppb = msg.ozone_ppb;
      data.hydrogen_ppb = msg.hydrogen_ppb;
      setData({ ...data }); // Trigger re-render with new data
    };
    const handleOzoneReading = (msg: any) => {
      data.ozone_ppb = msg.data;
      setData({ ...data });
    };
    const handleHydrogenReading = (msg: any) => {
      data.hydrogen_ppb = msg.data;
      setData({ ...data });
    };

    gasSensorTopic.subscribe(handleGasReading);
    ozoneTopic.subscribe(handleOzoneReading);
    hydrogenTopic.subscribe(handleHydrogenReading);

    const unsubscribeAll = () => {
      gasSensorTopic.unsubscribe(handleGasReading);
      ozoneTopic.unsubscribe(handleOzoneReading);
      hydrogenTopic.unsubscribe(handleHydrogenReading);
    };
    
    return () => unsubscribeAll();
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
                    <span style={{ color: '#f1f1f1', fontSize: '0.8rem' }}>{data.temperature_c !== null ? data.temperature_c.toFixed(1) : 'N/A'}°C</span>
                </div>
                <div style={{ minWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <label style={{ marginRight: '0.3rem', color: '#aaa' }}>Pressure:</label>
                    <span style={{ color: '#f1f1f1', fontSize: '0.8rem' }}>{data.pressure_pa !== null ? data.pressure_pa.toFixed(0) : 'N/A'} Pa</span>
                </div>
                <div style={{ minWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <label style={{ marginRight: '0.3rem', color: '#aaa' }}>Humidity:</label>
                    <span style={{ color: '#f1f1f1', fontSize: '0.8rem' }}>{data.humidity_rh !== null ? data.humidity_rh.toFixed(1) : 'N/A'}%</span>
                </div>
                <div style={{ minWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <label style={{ marginRight: '0.3rem', color: '#aaa' }}>CO₂:</label>
                    <span style={{ color: '#f1f1f1', fontSize: '0.8rem' }}>{data.co2_ppm !== null ? data.co2_ppm : 'N/A'} ppm</span>
                </div>
                <div style={{ minWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <label style={{ marginRight: '0.3rem', color: '#aaa' }}>TVOC:</label>
                    <span style={{ color: '#f1f1f1', fontSize: '0.8rem' }}>{data.tvoc_ppb !== null ? data.tvoc_ppb : 'N/A'} ppb</span>
                </div>
                <div style={{ minWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <label style={{ marginRight: '0.3rem', color: '#aaa' }}>Ozone:</label>
                    <span style={{ color: '#f1f1f1', fontSize: '0.8rem' }}>{data.ozone_ppb !== null ? data.ozone_ppb.toFixed(2) : 'N/A'} ppb</span>
                </div>
                <div style={{ minWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <label style={{ marginRight: '0.3rem', color: '#aaa' }}>H2:</label>
                    <span style={{ color: '#f1f1f1', fontSize: '0.8rem' }}>{data.hydrogen_ppb !== null ? data.hydrogen_ppb.toFixed(2) : 'N/A'} ppb</span>
                </div>
            </div>
          </li>
        </ul>
      )}
    </div>
  );
};
    export default SciencePanel;