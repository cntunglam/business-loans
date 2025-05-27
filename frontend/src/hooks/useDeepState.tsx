import _ from "lodash";
import { useState } from "react";

export const useDeepState = <T,>(
  initialState: Partial<T>
): [Partial<T>, (newState: Partial<T>) => void, () => void] => {
  const [state, setState] = useState<Partial<T>>(initialState);
  const setDeepState = (newState: Partial<T>) => {
    setState((prevState) => {
      const nextState = { ...prevState };
      _.merge(nextState, newState);
      return nextState;
    });
  };
  const clearState = () => setState(initialState);

  return [state, setDeepState, clearState];
};
