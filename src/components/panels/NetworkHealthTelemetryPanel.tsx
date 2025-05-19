import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

const USERNAME = "ubnt"
const PASSWORD = "samitherover"
const baseStationIP = "192.168.0.2"

const NetworkHealthTelemetryPanel: React.FC = () => {
  const [stats, setStats] = useState({
    uplinkThroughput: 0,
    downlinkThroughput: 0,
    uplinkCapacity: 100,
    downlinkCapacity: 100,
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const authenticateAndStartPolling = async () => {
      try {
        // Step 1: Authenticate once
        const authResponse = await fetch(`http://${baseStationIP}/api/auth`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: USERNAME,
            password: PASSWORD,
          }),
          credentials: "include", // Include cookies for session
        });

        if (!authResponse.ok) {
          console.error("Authentication failed");
        }

        // Step 2: Start polling
        const poll = async () => {
          try {
            const statusResponse = await fetch(`http://${baseStationIP}/status.cgi`, {
              method: "GET",
              credentials: "include",
            });

            if (!statusResponse.ok) {
              console.error("Failed to fetch status");
            }

            const data = await statusResponse.json();
            

            //TO DO: Modify these to the actual capacity and throughput values in the status json object
            //to find these, search for uplinkCapacity and downlinkCapacity for capacity values and a "througput" array in the json object
            const uplinkCapacity = data.uplinkCapacity ?? 0;
            const downlinkCapacity = data.downlinkCapacity ?? 0;
            const uplinkThroughput = data.uplinkThroughput ?? 0;
            const downlinkThroughput = data.downlinkThroughput ?? 0;

            setStats({
              uplinkThroughput,
              downlinkThroughput,
              uplinkCapacity,
              downlinkCapacity,
            });
          } catch (error) {
            console.error("Polling error:", error);
          }
        };

        // Initial poll + start interval
        await poll();
        interval = setInterval(poll, 1000);

      } catch (error) {
        console.error("Authentication or polling setup failed:", error);
      }
    };

    authenticateAndStartPolling();

    // Cleanup on unmount
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);


  const data = [
    {
      name: "Uplink",
      Throughput: stats.uplinkThroughput,
      Capacity: stats.uplinkCapacity,
    },
    {
      name: "Downlink",
      Throughput: stats.downlinkThroughput,
      Capacity: stats.downlinkCapacity,
    },
  ];

  return (
    <div
      style={{
        background: "#1e1e1e",
        color: "#f1f1f1",
        padding: "1rem",
        height: "100%",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h3
        style={{
          margin: "0",
          marginBottom: "1rem",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          fontSize: "1.25rem",
          textAlign: "center",
          borderBottom: "1px solid #444",
          paddingBottom: "0.5rem",
        }}
      >
        Connection Health
      </h3>

      <div style={{ marginTop: "2rem", height: "250px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis
              type="number"
              domain={[0, (dataMax:number) => Math.floor(dataMax * 1.2)]}
              stroke="#ccc"
              tick={{ fill: "#ccc" }}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#ccc"
              tick={{ fill: "#ccc" }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#333", border: "none", color: "#fff" }}
              labelStyle={{ color: "#ddd" }}
            />
            <Bar dataKey="Capacity" fill="#4b5563" barSize={24} />
            <Bar dataKey="Throughput" fill="#3b82f6" barSize={16}>
              <LabelList dataKey="Throughput" position="right" fill="#f1f1f1" />
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.Throughput / entry.Capacity > 0.85
                      ? "#ef4444"
                      : "#3b82f6"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default NetworkHealthTelemetryPanel;