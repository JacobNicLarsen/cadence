import { useCallback, useEffect, useRef, useState } from 'react';

type UseTimerOptions = {
  duration: number;
  onComplete: () => void;
};

export const useTimer = ({ duration, onComplete }: UseTimerOptions) => {
  const [remaining, setRemaining] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);

  onCompleteRef.current = onComplete;

  const clear = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const start = useCallback(() => {
    setIsRunning(true);
    setEpoch((e) => e + 1);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
    clear();
  }, []);

  const reset = useCallback(
    (newDuration?: number) => {
      clear();
      setRemaining(newDuration ?? duration);
      setIsRunning(false);
    },
    [duration],
  );

  useEffect(() => {
    if (!isRunning) {
      clear();
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clear();
          setIsRunning(false);
          setTimeout(() => onCompleteRef.current(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clear;
  }, [isRunning, epoch]);

  useEffect(() => {
    return clear;
  }, []);

  return { remaining, isRunning, start, pause, reset };
};
