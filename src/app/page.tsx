"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export default function HomePage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");

  function createRoom() {
    const code = generateRoomCode();
    console.log("Creating room:", code);
    router.push(`/room/${code}`);
  }

  function joinRoom() {
    const cleaned = joinCode.trim().toUpperCase();
    if (!cleaned) return;
    router.push(`/room/${cleaned}`);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#f1f5f9",
        padding: 24,
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: 18,
          padding: 24,
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
        }}
      >
        <h1
          style={{
            marginTop: 0,
            marginBottom: 8,
            fontSize: 32,
            fontWeight: 800,
            color: "#0f172a",
          }}
        >
          Phasmo Tracker
        </h1>

        <p
          style={{
            marginTop: 0,
            marginBottom: 20,
            color: "#0f172a",
            fontSize: 14,
          }}
        >
          Create a room or join a friend’s room code.
        </p>

        <button
          onClick={createRoom}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: 12,
            border: "1px solid #0f172a",
            background: "#0f172a",
            color: "white",
            fontWeight: 700,
            cursor: "pointer",
            marginBottom: 16,
          }}
        >
          Create Room
        </button>

        <div style={{ display: "grid", gap: 10 }}>
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="Enter room code"
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid #cbd5e1",
              fontSize: 14,
            }}
          />

          <button
            onClick={joinRoom}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 12,
              border: "1px solid #cbd5e1",
              background: "white",
              color: "#0f172a",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Join Room
          </button>
        </div>
      </div>
    </main>
  );
}