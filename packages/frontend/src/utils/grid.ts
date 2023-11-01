import { Count, Position, SpaceBox } from "@/types";
import { range } from "lodash";

export const splitBox = ({
  box,
  blockSize,
}: {
  box: SpaceBox;
  blockSize: number;
}): {
  boxes: Array<SpaceBox>;
  count: Count;
} => {
  const blocksCountX = Math.floor(box.width / blockSize);
  const blocksCountY = Math.floor(box.height / blockSize);
  const blocksCount = blocksCountX * blocksCountY;

  const blockWidth = box.width / blocksCountX;
  const blockHeight = box.height / blocksCountY;

  const indexes = range(blocksCount);

  return {
    boxes: indexes.map((idx) => ({
      width: blockWidth,
      height: blockHeight,
      x: box.x + blockWidth * (idx % blocksCountX),
      y: box.y + blockHeight * Math.floor(idx / blocksCountX),
    })),
    count: {
      x: blocksCountX,
      y: blocksCountY,
      total: blocksCount,
    },
  };
};

export const isOverSection = (pos: Position, box: SpaceBox) => {
  if (
    pos.x > box.x &&
    pos.x < box.x + box.width &&
    pos.y > box.y &&
    pos.y < box.y + box.height
  ) {
    return true;
  }
  return false;
};

export const getDeepGridPosition = (options: {
  levels: number;
  initialValue: number[];
  position: Position;
  box: SpaceBox;
}) => {
  const { pos } = range(options.levels).reduce<{
    pos: number[];
    box: SpaceBox;
  }>(
    ({ box, pos }) => {
      const { boxes } = splitBox({ box, blockSize: box.height / 2 });

      const matchedIndex = boxes.findIndex((subBox) =>
        isOverSection(options.position, subBox)
      );

      if (matchedIndex !== -1) {
        return {
          pos: [...pos, matchedIndex],
          box: boxes[matchedIndex],
        };
      }

      return {
        pos,
        box,
      };
    },
    {
      pos: [],
      box: options.box,
    }
  );

  if (!pos.length) {
    pos.push(...options.initialValue);
  } else {
    const lengthDiff = options.levels - pos.length;
    pos.push(...Array.from({ length: lengthDiff }, () => 0));
  }

  return pos;
};
