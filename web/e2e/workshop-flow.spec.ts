import { test, expect } from "@playwright/test";

test("workshop flow: create → join → toggle propagates → wallboard clear → export", async ({ browser, request }) => {
  const joinCode = `E2E${Date.now().toString(36).toUpperCase()}`;
  // Create session (host)
  const createRes = await request.post("/api/sessions/create", { data: { title: "E2E Workshop", joinCode } });
  expect(createRes.ok()).toBeTruthy();
  const created = (await createRes.json()) as {
    session: { id: string; joinCode: string };
    adminToken: string;
  };
  const sessionId = created.session.id;
  expect(created.session.joinCode).toBe(joinCode);
  const adminToken = created.adminToken;

  // Participant A joins (separate context so localStorage doesn't collide with other participants)
  const ctxA = await browser.newContext();
  const a = await ctxA.newPage();
  await a.goto("/join");
  await a.getByLabel("Session code").fill(joinCode);
  await a.getByRole("button", { name: /continue/i }).click();

  await a.getByLabel("Display name").fill("Alice");
  // Click first available color button (we keep this selector robust by using aria-label)
  await a.getByRole("button", { name: /^Select color / }).first().click();
  await a.getByRole("button", { name: /^Join$/ }).click();

  await expect(a.getByRole("heading", { level: 1, name: /alice/i })).toBeVisible();

  // Toggle one section ON
  const basicSwitch = a.getByRole("switch", { name: /toggle doing for basic research/i });
  await basicSwitch.click();
  await expect(basicSwitch).toBeChecked();

  // Participant B joins (another isolated context)
  const ctxB = await browser.newContext();
  const b = await ctxB.newPage();
  await b.goto(`/s/${encodeURIComponent(joinCode)}`);
  await b.getByLabel("Display name").fill("Bob");
  await b.getByRole("button", { name: /^Select color / }).first().click();
  await b.getByRole("button", { name: /^Join$/ }).click();

  // B should see aggregate count update for that section (chip "1" appears)
  await expect(b.getByText("Basic research", { exact: true })).toBeVisible();
  await expect(b.getByText("1", { exact: true }).first()).toBeVisible();

  // Wallboard without participant identity should NOT show "View Your Page"
  const ctxObserver = await browser.newContext();
  const obs = await ctxObserver.newPage();
  await obs.goto(`/w/${encodeURIComponent(joinCode)}?token=${encodeURIComponent(adminToken)}`);
  await expect(obs.getByRole("button", { name: /view your page/i })).toHaveCount(0);
  await expect(obs.getByRole("button", { name: /clear results/i })).toBeVisible();

  // Host clears results from wallboard
  await obs.getByRole("button", { name: /clear results/i }).click();
  await obs.getByRole("button", { name: /^Clear$/ }).click();
  // Dialog closes only on successful clear.
  await expect(obs.getByRole("dialog")).toHaveCount(0);
  // Verify server-side state is cleared (guards against silent auth failures).
  await expect
    .poll(async () => {
      const res = await request.get(`/api/sessions/state/${encodeURIComponent(sessionId)}`, { failOnStatusCode: false });
      if (!res.ok()) return -1;
      const json = (await res.json()) as { mappings?: unknown[] };
      return json.mappings?.length ?? 0;
    })
    .toBe(0);

  // Participant A should receive results_cleared and switch goes off
  await expect(basicSwitch).not.toBeChecked();

  // Export from admin control center downloads JSON with schemaVersion 1
  const admin = await ctxObserver.newPage();
  await admin.goto(`/admin/${encodeURIComponent(sessionId)}?token=${encodeURIComponent(adminToken)}`);
  const downloadPromise = admin.waitForEvent("download");
  await admin.getByRole("button", { name: /export json/i }).click();
  const download = await downloadPromise;
  const content = await download.createReadStream();
  expect(content).not.toBeNull();
  const chunks: Buffer[] = [];
  for await (const c of content!) chunks.push(Buffer.from(c));
  const json = JSON.parse(Buffer.concat(chunks).toString("utf-8")) as { schemaVersion: number; session: { joinCode: string } };
  expect(json.schemaVersion).toBe(1);
  expect(json.session.joinCode).toBe(joinCode);

  await ctxA.close();
  await ctxB.close();
  await ctxObserver.close();
});

