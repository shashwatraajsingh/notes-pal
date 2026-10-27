"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="standalone">
      <h1>Let’s try that again.</h1>
      <p>Your saved workspace is still in this browser.</p>
      <button onClick={reset}>Reload this page</button>
    </main>
  );
}
