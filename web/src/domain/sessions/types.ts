export type SessionStatus = "open" | "closed";

export type Session = {
  id: string;
  joinCode: string;
  title?: string;
  status: SessionStatus;
  createdAt: string; // ISO
};

export type Participant = {
  id: string;
  sessionId: string;
  displayName: string;
  avatarColor?: string;
  joinedAt: string; // ISO
  lastSeenAt?: string; // ISO
};

export type Mapping = {
  sessionId: string;
  participantId: string;
  itemId: string;
  isDoing: boolean;
  updatedAt: string; // ISO
};


