"use client";

import { useActionState } from "react";
import { Score } from "@prisma/client";
import { saveScore } from "@/app/actions/scores";

type ScoreEntryFormProps = {
  gameId: string;
  quarter: number;
  xTeamName: string;
  yTeamName: string;
  existingScore?: Score | null;
};

export function ScoreEntryForm({
  gameId,
  quarter,
  xTeamName,
  yTeamName,
  existingScore,
}: ScoreEntryFormProps) {
  const [state, formAction, isPending] = useActionState(saveScore, null);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="gameId" value={gameId} />
      <input type="hidden" name="quarter" value={quarter} />

      <div className="grid grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">{xTeamName}</span>
          </label>
          <input
            type="number"
            name="xScore"
            min="0"
            required
            className="input input-bordered input-sm"
            defaultValue={existingScore?.xScore ?? ""}
            placeholder="0"
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">{yTeamName}</span>
          </label>
          <input
            type="number"
            name="yScore"
            min="0"
            required
            className="input input-bordered input-sm"
            defaultValue={existingScore?.yScore ?? ""}
            placeholder="0"
          />
        </div>
      </div>

      {state?.error && (
        <div className="alert alert-error alert-sm">
          <span>{state.error}</span>
        </div>
      )}

      {state?.success && (
        <div className="alert alert-success alert-sm">
          <span>Score saved!</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="btn btn-primary btn-sm w-full"
      >
        {isPending ? (
          <span className="loading loading-spinner loading-sm"></span>
        ) : existingScore ? (
          "Update Score"
        ) : (
          "Save Score"
        )}
      </button>
    </form>
  );
}
