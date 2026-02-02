type AxisLabelsProps = {
  numbers: number[] | null;
  axis: "x" | "y";
};

export function AxisLabels({ numbers, axis }: AxisLabelsProps) {
  const labels = numbers ?? Array(10).fill("?");

  if (axis === "x") {
    return (
      <div className="grid grid-cols-10 gap-[2px] ml-8 sm:ml-10 mb-[2px]">
        {labels.map((num, i) => (
          <div
            key={i}
            className="aspect-square flex items-center justify-center text-xs sm:text-sm font-bold bg-secondary text-secondary-content rounded-sm"
          >
            {num}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[2px]">
      {labels.map((num, i) => (
        <div
          key={i}
          className="w-8 sm:w-10 aspect-square flex items-center justify-center text-xs sm:text-sm font-bold bg-accent text-accent-content rounded-sm"
        >
          {num}
        </div>
      ))}
    </div>
  );
}
