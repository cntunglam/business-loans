import { differenceInSeconds } from "date-fns";
import { FC, useEffect, useState } from "react";

interface Props {
  endDate: Date;
  onEnd: () => void;
}
export const Countdown: FC<Props> = ({ endDate, onEnd }) => {
  const [value, setValue] = useState(differenceInSeconds(endDate, new Date()));

  useEffect(() => {
    const interval = setInterval(() => {
      setValue(differenceInSeconds(endDate, new Date()));
      if (value <= 0) {
        clearInterval(interval);
        onEnd();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [endDate, onEnd, value]);

  return value;
};
