'use client';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import ROSLIB from 'roslib';
import { useROS } from '@/ros/ROSContext';

type MotorStatus = {
  velocity: number;
  temperature: number;
  output_current: number;
  bus_voltage: number;
};

const OrientationDisplayPanel: React.FC = () => {
  const { ros } = useROS();
  const containerRef = useRef<HTMLDivElement>(null);
  const cubeRef = useRef<THREE.Mesh | null>(null);

  const [motorStats, setMotorStats] = useState<{
    fl: MotorStatus | null;
    fr: MotorStatus | null;
    rl: MotorStatus | null;
    rr: MotorStatus | null;
  }>({
    fl: null,
    fr: null,
    rl: null,
    rr: null,
  });

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1e1e1e);

    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.set(0, 2, 5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 7.5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x444444));

    const bodyGeometry = new THREE.BoxGeometry(1.2, 0.4, 2);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x156289 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    scene.add(body);
    cubeRef.current = body;

    const createWheel = () => {
      const geo = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 32);
      const mat = new THREE.MeshStandardMaterial({ color: 0xE91C24 });
      const wheel = new THREE.Mesh(geo, mat);
      wheel.rotation.z = Math.PI / 2;
      return wheel;
    };

    const wheelOffsets = [
      [0.6, -0.3, 0.9],
      [-0.6, -0.3, 0.9],
      [0.6, -0.3, -0.9],
      [-0.6, -0.3, -0.9],
    ];

    wheelOffsets.forEach(([x, y, z]) => {
      const wheel = createWheel();
      wheel.position.set(x, y, z);
      body.add(wheel);
    });

    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current) {
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
        camera.updateProjectionMatrix();
      }
    });
    resizeObserver.observe(containerRef.current);

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (!ros || !cubeRef.current) return;

    const imuTopic = new ROSLIB.Topic({
      ros,
      name: '/zed/zed_node/imu/data',
      messageType: 'sensor_msgs/Imu',
      throttle_rate: 100,
    });

    const handleIMU = (msg: any) => {
      const { x, y, z, w } = msg.orientation;
      const newQuat = new THREE.Quaternion(-y, z, -x, w).normalize();
      const euler = new THREE.Euler().setFromQuaternion(newQuat, 'YXZ');
      euler.y = 0;
      const rollPitchQuat = new THREE.Quaternion().setFromEuler(euler);
      cubeRef.current!.quaternion.copy(rollPitchQuat);
    };

    imuTopic.subscribe(handleIMU);
    return () => imuTopic.unsubscribe(handleIMU);
  }, [ros]);

  useEffect(() => {
    if (!ros) return;

    const motors = {
      fl: '/motor_fl/status',
      fr: '/motor_fr/status',
      rl: '/motor_rl/status',
      rr: '/motor_rr/status',
    };

    const subscriptions = Object.entries(motors).map(([key, topicName]) => {
      const topic = new ROSLIB.Topic({
        ros,
        name: topicName,
        messageType: 'your_msgs/MotorStatus',
        throttle_rate: 100,
      });

      const handler = (msg: any) => {
        setMotorStats(prev => ({
          ...prev,
          [key]: {
            velocity: msg.velocity,
            temperature: msg.temperature,
            output_current: msg.output_current,
            bus_voltage: msg.bus_voltage,
          },
        }));
      };

      topic.subscribe(handler);
      return () => topic.unsubscribe(handler);
    });

    return () => subscriptions.forEach(unsub => unsub());
  }, [ros]);

  const renderMotorInfo = (label: string, data: MotorStatus | null) => {
    if (!data) return <div>{label}: waiting for data...</div>;
    return (
      <div>
        <strong>{label}</strong><br />
        Velocity: {data.velocity.toFixed(2)} m/s<br />
        Temp: {data.temperature.toFixed(1)} °C<br />
        Current: {data.output_current.toFixed(2)} A
        Bus_voltage: {data.bus_voltage.toFixed(2)} V<br />
      </div>
    );
  };

  return (
    <div className="orientation-panel">
      <h3>UGV Orientation</h3>
      <div className="viewport" ref={containerRef}>
        <div className="motor-stats top-left">{renderMotorInfo('Front Left', motorStats.fl)}</div>
        <div className="motor-stats top-right">{renderMotorInfo('Front Right', motorStats.fr)}</div>
        <div className="motor-stats bottom-left">{renderMotorInfo('Rear Left', motorStats.rl)}</div>
        <div className="motor-stats bottom-right">{renderMotorInfo('Rear Right', motorStats.rr)}</div>
      </div>

      <style jsx>{`
        .orientation-panel {
          background: #1e1e1e;
          color: #f1f1f1;
          padding: 1rem;
          border-radius: 8px;
          height: 100%;
          display: flex;
          flex-direction: column;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        h3 {
          margin: 0 0 1rem 0;
          font-size: 1.25rem;
          text-align: center;
          border-bottom: 1px solid #444;
          padding-bottom: 0.5rem;
        }
        .viewport {
          width: 100%;
          height: 100%;
          position: relative;
          overflow: hidden;
        }
        canvas {
          display: block;
          max-width: 100%;
          max-height: 100%;
        }
        .motor-stats {
          position: absolute;
          background: rgba(30, 30, 30, 0.85);
          padding: 0.5rem;
          font-size: 0.8rem;
          border-radius: 0.5rem;
          color: #fff;
          line-height: 1.3;
        }
        .top-left { top: 1rem; left: 1rem; }
        .top-right { top: 1rem; right: 1rem; text-align: right; }
        .bottom-left { bottom: 1rem; left: 1rem; }
        .bottom-right { bottom: 1rem; right: 1rem; text-align: right; }
      `}</style>
    </div>
  );
};

export default OrientationDisplayPanel;
