"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(login, null);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="card bg-base-100 shadow-xl w-full max-w-md">
        <div className="card-body">
          <h1 className="card-title text-2xl justify-center">Admin Login</h1>

          <form action={formAction} className="space-y-4 mt-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                name="password"
                required
                className="input input-bordered"
                placeholder="Enter admin password"
                autoFocus
              />
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
                "Login"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
