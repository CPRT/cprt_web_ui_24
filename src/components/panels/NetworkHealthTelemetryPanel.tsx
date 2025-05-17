import React, { useEffect, useState } from "react";

const NetworkHealthTelemetryPanel: React.FC = () => {
  // Dummy state for throughput and capacity (uplink & downlink)
  const [stats, setStats] = useState({
    uplinkThroughput: 0,
    downlinkThroughput: 0,
    uplinkCapacity: 0,
    downlinkCapacity: 0,
  });

    useEffect(() => {
    const poll = async () => {
        try {
        const response = await fetch("http://192.168.0.2/status.cgi");
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        console.log(data); // Use your data here
        // setStats(data); // Uncomment and adapt if your API returns the right shape
        } catch (error) {
        console.error(error);
        }
    };

    poll(); // Initial call
    const interval = setInterval(poll, 1000);
    return () => clearInterval(interval);
    }, []);

  return (
    <div style={{
        background: "#1e1e1e",
        color: "#f1f1f1",
        padding: "1rem",
        height: "100%",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
    }}>
      <h3 style={{
            margin: '0', 
            marginBottom: "1rem",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            fontSize: "1.25rem",
            textAlign: "center",
            borderBottom: "1px solid #444",
            paddingBottom: "0.5rem"}}>
        Connection Health
      </h3>
      <div>
        <strong>Uplink Throughput:</strong> {stats.uplinkThroughput} Mbps
      </div>
      <div>
        <strong>Downlink Throughput:</strong> {stats.downlinkThroughput} Mbps
      </div>
      <div>
        <strong>Uplink Capacity:</strong> {stats.uplinkCapacity} Mbps
      </div>
      <div>
        <strong>Downlink Capacity:</strong> {stats.downlinkCapacity} Mbps
      </div>
    </div>
  );
};

export default NetworkHealthTelemetryPanel;