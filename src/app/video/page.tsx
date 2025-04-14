'use client';

import Layout from "../../components/Layout";
import dynamic from 'next/dynamic';

const GstWebRTCPage = dynamic(() => import("../../components/WebRTCClientPage"), { ssr: false });

export default function Video() {
  return (
    <Layout>
      <GstWebRTCPage config={{mockMode: false, signalingUrl: "ws://localhost:8443"}} />
    </Layout>
  );
}

// export default video;