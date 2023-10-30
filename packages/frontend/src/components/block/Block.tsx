import { MouseEventHandler } from "react";
import { PropsWithClassName } from "@/types";
import { as } from "@/utils";

import "./block.scss";
import clsx from "clsx";
import { isNil } from "lodash";

type Props = {
  blockSize: number;
  hue?: number;
  saturation?: number;
  lightness?: number;
  onHover?: MouseEventHandler<HTMLDivElement>;
} & PropsWithClassName;

export function Block({
  className,
  hue,
  saturation,
  lightness,
  blockSize,
  onHover,
}: Props) {
  return (
    <div
      className={clsx("block", className)}
      style={{
        "--block-hue": hue,
        "--block-saturation": !isNil(saturation)
          ? as.percent(saturation)
          : undefined,
        "--block-lightness": !isNil(lightness)
          ? as.percent(lightness)
          : undefined,
        width: as.px(blockSize),
        height: as.px(blockSize),
      }}
      onMouseOver={onHover}
    ></div>
  );
}
