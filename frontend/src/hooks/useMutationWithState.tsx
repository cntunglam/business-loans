import { MutationFunction, useMutation } from "@tanstack/react-query";
import { useDeepState } from "./useDeepState";

export const useMutationWithState = <T extends object>(mutationFn: MutationFunction) => {
  const [state, setState] = useDeepState<T>({});
  const clearState = () => setState({});
  const mutation = useMutation({
    mutationFn: () => mutationFn(state).then(() => clearState()),
  });
  return { mutation, state, setState, clearState };
};
