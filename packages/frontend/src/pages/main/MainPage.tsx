import { Block, Grid } from "@/components";
import { useWindowBox } from "@/hooks";
import { useCallback, useState, useEffect } from "react";
import "./main-page.scss";
import { range } from "lodash";
import { PerlinNoise } from "@/lib";
import { Box, HSL } from "@/types";
import { as } from "@/utils";
import { AnimatePresence, motion } from "framer-motion";
import { hslGenerators } from "@/utils/hsl-generators";
import clsx from "clsx";

const SEED = Math.random();
const LEVELS = 3;
const INITIAL_LEVEL = 0;

PerlinNoise.seed(SEED);

export function MainPage() {
  const { windowHeight, windowWidth } = useWindowBox();
  const [deepPosition] = useState(range(LEVELS).fill(0));
  const [counter, setCounter] = useState(0);
  const [hashMap] = useState<Record<string, number>>({});

  // const onBlockHover = useCallback(
  //   (e: MouseEvent<HTMLDivElement>) => {
  //     const { left, top, width, height } =
  //       e.currentTarget.getBoundingClientRect();
  //     const { clientX, clientY } = e;

  //     setDeepPosition(
  //       getDeepGridPosition({
  //         levels: LEVELS,
  //         box: { x: left, y: top, width, height },
  //         initialValue: deepPosition,
  //         position: { x: clientX, y: clientY },
  //       })
  //     );
  //   },
  //   [deepPosition]
  // );

  // useEffect(() => {
  //   const pos = range(LEVELS)
  //     .map((idx) => {
  //       const newIdx = Math.floor(counter / Math.pow(4, idx)) % 4;

  //       return newIdx;
  //     })
  //     .reverse();
  //   setDeepPosition(pos);
  // }, [counter]);

  useEffect(() => {
    setInterval(() => {
      setCounter((val) => val + 1);
    }, 1000);
  }, []);

  // const onImageChange = useCallback(
  //   (options: { currentDeepPosition: number[]; level: number }) =>
  //     (hash: number) => {
  //       if (options.level < LEVELS) return;

  //       setHashMap((hm) => ({
  //         ...hm,
  //         [options.currentDeepPosition.join("")]: hash,
  //       }));
  //     },
  //   []
  // );

  const renderGrid = useCallback(
    (
      options: { level: number; currentDeepPosition: number[] } & Box &
        Partial<HSL>
    ) => (
      <Grid width={options.width} height={options.height}>
        {({ blockSize, boxes, count }) => {
          return boxes.map((currentBox, idx) => {
            const hsl = hslGenerators.hueMapBased({
              idx,
              currentBox,
              count,
              hue: options.hue ?? SEED * 360,
              zValue: counter * 10,
            });

            const isShowGrid = options.level < LEVELS - 1;

            return (
              <div className="main-page__cell" key={idx}>
                <AnimatePresence>
                  <motion.div
                    className="main-page__motion"
                    key={clsx(
                      isShowGrid ? "grid" : "block",
                      hashMap[options.currentDeepPosition.join("")]
                    )}
                    initial={{
                      opacity: 0,
                      transform: "rotate3d(1, 0, 0, 90deg)",
                    }}
                    animate={{
                      opacity: 1,
                      transform: "rotate3d(1, 0, 0, 0deg)",
                    }}
                    exit={{
                      opacity: 0,
                      transform: `
                        rotate3d(1, 0, 0, 90deg)
                        translate3d(0, 0, ${as.px(-blockSize)})
                      `,
                    }}
                  >
                    {isShowGrid ? (
                      renderGrid({
                        currentDeepPosition: [
                          ...options.currentDeepPosition,
                          idx,
                        ],
                        width: blockSize,
                        height: blockSize,
                        level: options.level + 1,
                        ...hsl,
                      })
                    ) : (
                      <Block
                        key={idx}
                        blockSize={blockSize}
                        isActive={
                          options.level === LEVELS - 1 &&
                          idx === deepPosition[deepPosition.length - 1]
                        }
                        // onImageChange={onImageChange({
                        //   currentDeepPosition: options.currentDeepPosition,
                        //   level: options.level
                        // })}
                        {...hsl}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            );
          });
        }}
      </Grid>
    ),
    [deepPosition, counter, hashMap]
  );

  return (
    <div className="main-page">
      {renderGrid({
        width: windowWidth,
        height: windowHeight,
        level: INITIAL_LEVEL,
        currentDeepPosition: [],
      })}
    </div>
  );
}
