"use client";

import PusherClient from "pusher-js";

let pusherInstance: PusherClient | null = null;

export function getPusherClient() {
  if (!pusherInstance) {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    if (!key || !cluster) {
      throw new Error("Pusher configuration missing. Check NEXT_PUBLIC_PUSHER_KEY and NEXT_PUBLIC_PUSHER_CLUSTER env vars.");
    }
    pusherInstance = new PusherClient(key, { cluster });
  }
  return pusherInstance;
}

export function getGameChannel(gameId: string) {
  return `game-${gameId}`;
}

export type SquaresTakenEvent = {
  positions: number[];
  playerName: string;
};
