import {
  ReactNode,
  useMemo,
  useState,
  type MouseEvent as ReactMouseEvent,
  useEffect,
} from "react";

import "./grid.scss";
import { as, splitBox } from "@/utils";
import { Count, SpaceBox } from "@/types";

type Props = {
  width: number;
  height: number;
  children: (options: {
    blockSize: number;
    count: Count;
    boxes: Array<SpaceBox>;
  }) => ReactNode[];
  callbackRef?: (el: HTMLDivElement | null) => void;
  onMouseMove?: (e: ReactMouseEvent<HTMLDivElement, MouseEvent>) => void;
};

export function Grid({ width, height, callbackRef, children, onMouseMove }: Props) {
  const [gridEl, setGridEl] = useState<HTMLDivElement | null>(null);

  const blockSize = useMemo(() => height / 2, [height]);
  const { count, boxes } = useMemo(() => {
    let x = 0;
    let y = 0;

    if (gridEl) {
      const { left, top } = gridEl.getBoundingClientRect();
      x = left;
      y = top;
    }

    return splitBox({
      box: {
        width,
        height,
        x,
        y,
      },
      blockSize,
    });
  }, [blockSize, width, height, gridEl]);

  useEffect(() => {
    callbackRef?.(gridEl);
  }, [callbackRef, gridEl])

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: Array.from({ length: count.x }, () => "1fr").join(
          " "
        ),
        gridTemplateRows: Array.from({ length: count.y }, () => "1fr").join(
          " "
        ),
        width: as.px(blockSize * count.x),
        height: as.px(blockSize * count.y),
      }}
      onMouseMove={onMouseMove}
      ref={setGridEl}
    >
      {children({
        blockSize,
        boxes,
        count,
      }).slice(0, count.total)}
    </div>
  );
}
