export default function OfflinePage() {
  return (
    <div className="app-card px-3 py-2">
      <h1 className="h5 mb-2">You&apos;re offline</h1>
      <p className="text-secondary mb-0">
        This app requires a network connection for the latest data. Please
        reconnect and try again.
      </p>
    </div>
  );
}
