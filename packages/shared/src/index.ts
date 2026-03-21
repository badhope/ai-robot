export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function buildSessionId(platform: string, roomId: string | undefined, senderId: string): string {
  if (!platform || !senderId) {
    throw new Error('buildSessionId requires platform and senderId');
  }

  if (roomId) {
    return `room:${platform}:${roomId}`;
  }
  return `user:${platform}:${senderId}`;
}
