"use client";

import { useState } from 'react';
import Layout from '@/components/Layout';
import PanelGrid from '@/components/PanelGrid';

import panels from '@/panels'

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const renderActiveTab = () => {
    if (activeTab === 'dashboard') {
      return <PanelGrid panels={panels} />
    }

    const panel = panels.find((p) => p.key === activeTab);

    if (panel && panel.Component) {
      const PanelComponent = panel.Component;
      return (
        <div className="SinglePanel">
          <PanelComponent />
          <style jsx>{`
            .singlePanel {
              border: 1px solid #ccc;
              border-radius: 8px;
              overflow: hidden;
              background-color: #fafafa;
              height: calc(100vh - 100px);
              padding: 1rem;
            }
            `}</style>

        </div>
      );
    }
    return <div>Panel not found</div>
  }
  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderActiveTab()}
    </Layout>
  )
}

export default Dashboard;
