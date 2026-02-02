"use client";

import PusherClient from "pusher-js";

let pusherInstance: PusherClient | null = null;

export function getPusherClient() {
  if (!pusherInstance) {
    pusherInstance = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
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
