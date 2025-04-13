import Layout from "../../components/Layout";
import GstWebRTCPage from "../../components/WebRTCClientPage";

export default function video() {
  return (
    <Layout>
        <GstWebRTCPage config={{mockMode: false, signalingUrl: "ws://localhost:8443"}}/>
    </Layout>
  );
}

// export default video;