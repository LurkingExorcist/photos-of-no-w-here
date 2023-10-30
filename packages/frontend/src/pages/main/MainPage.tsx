import { Block, Grid } from "@/components";
import { useWindowBox } from "@/hooks";
import { useCallback, useState, MouseEvent } from "react";
import "./main-page.scss";
import { range } from "lodash";
import { PerlinNoise } from "@/lib";
import { Box, HSL, SpaceBox } from "@/types";
import { as, isOverSection, splitBox } from "@/utils";
import { AnimatePresence, motion } from "framer-motion";
import { hslGenerators } from "@/utils/hsl-generators";

const SEED = Math.random();
const LEVELS = 3;
const INITIAL_LEVEL = 0;

PerlinNoise.seed(SEED);

export function MainPage() {
  const { windowHeight, windowWidth } = useWindowBox();
  const [currentPos, setCurrentPos] = useState(range(LEVELS).fill(0));

  const onBlockHover = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      const { left, top, width, height } =
        e.currentTarget.getBoundingClientRect();
      const { clientX, clientY } = e;

      const { pos } = range(LEVELS).reduce<{
        pos: number[];
        box: SpaceBox;
      }>(
        ({ box, pos }) => {
          const { boxes } = splitBox({ box, blockSize: box.height / 2 });

          const matchedIndex = boxes.findIndex((subBox) =>
            isOverSection({ x: clientX, y: clientY }, subBox)
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
          box: {
            x: left,
            y: top,
            width,
            height,
          },
        }
      );

      if (!pos.length) {
        pos.push(...currentPos);
      } else {
        const lengthDiff = LEVELS - pos.length;
        pos.push(...Array.from({ length: lengthDiff }, () => 0));
      }

      setCurrentPos(pos);
    },
    [currentPos]
  );

  const renderGrid = useCallback(
    (options: { level: number } & Box & Partial<HSL>) => (
      <Grid
        width={options.width}
        height={options.height}
        onMouseMove={options.level === INITIAL_LEVEL ? onBlockHover : undefined}
      >
        {({ blockSize, boxes, count }) => {
          return boxes.map((currentBox, idx) => {
            const hsl = hslGenerators.angleBased({
              idx,
              currentBox,
              boxes,
              count,
              hue: options.hue,
            });
            // const hsl = hslGenerators.hueMapBased({
            //   idx,
            //   currentBox,
            //   count,
            //   hue: options.hue ?? SEED * 360,
            // });

            return (
              <div className="main-page__cell" key={idx}>
                <AnimatePresence>
                  <motion.div
                    className="main-page__motion"
                    key={idx === currentPos[options.level] ? "grid" : "block"}
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
                    {idx === currentPos[options.level] ? (
                      renderGrid({
                        width: blockSize,
                        height: blockSize,
                        level: options.level + 1,
                        ...hsl,
                      })
                    ) : (
                      <Block key={idx} blockSize={blockSize} {...hsl} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            );
          });
        }}
      </Grid>
    ),
    [currentPos, onBlockHover]
  );

  return (
    <div className="main-page">
      {renderGrid({
        width: windowWidth,
        height: windowHeight,
        level: INITIAL_LEVEL,
      })}
    </div>
  );
}
