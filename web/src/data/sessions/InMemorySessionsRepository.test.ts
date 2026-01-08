import { describe, expect, it } from "vitest";

import { InMemorySessionsRepository } from "@/data/sessions/InMemorySessionsRepository";

describe("InMemorySessionsRepository", () => {
  it("creates a session and allows joining by joinCode", async () => {
    const repo = new InMemorySessionsRepository();
    const { session } = await repo.createSession({ title: "Test" });

    const lookedUp = await repo.getSessionByJoinCode(session.joinCode);
    expect(lookedUp?.id).toBe(session.id);

    const join = await repo.joinSession({ joinCode: session.joinCode, displayName: "Jay", avatarColor: "#ff0" });
    expect(join.participant.sessionId).toBe(session.id);
  });

  it("prevents selecting an avatarColor already used in the session", async () => {
    const repo = new InMemorySessionsRepository();
    const { session } = await repo.createSession({ joinCode: "DEMO20" });

    await repo.joinSession({ joinCode: session.joinCode, displayName: "A", avatarColor: "#F5C400" });
    await expect(
      repo.joinSession({ joinCode: session.joinCode, displayName: "B", avatarColor: "#f5c400" }),
    ).rejects.toThrow(/unavailable/i);
  });

  it("emits realtime events for participant join and mapping updates", async () => {
    const repo = new InMemorySessionsRepository();
    const { session } = await repo.createSession({});

    const events: string[] = [];
    const unsub = repo.subscribe(session.id, (e) => events.push(e.type));

    const { participant, participantSecret } = await repo.joinSession({ joinCode: session.joinCode, displayName: "A" });
    await repo.toggleDoing({
      sessionId: session.id,
      participantId: participant.id,
      participantSecret,
      itemId: "phase-research__basic__syntax",
      isDoing: true,
    });

    unsub();

    expect(events).toContain("participant_joined");
    expect(events).toContain("mapping_updated");
  });

  it("clearResults removes all mappings and participants for a session", async () => {
    const repo = new InMemorySessionsRepository();
    const { session, adminToken } = await repo.createSession({ joinCode: "DEMO20" });
    const { participant, participantSecret } = await repo.joinSession({
      joinCode: session.joinCode,
      displayName: "Jay",
      avatarColor: "#0057FF",
    });

    await repo.toggleDoing({
      sessionId: session.id,
      participantId: participant.id,
      participantSecret,
      itemId: "phase-research__section__Basic research",
      isDoing: true,
    });
    expect((await repo.listMappings(session.id)).length).toBe(1);
    expect((await repo.listParticipants(session.id)).length).toBe(1);

    await repo.clearResults({ sessionId: session.id, adminToken });
    expect((await repo.listMappings(session.id)).length).toBe(0);
    expect((await repo.listParticipants(session.id)).length).toBe(0);

    // Colors should be available again after reset.
    await expect(repo.joinSession({ joinCode: session.joinCode, displayName: "A", avatarColor: "#0057FF" })).resolves.toBeTruthy();
  });

  it("rejects admin actions with an invalid token", async () => {
    const repo = new InMemorySessionsRepository();
    const { session } = await repo.createSession({ joinCode: "BADTOK" });
    await expect(repo.clearResults({ sessionId: session.id, adminToken: "nope" })).rejects.toThrow(/unauthorized/i);
  });

  it("exportSession returns schemaVersion and includes session/participants/mappings", async () => {
    const repo = new InMemorySessionsRepository();
    const { session, adminToken } = await repo.createSession({ joinCode: "EXP001" });
    const { participant, participantSecret } = await repo.joinSession({ joinCode: session.joinCode, displayName: "A", avatarColor: "#123" });
    await repo.toggleDoing({
      sessionId: session.id,
      participantId: participant.id,
      participantSecret,
      itemId: "phase-research__section__Basic research",
      isDoing: true,
    });

    const out = await repo.exportSession({ sessionId: session.id, adminToken });
    expect(out.schemaVersion).toBe(1);
    expect(out.session.id).toBe(session.id);
    expect(out.participants.length).toBe(1);
    expect(out.mappings.length).toBe(1);
  });
});


