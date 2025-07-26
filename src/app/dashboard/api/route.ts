const USERNAME = 'ubnt';
const PASSWORD = 'samitherover';
const baseStationIP = '192.168.0.2';

// Authenticates with the base station
async function authenticate() {
  const response = await fetch(`http://${baseStationIP}/api/auth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: USERNAME,
      password: PASSWORD,
    }),
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Authentication failed');
  }
}

// Fetches status JSON from the base station
async function fetchStatus() {
  const response = await fetch(`http://${baseStationIP}/status.cgi`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch status');
  }
  return response.json();
}

export async function GET(request: Request) {
  try {
    await authenticate();
    const status = await fetchStatus();

    // Extract only the needed fields for the frontend
    const uplinkCapacity = status.wireless?.polling?.ucap ?? 0;
    const downlinkCapacity = status.wireless?.polling?.dcap ?? 0;
    const uplinkThroughput = status.wireless?.throughput?.tx ?? 0;
    const downlinkThroughput = status.wireless?.throughput?.rx ?? 0;

    return Response.json({
      uplinkCapacity,
      downlinkCapacity,
      uplinkThroughput,
      downlinkThroughput,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}