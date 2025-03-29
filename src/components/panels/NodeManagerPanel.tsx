'use client';

import React, { useEffect, useState } from 'react';
import { useROS } from '@/ros/ROSContext';
import ROSLIB from 'roslib';

interface NodeInfo {
  display_name: string;
  internal_name: string;
  status: 'running' | 'stopped' | 'error';
}

interface NodeInfoMessage {
  display_name: string;
  internal_name: string;
  package: string;
  launch_file: string;
  status: "running" | "stopped";
}
interface NodeList {
  nodes: NodeInfoMessage[];
}

const NodeManagerPanel: React.FC = () => {
  const { ros, connectionStatus } = useROS();
  const [nodes, setNodes] = useState<NodeInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const listNodes = () => {
    if (!ros || connectionStatus !== 'connected') return;
    setLoading(true);
    const listService = new ROSLIB.Service({
      ros: ros,
      name: '/node_manager/list_nodes',
      serviceType: 'interfaces/srv/ListNodes',
    });
    const request = new ROSLIB.ServiceRequest({});
    listService.callService(request, (result: NodeList) => {
      setNodes(result.nodes.map((node, _) => ({
        display_name: node.display_name,
        internal_name: node.internal_name,
        status: node.status,
      })));
      setLoading(false);
    });
  };

  // get node list on connect
  useEffect(() => {
    if (ros && connectionStatus === 'connected') {
      listNodes();
    }
  }, [ros, connectionStatus]);

  // service to do basic operations on the nodes and shit
  const callNodeService = (serviceName: 'launch_node' | 'stop_node', serviceType: 'LaunchNode' | 'StopNode', serviceObject: object) => {
    if (!ros || connectionStatus !== 'connected') return;
    const service = new ROSLIB.Service({
      ros: ros,
      name: `node_manager/${serviceName}`,
      serviceType: `interfaces/srv/${serviceType}`,
    });
    const request = new ROSLIB.ServiceRequest(serviceObject);
    service.callService(request, (result: any) => {
      console.log(`${serviceName} result: `, result);
      // run it back
      listNodes();
    });
  };

  const handleStart = (nodeName: string) => callNodeService('launch_node', 'LaunchNode', {name: nodeName});
  const handleStop = (nodeName: string) => callNodeService('stop_node', 'StopNode', {name: nodeName});
  // const handleRestart = (nodeName: string) => callNodeService('restart', nodeName);

  return (
    <div style={{ padding: '1rem', backgroundColor: '#1e1e1e', color: '#f1f1f1', height: '100%', overflowY: 'auto' }}>
      <h2>Node Manager</h2>
      {connectionStatus !== 'connected' ? (
        <p>Not connected to ROS. Please ensure the connection is active.</p>
      ) : (
        <>
          <button onClick={listNodes} style={{ padding: '0.5rem', marginBottom: '1rem' }}>
            Refresh Nodes
          </button>
          {loading ? (
            <p>Loading nodes...</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #444', padding: '0.5rem' }}>Node Name</th>
                  <th style={{ border: '1px solid #444', padding: '0.5rem' }}>Status</th>
                  <th style={{ border: '1px solid #444', padding: '0.5rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {nodes.map((node) => (
                  <tr key={node.internal_name}>
                    <td style={{ border: '1px solid #444', padding: '0.5rem' }}>{node.display_name}</td>
                    <td style={{ border: '1px solid #444', padding: '0.5rem' }}>{node.status}</td>
                    <td style={{ border: '1px solid #444', padding: '0.5rem' }}>
                      <button onClick={() => handleStart(node.internal_name)} style={{ marginRight: '0.5rem' }}>
                        Start
                      </button>
                      <button onClick={() => handleStop(node.internal_name)} style={{ marginRight: '0.5rem' }}>
                        Stop
                      </button>
                      {//TODO: restarting?
                      /* <button onClick={() => handleRestart(node.name)}>
                        Restart
                      </button> */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
};

export default NodeManagerPanel;

