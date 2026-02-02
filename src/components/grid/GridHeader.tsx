type GridHeaderProps = {
  xTeamName: string;
  yTeamName: string;
};

export function GridHeader({ xTeamName, yTeamName }: GridHeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-4">
      <div className="flex items-center gap-2">
        <span className="badge badge-secondary badge-lg">{xTeamName}</span>
        <span className="text-sm text-base-content/70">(columns)</span>
      </div>
      <span className="text-xl font-bold">vs</span>
      <div className="flex items-center gap-2">
        <span className="badge badge-accent badge-lg">{yTeamName}</span>
        <span className="text-sm text-base-content/70">(rows)</span>
      </div>
    </div>
  );
}
