// src/components/panels/WebRTCClientPanel.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import ROSLIB from 'roslib';
import { useROS } from '@/ros/ROSContext';

/* ======================================================================
   ROS2 Video Service Interface Types
====================================================================== */
export interface VideoSource {
  name: string;
  width: number;
  height: number;
  origin_x: number;
  origin_y: number;
}

export interface VideoOutRequest {
  height: number;
  width: number;
  framerate: number;
  num_sources: number;
  sources: VideoSource[];
}

export interface VideoOutResponse {
  success: boolean;
}

/* ======================================================================
   Configuration Interfaces & Defaults
====================================================================== */
export interface WebRTCClientConfig {
  signalingUrl?: string; // e.g., "ws://localhost:8080/signalling"
  stunServers?: string[]; // e.g., ["stun:stun.l.google.com:19302"]
  videoServiceName?: string; // ROS service name to start video (e.g., "start_video")
  videoServiceMessageType?: string; // ROS message type (e.g., "interfaces/srv/VideoOut")
  defaultVideoRequest?: VideoOutRequest; // Default request parameters
  mockMode?: boolean; // When true, bypass the ROS service call (for testing)
}

export interface WebRTCClientPanelProps {
  config?: WebRTCClientConfig;
  // Factories for creating RTCPeerConnection and WebSocket objects (for testability).
  createPeerConnection?: (config: WebRTCClientConfig) => RTCPeerConnection;
  createWebSocket?: (url: string) => WebSocket;
}

const defaultConfig: WebRTCClientConfig = {
  signalingUrl: 'ws://localhost:8080/signalling',
  stunServers: ['stun:stun.l.google.com:19302'],
  videoServiceName: 'start_video',
  videoServiceMessageType: 'interfaces/srv/VideoOut',
  defaultVideoRequest: {
    height: 480,
    width: 640,
    framerate: 30,
    num_sources: 1,
    sources: [
      {
        name: 'test',
        width: 100,
        height: 100,
        origin_x: 0,
        origin_y: 0,
      },
    ],
  },
  mockMode: false,
};

/* ======================================================================
   WebRTCClientPanel Component
====================================================================== */

const WebRTCClientPanel: React.FC<WebRTCClientPanelProps> = ({
  config = defaultConfig,
  createPeerConnection,
  createWebSocket,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [webrtcStatus, setWebrtcStatus] = useState<string>('disconnected');
  const [streamStarted, setStreamStarted] = useState<boolean>(false);

  // Retrieve ROS connection from our shared context.
  const { ros, connectionStatus: rosStatus } = useROS();

  // Use injected factories or default implementations.
  const createPC =
    createPeerConnection ??
    ((cfg: WebRTCClientConfig) =>
      new RTCPeerConnection({
        iceServers: (cfg.stunServers ?? defaultConfig.stunServers!).map((url) => ({
          urls: url,
        })),
      }));
  const createWS = createWebSocket ?? ((url: string) => new WebSocket(url));

  // Function to set up the WebRTC connection.
  const setupWebRTC = async () => {
    const peerConnection = createPC(config);
    setPc(peerConnection);

    // Add a transceiver for video in recvonly mode.
    peerConnection.addTransceiver('video', { direction: 'recvonly' });

    // Attach remote tracks to the video element.
    peerConnection.ontrack = (event) => {
      if (videoRef.current) {
        videoRef.current.srcObject = event.streams[0];
        console.log("Remote track event:", event.streams);
      }
    };

    // Handle ICE candidates: send them via the signaling channel.
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socket && socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: 'candidate',
            candidate: event.candidate,
          })
        );
      }
    };

    // Create a WebSocket connection for signaling.
    const ws = createWS(config.signalingUrl || defaultConfig.signalingUrl!);
    setSocket(ws);

    ws.onopen = async () => {
      setWebrtcStatus('connected');

      // Create an offer.
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      ws.send(
        JSON.stringify({
          type: 'newPeer',
          peerId: crypto.randomUUID(),
          roles: ['consumer'],
          meta: null,
          sdp: offer.sdp,
        })
      );
    };

    ws.onmessage = async (message) => {
      const data = JSON.parse(message.data);
      if (data.type === 'answer' || data.type === 'peer') {
        const answer = new RTCSessionDescription({ type: 'answer', sdp: data.sdp });
        await peerConnection.setRemoteDescription(answer);
      } else if (data.type === 'candidate') {
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (e) {
          console.error('Error adding ICE candidate', e);
        }
      }
    };

    ws.onclose = () => {
      setWebrtcStatus('disconnected');
    };
  };

  // Function to start the video stream.
  const startVideoService = () => {
    // For testing without ROS2, bypass the service call.
    if (config.mockMode) {
      console.log('Mock mode enabled: bypassing ROS service call.');
      setStreamStarted(true);
      setupWebRTC();
      return;
    }

    if (!ros || rosStatus !== 'connected') {
      console.error('Not connected to ROS');
      return;
    }

    const startVideoSrv = new ROSLIB.Service({
      ros,
      name: config.videoServiceName || defaultConfig.videoServiceName!,
      serviceType: config.videoServiceMessageType || defaultConfig.videoServiceMessageType!,
    });

    const request: VideoOutRequest =
      config.defaultVideoRequest || defaultConfig.defaultVideoRequest!;

    startVideoSrv.callService(new ROSLIB.ServiceRequest(request), (response: VideoOutResponse) => {
      if (response.success) {
        console.log('Video stream started successfully on rover.');
        setStreamStarted(true);
        setupWebRTC();
      } else {
        console.error('Failed to start video stream on rover.');
      }
    });
  };

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      if (pc) pc.close();
      if (socket) socket.close();
    };
  }, [pc, socket]);

  return (
    <div
      style={{
        backgroundColor: '#1e1e1e',
        color: '#f1f1f1',
        padding: '1rem',
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h2>WebRTC Video Stream</h2>
      <p>WebRTC Status: {webrtcStatus}</p>
      {!streamStarted && (
        <button
          onClick={startVideoService}
          style={{ padding: '0.5rem', marginBottom: '1rem' }}
        >
          Start Video Stream
        </button>
      )}
      <div style={{ flex: 1 }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          controls
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover', // Ensures the video fills the container
            backgroundColor: '#000',
          }}
        />
      </div>
    </div>
  );
};

export default WebRTCClientPanel;

