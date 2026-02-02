"use client";

import { useActionState } from "react";
import { selectSquares } from "@/app/actions/squares";
import { PaymentButton } from "./PaymentButton";

type PlayerFormProps = {
  gameId: string;
  selectedPositions: number[];
  pricePerSquare: number;
  paymentLink?: string | null;
};

export function PlayerForm({
  gameId,
  selectedPositions,
  pricePerSquare,
  paymentLink,
}: PlayerFormProps) {
  const [state, formAction, isPending] = useActionState(selectSquares, null);

  const totalCost = selectedPositions.length * pricePerSquare;
  const formattedTotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(totalCost / 100);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="gameId" value={gameId} />
      <input
        type="hidden"
        name="positions"
        value={JSON.stringify(selectedPositions)}
      />

      <div className="form-control">
        <label className="label pb-1">
          <span className="label-text font-medium">First Name *</span>
        </label>
        <input
          type="text"
          name="firstName"
          required
          className="input input-bordered w-full"
          placeholder="John"
        />
      </div>

      <div className="form-control">
        <label className="label pb-1">
          <span className="label-text font-medium">Last Name *</span>
        </label>
        <input
          type="text"
          name="lastName"
          required
          className="input input-bordered w-full"
          placeholder="Doe"
        />
      </div>

      <div className="form-control">
        <label className="label pb-1">
          <span className="label-text font-medium">Email</span>
        </label>
        <input
          type="email"
          name="email"
          className="input input-bordered w-full"
          placeholder="john@example.com"
        />
      </div>

      <div className="form-control">
        <label className="label pb-1">
          <span className="label-text font-medium">Phone</span>
        </label>
        <input
          type="tel"
          name="phone"
          className="input input-bordered w-full"
          placeholder="555-123-4567"
        />
      </div>

      <div className="divider"></div>

      <div className="bg-base-200 p-4 rounded-lg">
        <div className="flex justify-between mb-2">
          <span>Squares selected:</span>
          <span className="font-bold">{selectedPositions.length}</span>
        </div>
        <div className="flex justify-between text-lg">
          <span>Total:</span>
          <span className="font-bold text-primary">{formattedTotal}</span>
        </div>
      </div>

      {state?.error && (
        <div className="alert alert-error">
          <span>{state.error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending || selectedPositions.length === 0}
        className="btn btn-primary w-full"
      >
        {isPending ? (
          <span className="loading loading-spinner"></span>
        ) : (
          "Confirm Squares"
        )}
      </button>

      {paymentLink && selectedPositions.length > 0 && (
        <PaymentButton
          paymentLink={paymentLink}
          amount={formattedTotal}
          amountCents={totalCost}
          className="w-full"
        />
      )}
    </form>
  );
}
