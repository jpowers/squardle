import { prisma } from "@/lib/prisma";
import { GameCard } from "@/components/game";

async function getGames() {
  const games = await prisma.game.findMany({
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
  return games;
}

export default async function HomePage() {
  const games = await getGames();

  return (
    <div>

      {games.length === 0 ? (
        <div className="alert alert-info">
          <span>No games available yet. Check back soon!</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((game) => {
            const squareCount = game.plays.reduce(
              (acc, play) => acc + play.squares.length,
              0
            );
            return (
              <GameCard key={game.id} game={game} squareCount={squareCount} />
            );
          })}
        </div>
      )}
    </div>
  );
}
