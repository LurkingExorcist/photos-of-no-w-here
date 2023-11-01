import {  Count, HSL, SpaceBox,  } from "@/types";
import { isNil, thru } from "lodash";
import { splitBox } from ".";
import { PerlinNoise } from "@/lib";
import { generateHueMap } from "./hue-map";

export const hslGenerators = {
  angleBased: ({
    idx,
    currentBox,
    boxes,
    count,
    hue,
  }: {
    idx: number;
    currentBox: SpaceBox;
    boxes: Array<SpaceBox>;
    count: Count;
    hue?: number;
  }): HSL => {
    const middleIndex = Math.floor(boxes.length / 2);
    const mirroredIndex =
      Math.floor(idx / middleIndex) >= 1
        ? boxes.length - (idx % middleIndex)
        : idx % middleIndex;

    return {
      hue: !isNil(hue)
        ? hue + mirroredIndex
        : Math.floor((360 / count.total) * (mirroredIndex + 1)),
      saturation: 40,
      lightness: thru(
        splitBox({
          box: currentBox,
          blockSize: currentBox.height / 2,
        }),
        ({ boxes, count }) =>
          boxes.reduce(
            (acc, subBox) =>
              acc +
              PerlinNoise.simplex2(subBox.x, subBox.y, {
                scale: 0.0005,
                offset: 0,
              }) /
                count.total,
            0
          ) * 100
      ),
    };
  },
  hueMapBased: ({idx, currentBox, count, hue, zValue}: {
    idx: number;
    currentBox: SpaceBox;
    count: Count;
    hue: number;
    zValue: number;
  }) => {
    const map = generateHueMap({count, initialValue: hue}).flat();

    return {
      hue: map[idx],
      saturation: thru(
        splitBox({
          box: currentBox,
          blockSize: currentBox.height / 2,
        }),
        ({ boxes, count }) =>
          boxes.reduce(
            (acc, subBox) =>
              acc +
              PerlinNoise.simplex3(subBox.x, subBox.y, zValue, {
                scale: 0.001,
                offset: 1000,
              }) /
                count.total,
            0
          ) * 100
      ),
      lightness: thru(
        splitBox({
          box: currentBox,
          blockSize: currentBox.height / 2,
        }),
        ({ boxes, count }) =>
          boxes.reduce(
            (acc, subBox) =>
              acc +
              PerlinNoise.simplex3(subBox.x, subBox.y, zValue, {
                scale: 0.0005,
                offset: 0,
              }) /
                count.total,
            0
          ) * 100
      ),
    };
  }
};
