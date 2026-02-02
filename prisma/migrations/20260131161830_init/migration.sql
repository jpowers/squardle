-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "xTeamName" TEXT NOT NULL,
    "yTeamName" TEXT NOT NULL,
    "pricePerSquare" INTEGER NOT NULL,
    "closed" BOOLEAN NOT NULL DEFAULT false,
    "xNumbers" TEXT,
    "yNumbers" TEXT,
    "quarterPayouts" TEXT NOT NULL DEFAULT '25,25,25,25',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Play" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Play_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Square" (
    "id" TEXT NOT NULL,
    "playId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "Square_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Score" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "quarter" INTEGER NOT NULL,
    "xScore" INTEGER NOT NULL,
    "yScore" INTEGER NOT NULL,
    "winningSquareId" TEXT,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Game_name_key" ON "Game"("name");

-- CreateIndex
CREATE INDEX "Play_gameId_idx" ON "Play"("gameId");

-- CreateIndex
CREATE INDEX "Square_playId_idx" ON "Square"("playId");

-- CreateIndex
CREATE UNIQUE INDEX "Square_playId_position_key" ON "Square"("playId", "position");

-- CreateIndex
CREATE INDEX "Score_gameId_idx" ON "Score"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "Score_gameId_quarter_key" ON "Score"("gameId", "quarter");

-- AddForeignKey
ALTER TABLE "Play" ADD CONSTRAINT "Play_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Square" ADD CONSTRAINT "Square_playId_fkey" FOREIGN KEY ("playId") REFERENCES "Play"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
