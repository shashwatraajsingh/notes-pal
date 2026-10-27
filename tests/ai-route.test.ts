import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { POST } from "../src/app/api/ai/chat/route";
const payload = {
  apiKey: "test-key-not-real",
  model: "gemini-2.5-flash",
  subject: "Computer Networks",
  context: "The network layer handles routing.",
  messages: [{ role: "user", content: "What handles routing?" }],
};
function request(body: unknown) {
  return new Request("http://localhost/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
test("AI rejects invalid payloads before contacting any service", async () => {
  const fetchMock = mock.method(
    globalThis,
    "fetch",
    async () => new Response("unexpected"),
  );
  try {
    for (const body of [
      {},
      { ...payload, model: "../../arbitrary-host" },
      { ...payload, apiKey: "" },
    ]) {
      const response = await POST(request(body));
      assert.equal(response.status, 400);
    }
    assert.equal(fetchMock.mock.callCount(), 0);
  } finally {
    fetchMock.mock.restore();
  }
});
test("AI streams Gemini output using the supplied key without exposing it in the response", async () => {
  const fetchMock = mock.method(
    globalThis,
    "fetch",
    async (url: unknown, options?: RequestInit) => {
      assert.match(
        String(url),
        /^https:\/\/generativelanguage.googleapis.com\/v1beta\/models\/gemini-2.5-flash:streamGenerateContent/,
      );
      assert.equal(
        (options?.headers as Record<string, string>)["x-goog-api-key"],
        payload.apiKey,
      );
      const body = JSON.parse(String(options?.body));
      assert.match(
        body.systemInstruction.parts[0].text,
        /network layer handles routing/,
      );
      return new Response(
        'data: {"candidates":[{"content":{"parts":[{"text":"Layer 3."}]}}]}\n\n',
      );
    },
  );
  try {
    const response = await POST(request(payload));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    const text = await response.text();
    assert.match(text, /Layer 3/);
    assert.ok(!text.includes(payload.apiKey));
  } finally {
    fetchMock.mock.restore();
  }
});
test("upstream errors do not leak credentials or provider error details", async () => {
  const fetchMock = mock.method(
    globalThis,
    "fetch",
    async () =>
      new Response(JSON.stringify({ error: payload.apiKey }), { status: 403 }),
  );
  try {
    const response = await POST(request(payload));
    assert.equal(response.status, 403);
    assert.ok(!(await response.text()).includes(payload.apiKey));
  } finally {
    fetchMock.mock.restore();
  }
});
