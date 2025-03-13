"use client";

import '@/webrtc-api';
import React, { useEffect, useRef, useState } from "react";
import ROSLIB from 'roslib';
import { useROS } from '@/ros/ROSContext';
import { init } from 'next/dist/compiled/webpack/webpack';

interface IStreamHTMLElement extends HTMLElement {
    _consumerSession?: any;
}

interface WebRTCRosClientConfig {
    signalingUrl?: string;
    // stunServers?: string[]; // tbh we dont need any stun servers, we arent traversing NAT
    videoServiceName?: string;
    videoServiceMessageType?: string;
    defaultVideoRequest?: VideoOutRequest;
    mockMode?: boolean;
}

interface GstWebRTCAPI{
    createConsumerSession: (producerId: string) => any;
    registerProducersListener: (listener: any) => void;
    getAvailableProducers: () => any[];
}

interface WebRTCClientPageProps {
    config?: WebRTCRosClientConfig;
}

interface VideoSource {
    name: string;
    width: number;
    height: number;
    origin_x: number;
    origin_y: number;
}
  
interface VideoOutRequest {
    height: number;
    width: number;
    framerate: number;
    num_sources: number;
    sources: VideoSource[];
}
  
interface VideoOutResponse {
    success: boolean;
}

const defaultConfig: WebRTCRosClientConfig = {
  signalingUrl: 'ws://localhost:8080/signalling',
  videoServiceName: 'rosapi/get_time',
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

const GstWebRTCPage: React.FC<WebRTCClientPageProps> = ({
    config = defaultConfig,
}) => {
  const apiRef = useRef<GstWebRTCAPI | null>(null);
  const { ros, connectionStatus: rosStatus } = useROS();

  // create listener instance for webRTC API

  const initRemoteStreams = (api: GstWebRTCAPI) => {
    const remoteStreamsElement = document.getElementById("remote-streams");

    const listener = {
      producerAdded: (producer: any) => {
        const producerId = producer.id;
        if (!document.getElementById(producerId) && remoteStreamsElement) {
          remoteStreamsElement.insertAdjacentHTML(
            "beforeend",
            `<li id="${producerId}">
              <div class="video" style="display: flex; flex-direction: row;">
                  <video style="width: 100%;"autoplay playsinline muted></video>
              </div>
            </li>`
          );

          const entryElement = document.getElementById(producerId) as IStreamHTMLElement;
          if (!entryElement) return;

          const videoElement = entryElement.querySelector("video") as HTMLVideoElement;

          let session = api.createConsumerSession(producerId);
          entryElement._consumerSession = session;

          session.addEventListener("streamsChanged", () => {
            const streams = session.streams;
            if (streams.length > 0) {
              videoElement.srcObject = streams[0];
              videoElement.play().catch((err) => console.warn("Autoplay failed:", err));
            }
          });

          session.connect();
        }
      },

      producerRemoved: (producer: any) => {
        const element = document.getElementById(producer.id) as IStreamHTMLElement;
        if (element) {
          element._consumerSession?.close();
          element.remove();
        }
      },
    };

    api.registerProducersListener(listener);
    api.getAvailableProducers().forEach(listener.producerAdded);
  };

  // WebRTC API initialization
  const gstWebRTCConfig = {
    signalingServerUrl: `${config.signalingUrl}`,
  };

  const GstWebRTCAPI = (window as any).GstWebRTCAPI;
  const api: GstWebRTCAPI = new GstWebRTCAPI(gstWebRTCConfig);
  apiRef.current = api;

  const sendRequest = (preset: WebRTCRosClientConfig) => {

    if (config.mockMode) {
      console.log('Mock mode enabled, ros service requests not available, ya goof!');
      return;
    }

    if (!ros || rosStatus !== 'connected') {
      console.error('Not connected to ROS');
      return;
    }

    const startVideoSrv = new ROSLIB.Service({
      ros,
      name: preset.videoServiceName!,
      serviceType: preset.videoServiceMessageType!,
    });

    const request: VideoOutRequest = preset.defaultVideoRequest!;
    startVideoSrv.callService(new ROSLIB.ServiceRequest(request), (response: VideoOutResponse) => {
      if (response.success) {
        console.log(`Video stream set to new preset: ${preset.videoServiceName}`);
      } else {
        console.error(`Failed to video preset to ${preset.videoServiceName}`);
      }
    });
  }

  // Ros connection and services
  const startVideoService = () => {

    if (config.mockMode) {
      console.log('Mock mode enabled, bypassing ROS2 services and what not');
      initRemoteStreams(api);
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

    const request: VideoOutRequest = config.defaultVideoRequest || defaultConfig.defaultVideoRequest!;
    startVideoSrv.callService(new ROSLIB.ServiceRequest(request), (response: VideoOutResponse) => {
      if (response.success) {
        console.log('Video stream started successfully on rover.');
        initRemoteStreams(api);
      } else {
        console.error('Failed to start video stream on rover.');
      }
    });
  };



  return (
    <div
      style={{}}>
      <ul id="remote-streams"></ul>
      <div style={{width: '100%', height: '10vh', display: 'flex'}}>
        <button 
          style={{fontSize: '1.5rem', width:'100%', height:'100%'}}
          onClick= {() => sendRequest(defaultConfig)}
        >Preset 1</button>
        <button style={{fontSize: '1.5rem', width:'100%', height:'100%'}}>Preset 2</button>
        <button style={{fontSize: '1.5rem', width:'100%', height:'100%'}}>Preset 3</button>
        <button style={{fontSize: '1.5rem', width:'100%', height:'100%'}}>Preset 4</button>
        <button style={{fontSize: '1.5rem', width:'100%', height:'100%'}}>Preset 5</button>
      </div>
      <div>
        <button onClick={startVideoService}>Start Video Stream</button>
        {/* <button onClick={stopVideoStream}>Stop Video Stream</button> */}
      </div>
      
    </div>
  );
};

export default GstWebRTCPage;
