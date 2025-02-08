'use client';

import React from 'react';
import panels from '@/panels';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav>
      <ul className="navList">
        <li
          className={activeTab === 'dashboard' ? 'activeNavItem' : 'navItem'}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </li>
        {panels.map((panel) => (
          <li
            key={panel.key}
            className={activeTab === panel.key ? 'activeNavItem' : 'navItem'}
            onClick={() => setActiveTab(panel.key)}
          >
            {panel.label}
          </li>
        ))}
      </ul>

      <style jsx>{`
        .navList {
          list-style: none;
          display: flex;
          gap: 1rem;
          margin: 0;
          padding: 0;
          cursor: pointer;
        }
        .navItem,
        .activeNavItem {
          padding: 0.5rem 1rem;
          border-radius: 4px;
        }
        .activeNavItem {
          background-color: #555;
        }
      `}</style>
    </nav>
  );
};

export default Navigation;
