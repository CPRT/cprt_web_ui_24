import dynamic from 'next/dynamic';
import { PanelItem } from '@/components/PanelGrid';

const MosiacDashboard = dynamic(() => import('@/components/panels/MosaicDashboard'), { ssr: false });

const panels: PanelItem[] = [
  {
    key: "mosaicDash",
    label: 'lmao eat my balls',
    Component: MosiacDashboard
  }
];

export default panels;

