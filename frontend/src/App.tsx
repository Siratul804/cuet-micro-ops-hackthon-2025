import { useEffect, useState } from "react";
import * as Sentry from "@sentry/react";
import "./index.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface HealthStatus {
  status: string;
  checks: {
    storage: string;
  };
}

interface DownloadJob {
  id: string;
  fileId: number;
  status: "pending" | "completed" | "failed" | "simulating";
  startTime: number;
  endTime?: number;
  duration?: number;
}

function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [downloads, setDownloads] = useState<DownloadJob[]>([]);
  const [loading, setLoading] = useState(true);

  // Health check with Sentry error tracking
  useEffect(() => {
    const fetchHealth = async () => {
      try {
        console.log("Fetching health from:", `${API_URL}/health`);
        const response = await fetch(`${API_URL}/health`);

        if (!response.ok) {
          throw new Error(`Health check failed: HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log("Health data received:", data);
        setHealth(data);
      } catch (error) {
        console.error("Health check failed:", error);
        // Capture error in Sentry
        Sentry.captureException(error);
        setHealth({ status: "offline", checks: { storage: "unknown" } });
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  // Download function with Sentry error tracking
  const initiateDownload = async (fileId: number) => {
    const newJob: DownloadJob = {
      id: crypto.randomUUID(),
      fileId,
      status: "simulating",
      startTime: Date.now(),
    };

    setDownloads((prev) => [newJob, ...prev]);

    try {
      console.log("Starting download for fileId:", fileId);
      const response = await fetch(`${API_URL}/v1/download/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_id: fileId }),
      });

      if (!response.ok) {
        throw new Error(`Download failed: HTTP ${response.status}`);
      }

      const result = await response.json();
      const endTime = Date.now();
      const duration = (endTime - newJob.startTime) / 1000;

      setDownloads((prev) =>
        prev.map((job) =>
          job.id === newJob.id
            ? {
              ...job,
              status: result.status === "completed" ? "completed" : "failed",
              endTime,
              duration,
            }
            : job,
        ),
      );

      console.log("Download completed:", result);
    } catch (error) {
      console.error("Download error:", error);
      // Capture error in Sentry with context
      Sentry.captureException(error, {
        tags: {
          section: "download",
          fileId: fileId.toString(),
        },
        extra: {
          jobId: newJob.id,
          apiUrl: API_URL,
        },
      });

      setDownloads((prev) =>
        prev.map((job) =>
          job.id === newJob.id
            ? {
              ...job,
              status: "failed",
              endTime: Date.now(),
              duration: (Date.now() - job.startTime) / 1000,
            }
            : job,
        ),
      );
    }
  };

  // Test Sentry error function (safe - doesn't break the page)
  const triggerSentryError = () => {
    console.log("🚨 Triggering test error for Sentry");

    // Capture a custom error in Sentry
    Sentry.captureException(new Error("Test error triggered from dashboard"), {
      tags: {
        section: "error-test",
        source: "manual-trigger",
      },
      extra: {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        apiUrl: API_URL,
      },
    });

    // Also capture a message
    Sentry.captureMessage("Sentry test button clicked", {
      level: "info",
      tags: {
        section: "error-test",
        type: "manual-test",
      },
    });

    console.log("✅ Sentry test error captured! Check browser console and Sentry dashboard.");
    alert("✅ Sentry test error captured! Check browser console for details.");
  };

  if (loading) {
    return (
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <h1>Delineate Observability Dashboard</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", maxWidth: "1200px", margin: "0 auto" }}>
      <header style={{ marginBottom: "30px", borderBottom: "2px solid #eee", paddingBottom: "20px" }}>
        <h1 style={{ color: "#333", margin: "0 0 10px 0" }}>Delineate Observability Dashboard</h1>
        <p style={{ color: "#666", margin: "0" }}>Real-time monitoring with Sentry error tracking</p>
      </header>

      {/* Health Status Section */}
      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ color: "#333", marginBottom: "15px" }}>API Health Status</h2>
        <div style={{
          padding: "20px",
          border: "2px solid " + (health?.status === "healthy" ? "#4CAF50" : "#f44336"),
          borderRadius: "8px",
          backgroundColor: health?.status === "healthy" ? "#f8fff8" : "#fff8f8"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
            <div style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: health?.status === "healthy" ? "#4CAF50" : "#f44336"
            }}></div>
            <strong style={{ fontSize: "18px" }}>
              {health?.status === "healthy" ? "✅ Operational" : "❌ Offline"}
            </strong>
          </div>
          <p style={{ margin: "0", color: "#666" }}>
            Storage: {health?.checks.storage || "unknown"}
          </p>
        </div>
      </section>

      {/* Error Testing Section */}
      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ color: "#333", marginBottom: "15px" }}>Sentry Error Testing</h2>
        <div style={{ padding: "20px", border: "2px solid #ff9800", borderRadius: "8px", backgroundColor: "#fff8f0" }}>
          <p style={{ margin: "0 0 15px 0", color: "#666" }}>
            Test Sentry error tracking by clicking the button below:
          </p>
          <button
            onClick={triggerSentryError}
            style={{
              padding: "12px 24px",
              backgroundColor: "#ff9800",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            🚨 Trigger Sentry Error
          </button>
        </div>
      </section>

      {/* Download Testing Section */}
      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ color: "#333", marginBottom: "15px" }}>Download Testing</h2>
        <div style={{ padding: "20px", border: "2px solid #2196F3", borderRadius: "8px", backgroundColor: "#f8fbff" }}>
          <p style={{ margin: "0 0 15px 0", color: "#666" }}>
            Test download functionality (file IDs divisible by 7 will succeed):
          </p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {[14000, 21000, 28000].map((fileId) => (
              <button
                key={fileId}
                onClick={() => initiateDownload(fileId)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                📥 File ID {fileId}
              </button>
            ))}
          </div>
          <div style={{ marginTop: "10px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <span style={{ color: "#666", fontSize: "14px" }}>Test failures:</span>
            {[10000, 50000].map((fileId) => (
              <button
                key={fileId}
                onClick={() => initiateDownload(fileId)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                ❌ {fileId}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <h2 style={{ color: "#333", marginBottom: "15px" }}>Recent Activity</h2>
        <div style={{ border: "2px solid #ddd", borderRadius: "8px", backgroundColor: "#fafafa" }}>
          {downloads.length === 0 ? (
            <p style={{ padding: "20px", margin: "0", color: "#666", textAlign: "center" }}>
              No downloads initiated yet. Click a download button above to test.
            </p>
          ) : (
            <div>
              {downloads.map((job) => (
                <div
                  key={job.id}
                  style={{
                    padding: "15px 20px",
                    borderBottom: "1px solid #eee",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <strong>File #{job.fileId}</strong>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      ID: {job.id.slice(0, 8)}...
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{
                      padding: "4px 12px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: "white",
                      backgroundColor:
                        job.status === "completed" ? "#4CAF50" :
                          job.status === "failed" ? "#f44336" :
                            job.status === "simulating" ? "#ff9800" : "#666"
                    }}>
                      {job.status}
                    </div>
                    {job.duration && (
                      <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                        {job.duration.toFixed(1)}s
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// Wrap App with Sentry Profiler for performance monitoring
export default Sentry.withProfiler(App);