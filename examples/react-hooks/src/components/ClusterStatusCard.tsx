import { useClusterState, useClusterStatus } from '@solana/react-hooks';

function describeStatus(status: ReturnType<typeof useClusterStatus>): string {
    if (status.status === 'connecting') {
        return 'Dialing RPC and WebSocket endpoints…';
    }
    if (status.status === 'ready') {
        return status.latencyMs !== undefined
            ? `Connected (latency ≈ ${status.latencyMs.toFixed(0)}ms)`
            : 'Connected to the cluster.';
    }
    if (status.status === 'error') {
        return 'Cluster connection failed. Check the logs for details.';
    }
    return 'Waiting for the client to start.';
}

export function ClusterStatusCard() {
    const cluster = useClusterState();
    const status = useClusterStatus();
    const label = status.status === 'ready' ? 'Ready' : status.status;

    return (
        <section className="card">
            <h2>Cluster</h2>
            <div className={`tag${status.status === 'error' ? ' error' : ''}`}>{label}</div>
            <p>
                Endpoint: <code>{cluster.endpoint}</code>
            </p>
            {cluster.websocketEndpoint ? (
                <p>
                    WebSocket: <code>{cluster.websocketEndpoint}</code>
                </p>
            ) : null}
            <p>{describeStatus(status)}</p>
        </section>
    );
}
