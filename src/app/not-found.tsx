import Link from "next/link";
export default function NotFound() {
  return (
    <main className="standalone">
      <h1>A fresh page awaits.</h1>
      <p>This page could not be found.</p>
      <Link href="/">Back to your workspace →</Link>
    </main>
  );
}
