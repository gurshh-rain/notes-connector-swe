"use client";

import Link from "next/link";

export default function ComingSoon() {
  return (
    <div className="coming-soon">
      <h1>Coming soon</h1>
      <p>This feature is not available yet.</p>
      <Link href="/" className="btn-primary">
        Back to Connector
      </Link>
    </div>
  );
}
