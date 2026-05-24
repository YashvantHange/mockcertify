import { ImageResponse } from "next/og";
import { siteName } from "@/lib/seo";

export const alt = `${siteName} — IT Certification Practice Exams`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #312e81 0%, #4f46e5 50%, #6366f1 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
          padding: 48,
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: -2 }}>{siteName}</div>
        <div style={{ fontSize: 32, marginTop: 16, opacity: 0.95, textAlign: "center", maxWidth: 900 }}>
          Free practice exams for AWS, Azure, Security+, CISSP, CCNA and more
        </div>
        <div style={{ fontSize: 22, marginTop: 32, opacity: 0.85 }}>8,000+ questions · Timed and practice modes</div>
      </div>
    ),
    { ...size }
  );
}
