"use client";

import { useActionState } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { updateGame } from "@/app/actions/games";

type GameData = {
  id: string;
  name: string;
  xTeamName: string;
  yTeamName: string;
  xTeamLogo: string | null;
  yTeamLogo: string | null;
  pricePerSquare: number;
  paymentLink: string | null;
  quarterPayouts: string;
};

export default function EditGamePage() {
  const params = useParams();
  const gameId = params.gameId as string;
  const [state, formAction, isPending] = useActionState(updateGame, null);
  const [game, setGame] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGame() {
      const res = await fetch(`/api/admin/game/${gameId}`);
      if (res.ok) {
        const data = await res.json();
        setGame(data);
      }
      setLoading(false);
    }
    fetchGame();
  }, [gameId]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="alert alert-error">Game not found</div>
      </div>
    );
  }

  const payouts = game.quarterPayouts.split(",").map(Number);

  return (
    <div className="max-w-2xl mx-auto">
      <Link href={`/admin/game/${gameId}`} className="btn btn-ghost btn-sm mb-4">
        &larr; Back to Game
      </Link>

      <h1 className="text-3xl font-bold mb-6">Edit Game</h1>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="gameId" value={gameId} />

            <div className="form-control">
              <label className="label">
                <span className="label-text">Game Name *</span>
              </label>
              <input
                type="text"
                name="name"
                required
                className="input input-bordered"
                defaultValue={game.name}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Column Team (AFC) *</span>
                </label>
                <input
                  type="text"
                  name="xTeamName"
                  required
                  className="input input-bordered"
                  defaultValue={game.xTeamName}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Row Team (NFC) *</span>
                </label>
                <input
                  type="text"
                  name="yTeamName"
                  required
                  className="input input-bordered"
                  defaultValue={game.yTeamName}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Column Team Logo URL</span>
                </label>
                <input
                  type="url"
                  name="xTeamLogo"
                  className="input input-bordered"
                  defaultValue={game.xTeamLogo || ""}
                  placeholder="https://..."
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Row Team Logo URL</span>
                </label>
                <input
                  type="url"
                  name="yTeamLogo"
                  className="input input-bordered"
                  defaultValue={game.yTeamLogo || ""}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Price Per Square ($) *</span>
              </label>
              <input
                type="number"
                name="pricePerSquare"
                required
                min="0.01"
                step="0.01"
                className="input input-bordered"
                defaultValue={(game.pricePerSquare / 100).toFixed(2)}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Payment Link (Venmo, PayPal, CashApp)</span>
              </label>
              <input
                type="url"
                name="paymentLink"
                className="input input-bordered"
                defaultValue={game.paymentLink || ""}
                placeholder="https://venmo.com/yourname"
              />
            </div>

            <div className="divider">Payout Percentages</div>

            <p className="text-sm text-base-content/70">
              Set the payout percentage for each quarter. Must total 100%.
            </p>

            <div className="grid grid-cols-4 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Q1 %</span>
                </label>
                <input
                  type="number"
                  name="q1Payout"
                  required
                  min="0"
                  max="100"
                  className="input input-bordered"
                  defaultValue={payouts[0]}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Q2 %</span>
                </label>
                <input
                  type="number"
                  name="q2Payout"
                  required
                  min="0"
                  max="100"
                  className="input input-bordered"
                  defaultValue={payouts[1]}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Q3 %</span>
                </label>
                <input
                  type="number"
                  name="q3Payout"
                  required
                  min="0"
                  max="100"
                  className="input input-bordered"
                  defaultValue={payouts[2]}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Q4 %</span>
                </label>
                <input
                  type="number"
                  name="q4Payout"
                  required
                  min="0"
                  max="100"
                  className="input input-bordered"
                  defaultValue={payouts[3]}
                />
              </div>
            </div>

            {state?.error && (
              <div className="alert alert-error">
                <span>{state.error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary w-full"
            >
              {isPending ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Save Changes"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
