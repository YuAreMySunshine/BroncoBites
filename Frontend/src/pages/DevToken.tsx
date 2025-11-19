// src/pages/DevToken.tsx
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";

const DevToken = () => {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const [jwt, setJwt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!import.meta.env.DEV) {
      setError("🚫 DevToken is only available in development mode.");
      return;
    }

    const fetchToken = async () => {
      if (!isLoaded) return;
      if (!isSignedIn) {
        setError("🚫 Not signed in, no token available.");
        return;
      }
      try {
        const token = await getToken({ template: "dev-session-token" });
        if (!token) {
          setError("⚠️ No token returned. Check your Clerk template name.");
        } else {
          setJwt(token);
        }
      } catch (err) {
        setError(`❌ Failed to fetch JWT: ${(err as Error).message}`);
      }
    };

    fetchToken();
  }, [getToken, isSignedIn, isLoaded]);

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!jwt) return <p>⏳ Loading token...</p>;

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h2>🔧 DevToken</h2>
      <textarea value={jwt} readOnly rows={6} style={{ width: "100%" }} />
    </div>
  );
};

export default DevToken;

