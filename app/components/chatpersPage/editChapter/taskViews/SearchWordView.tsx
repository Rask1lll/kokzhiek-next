import { parseData } from "@/app/libs/parseData";
import { useState } from "react";
import { BiPlus } from "react-icons/bi";

type GridData = {
  size: number;
  Cells: Cell[];
};
type Cell = {
  id: string;
  symbol: string;
};

function Cell({ value }: { value: string }) {
  return (
    <div
      key={value}
      className="text-2xl h-full min-h-7 text-center uppercase ring ring-gray-100 "
    >
      {value}
    </div>
  );
}
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

type answer = {
  id: string;
  answer: string;
};
export default function SearchWordView({ value }: { value: string }) {
  const [data] = useState<GridData>(() => {
    const parse = parseData(value) ?? { size: 3, Cells: [] };

    return parse;
  });
  const [answers, setAnswers] = useState<answer[]>([{ id: "0", answer: "" }]);

  function addAnswer(answer: answer) {
    setAnswers((prev) => [...prev, answer]);
  }
  return (
    <>
      <div
        className={`w-full h-full grid ring ring-gray-300 rounded-xl ${gridType(
          data.size
        )}`}
      >
        {data.Cells.map((el, i) => {
          return (
            <div key={i}>
              <Cell value={String(el.symbol)} />
            </div>
          );
        })}
      </div>
      <div className="w-full mt-3">
        <div className="flex flex-col gap-2">
          <p>Слова ответы:</p>
          {answers.map((el, i) => {
            return (
              <div className="flex gap-2 items-center" key={i}>
                <span className="text-xl w-4">{i + 1}.</span>
                <input
                  defaultValue={el.answer}
                  onInput={(e) => {
                    const el = e.currentTarget;
                    el.style.height = el.scrollHeight + "px";
                  }}
                  className="ring ring-gray-300 resize-none max-w-full text-wrap wrap-anywhere p-1 outline-0 rounded-lg w-full"
                />
              </div>
            );
          })}
        </div>

        <div className="w-full mt-5 flex justify-center">
          <button
            onClick={(e) => {
              addAnswer({ id: String(answers.length), answer: "" });
            }}
            className="p-2 py-1 bg-green-300 rounded-xl flex items-center gap-1 font-semibold cursor-pointer"
          >
            Добавить ответ <BiPlus />
          </button>
        </div>
      </div>
    </>
  );
}
