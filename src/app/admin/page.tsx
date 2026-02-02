import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/game-utils";
import { logout } from "@/app/actions/auth";

async function getGames() {
  return prisma.game.findMany({
    include: {
      _count: {
        select: { plays: true },
      },
      plays: {
        include: {
          squares: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export default async function AdminDashboard() {
  const admin = await isAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const games = await getGames();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/admin/game/new" className="btn btn-primary">
            Create Game
          </Link>
          <form action={logout}>
            <button type="submit" className="btn btn-ghost">
              Logout
            </button>
          </form>
        </div>
      </div>

      {games.length === 0 ? (
        <div className="alert alert-info">
          <span>No games yet. Create your first game!</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Name</th>
                <th>Teams</th>
                <th>Price</th>
                <th>Players</th>
                <th>Squares</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game) => {
                const squareCount = game.plays.reduce(
                  (acc, play) => acc + play.squares.length,
                  0
                );
                return (
                  <tr key={game.id}>
                    <td className="font-semibold">{game.name}</td>
                    <td>
                      {game.xTeamName} vs {game.yTeamName}
                    </td>
                    <td>{formatCurrency(game.pricePerSquare)}</td>
                    <td>{game._count.plays}</td>
                    <td>{squareCount}/100</td>
                    <td>
                      {game.closed ? (
                        <span className="badge badge-warning">Closed</span>
                      ) : (
                        <span className="badge badge-success">Open</span>
                      )}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/game/${game.id}`}
                          className="btn btn-ghost btn-xs"
                        >
                          Manage
                        </Link>
                        {game.closed && (
                          <Link
                            href={`/admin/game/${game.id}/scores`}
                            className="btn btn-ghost btn-xs"
                          >
                            Scores
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
