import { useCallback, useState } from 'react';

type StateUpdater<T> = T | ((prev: T) => T);

const shallowEqual = <T extends object>(a: T, b: T) => {
  const aKeys = Object.keys(a) as (keyof T)[];
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) {
    return false;
  }
  for (const key of aKeys) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) {
      return false;
    }
    if (!Object.is(a[key], (b as Record<keyof T, unknown>)[key])) {
      return false;
    }
  }
  return true;
};

export const useStableState = <T extends object>(initialState: T): [T, (value: StateUpdater<T>) => void] => {
  const [state, setState] = useState<T>(initialState);

  const setStableState = useCallback(
    (value: StateUpdater<T>) => {
      setState((prev) => {
        const next = typeof value === 'function' ? (value as (prevState: T) => T)(prev) : value;
        return shallowEqual(prev, next) ? prev : next;
      });
    },
    [setState]
  );

  return [state, setStableState];
};


