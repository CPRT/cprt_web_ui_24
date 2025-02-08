// src/components/panels/ROSMonitor.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useROS } from '@/ros/ROSContext';
import ROSLIB from 'roslib';

// Extend ROSLIB.Message to include the 'data' field for a std_msgs/String type.
interface ROSStringMessage extends ROSLIB.Message {
  data: string;
}

const ROSMonitor: React.FC = () => {
  const { ros, connectionStatus, connect, disconnect } = useROS();
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    if (ros && connectionStatus === 'connected') {
      // Create a ROS topic listener for '/chatter' messages of type std_msgs/String.
      const listener = new ROSLIB.Topic({
        ros,
        name: '/chatter',
        messageType: 'std_msgs/String',
      });

      listener.subscribe((message: ROSLIB.Message) => {
        // Type assertion from the generic 'Message' to our 'ROSStringMessage'
        const stringMsg = message as ROSStringMessage;
        setMessages((prev) => [...prev, stringMsg.data]);
      });

      // Clean up by unsubscribing if the effect re-runs or component unmounts
      return () => {
        listener.unsubscribe();
      };
    }
  }, [ros, connectionStatus]);

  return (
    <div style={{ padding: '1rem', backgroundColor: '#1e1e1e', color: '#f1f1f1', height: '100%', overflowY: 'auto' }}>
      <h2>ROS Monitor</h2>
      <p>
        Connection status: <strong>{connectionStatus}</strong>
      </p>
      {connectionStatus !== 'connected' ? (
        <button
          style={{ padding: '0.5rem', marginBottom: '1rem' }}
          onClick={() => connect('ws://localhost:9090')}
        >
          Connect to ROS
        </button>
      ) : (
        <button
          style={{ padding: '0.5rem', marginBottom: '1rem' }}
          onClick={disconnect}
        >
          Disconnect
        </button>
      )}
      <div>
        <h3>Messages:</h3>
        <ul>
          {messages.map((msg, index) => (
            <li key={index} style={{ marginBottom: '0.5rem' }}>
              {msg}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ROSMonitor;

