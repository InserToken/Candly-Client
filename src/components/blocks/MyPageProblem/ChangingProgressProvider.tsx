import { useState, useEffect, ReactNode } from "react";

interface Props {
  interval?: number;
  values: number[];
  children: (value: number) => ReactNode;
}

const ChangingProgressProvider = ({
  interval = 500,
  values,
  children,
}: Props) => {
  const [valuesIndex, setValuesIndex] = useState(0);

  useEffect(() => {
    if (values.length <= 1) return;

    const timeoutId = setTimeout(() => {
      setValuesIndex(1);
    }, interval);

    return () => clearTimeout(timeoutId);
  }, [interval, values.length]);

  return <>{children(values[valuesIndex])}</>;
};

export default ChangingProgressProvider;
