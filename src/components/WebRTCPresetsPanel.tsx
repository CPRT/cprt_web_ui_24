"use client";

import React from "react";
import { VideoOutRequest } from "./WebRTCClientPage"; // or from a shared types file if you have one

// Prop Types
interface WebRTCPresetsPanelProps {
  onPresetSelect: (presetName: string, preset: VideoOutRequest) => void;
}

// Inline Styles
const buttonStyle: React.CSSProperties = {
  fontSize: "1.5rem",
  width: "100%",
  height: "100%",
};

// Component
const WebRTCPresetsPanel: React.FC<WebRTCPresetsPanelProps> = ({ onPresetSelect }) => {
  // Local preset definitions
  const presets: { name: string; preset: VideoOutRequest }[] = [
    {
      name: "Drive",
      preset: {
        num_sources: 1,
        sources: [{ name: "Drive", width: 100, height: 100, origin_x: 0, origin_y: 0 }],
      },
    },
    {
      name: "Test",
      preset: {
        num_sources: 1,
        sources: [{ name: "Test", width: 100, height: 100, origin_x: 0, origin_y: 0 }],
      },
    },
  ];

  return (
    <div style={{ width: "100%", height: "10vh", display: "flex" }}>
      {presets.map(({ name, preset }) => (
        <button
          key={name}
          style={buttonStyle}
          onClick={() => onPresetSelect(name, preset)}
        >
          {name}
        </button>
      ))}
    </div>
  );
};

export default WebRTCPresetsPanel;
