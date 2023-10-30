import { useCallback, useEffect, useState } from "react";

type WindowBox = {
  windowHeight: number;
  windowWidth: number;
};

export const useWindowBox = () => {
  const [box, setBox] = useState<WindowBox>({
    windowHeight: window.innerHeight,
    windowWidth: window.innerWidth,
  });

  const onResize = useCallback(() => {
    setBox({
      windowHeight: window.innerHeight,
      windowWidth: window.innerWidth,
    });
  }, []);

  useEffect(() => {
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [onResize]);

  return box;
};
