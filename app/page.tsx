"use client";

import { useState } from "react";

export default function Home() {
  const [jobDescription, setJobDescription] = useState("");
  const [resume, setResume] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const runDecoder = async () => {
    try {
      setLoading(true);
      setOutput("Analyzing resume against job description...");

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobDescription,
          resume,
        }),
      });

      const text = await res.text();
      console.log("Raw response:", text);

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server did not return valid JSON");
      }

      if (!res.ok) {
        throw new Error(data.error || "Server request failed");
      }

      setOutput(data.output || "No output returned");
    } catch (error: any) {
      console.error(error);
      setOutput(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        padding: "40px",
        fontFamily: "Arial",
        background: "#0c0c0c",
        minHeight: "100vh",
        color: "white",
      }}
    >
      <h1 style={{ fontSize: "36px", fontWeight: "bold" }}>
        Haunted Funnel Breaker
      </h1>

      <p style={{ marginBottom: "30px", opacity: 0.8 }}>
        AI Job Search Intelligence Engine
      </p>

      <h3>Paste Job Description</h3>

      <textarea
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        rows={10}
        style={{
          width: "100%",
          marginBottom: "25px",
          padding: "10px",
          borderRadius: "6px",
        }}
      />

      <h3>Paste Resume</h3>

      <textarea
        value={resume}
        onChange={(e) => setResume(e.target.value)}
        rows={10}
        style={{
          width: "100%",
          marginBottom: "25px",
          padding: "10px",
          borderRadius: "6px",
        }}
      />

      <button
        onClick={runDecoder}
        disabled={loading}
        style={{
          padding: "12px 22px",
          background: "crimson",
          border: "none",
          borderRadius: "8px",
          color: "white",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        {loading ? "Running AI Analysis..." : "Run AI Analysis"}
      </button>

      <div
        style={{
          marginTop: "40px",
          padding: "20px",
          background: "#1a1a1a",
          borderRadius: "10px",
          whiteSpace: "pre-wrap",
        }}
      >
        {output}
      </div>
    </main>
  );
}
