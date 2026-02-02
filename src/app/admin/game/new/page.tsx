"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createGame } from "@/app/actions/games";

export default function NewGamePage() {
  const [state, formAction, isPending] = useActionState(createGame, null);

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/admin" className="btn btn-ghost btn-sm mb-4">
        &larr; Back to Dashboard
      </Link>

      <h1 className="text-3xl font-bold mb-6">Create New Game</h1>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <form action={formAction} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Game Name *</span>
              </label>
              <input
                type="text"
                name="name"
                required
                className="input input-bordered"
                placeholder="Super Bowl LIX 2025"
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
                  placeholder="Chiefs"
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
                  placeholder="Eagles"
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
                defaultValue="10.00"
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
                placeholder="https://venmo.com/yourname"
              />
              <label className="label">
                <span className="label-text-alt text-base-content/60">
                  Players will see this link after selecting squares
                </span>
              </label>
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
                  defaultValue="25"
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
                  defaultValue="25"
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
                  defaultValue="25"
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
                  defaultValue="25"
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
                "Create Game"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
