import { parseData } from "@/app/libs/parseData";
import { JSX, useEffect, useState } from "react";

type Props = {
  value: string;
  onChange: (s: string) => void;
};

type GridData = {
  size: number;
  Cells: Cell[];
};

type Cell = {
  id: string;
  symbol: string;
};

function CreateCell(
  value: string,
  id: string,
  onChange: (id: string, s: string) => void
) {
  return (
    <div className="flex-1 flex">
      <input
        type="text"
        maxLength={1}
        value={value}
        onChange={(e) => {
          onChange(id, e.target.value);
        }}
        className="w-full text-center uppercase text-2xl h-full ring ring-gray-300 rounded-lg py-0.5"
      />
    </div>
  );
}

function generateCells(grid: Cell[], size: number): Cell[] {
  const temp = [];
  for (let index = 0; index < size * size; index++) {
    const element = grid[index];
    if (element) {
      temp.push({ id: String(index), symbol: element.symbol });
    } else {
      temp.push({ id: String(index), symbol: "" });
    }
  }
  return temp;
}

export default function SearchWord({ value, onChange }: Props) {
  const [validatedData, setValidatedData] = useState<GridData>(() => {
    const parsed = parseData(value) ?? { Cells: [], size: 3 };

    return {
      size: parsed.size,
      Cells: generateCells(parsed.Cells, parsed.size),
    };
  });

  const gridType = (size: number) => {
    switch (size) {
      case 3:
        return "grid-cols-3";
      case 4:
        return "grid-cols-4";
      case 5:
        return "grid-cols-5";
      case 6:
        return "grid-cols-6";
      case 7:
        return "grid-cols-7";
      case 8:
        return "grid-cols-8";
      case 9:
        return "grid-cols-9";
      case 10:
        return "grid-cols-10";
    }
  };

  function updateInput(id: string, value: string) {
    const updated = validatedData.Cells.map((el) =>
      el.id === id ? { ...el, symbol: value } : el
    );
    setValidatedData({ ...validatedData, Cells: updated });
    onChange(JSON.stringify({ size: validatedData.size, Cells: updated }));
  }

  function updateSize(size: number) {
    setValidatedData((prev) => {
      const updated = {
        size: size,
        Cells: generateCells(prev.Cells, size),
      };

      return updated;
    });

    onChange(
      JSON.stringify({
        size: size,
        Cells: generateCells(validatedData.Cells, size),
      })
    );
    console.log("salem");
  }

  function setDataSize(n: number) {
    setValidatedData((prev) => {
      return { ...prev, size: n };
    });
  }

  return (
    <div className="w-full flex flex-col gap-2 h-auto">
      <div className="flex gap-2">
        <label htmlFor="grid_number" className="font-semibold text-gray-500">
          Размер сетки:
        </label>
        <input
          type="number"
          name="grid_number"
          className="w-10 ring rounded-md text-center text-xl decoration-0"
          max={10}
          min={2}
          value={validatedData.size}
          onInput={(e) => {
            const value = Number(e.currentTarget.value);
            if (value > 10) {
              e.currentTarget.value = "10";
              setDataSize(10);
              updateSize(10);
            } else if (value < 3) {
              e.currentTarget.value = "3";
              setDataSize(3);
              updateSize(3);
            } else {
              setDataSize(value);
              updateSize(value);
            }
          }}
        />
      </div>
      <div className={`grid  gap-1 ${gridType(validatedData.size)}`}>
        {validatedData.Cells.map((el) => {
          return (
            <div key={el.id}>{CreateCell(el.symbol, el.id, updateInput)}</div>
          );
        })}
      </div>
    </div>
  );
}
