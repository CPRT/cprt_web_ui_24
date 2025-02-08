'use client';
import React, { ReactNode } from 'react';
import Navigation from './Navigation';

interface LayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ activeTab, setActiveTab, children }) => {
  return (
    <div className="pageContainer">
      <header className="header">
        <h1 className="title">ROS2 Offline Dashboard</h1>
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </header>
      <main className="mainContent">{children}</main>

      {/* Inline styles for demonstration purposes */}
      <style jsx>{`
        .pageContainer {
          height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .header {
          background-color: #333;
          color: #fff;
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .title {
          margin: 0;
        }
        .mainContent {
          flex: 1;
          padding: 1rem;
          overflow-y: auto;
        }
      `}</style>
    </div>
  )
}

export default Layout;
