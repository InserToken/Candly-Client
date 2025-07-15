"use client";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import ChangingProgressProvider from "./ChangingProgressProvider";

interface Props {
  value: number;
  pathColor?: string;
  trailColor?: string;
  textColor?: string;
}

export default function CircularProgressChart({
  value,
  pathColor = "#5F81FF",
  trailColor = "#3D3D3D",
  textColor = "#F4F4F4",
}: Props) {
  return (
    <div style={{ width: 120, height: 120 }}>
      <ChangingProgressProvider values={[0, value]}>
        {(percentage) => (
          <CircularProgressbar
            value={percentage}
            text={`${percentage}%`}
            strokeWidth={10}
            styles={buildStyles({
              pathColor,
              trailColor,
              textColor,
            })}
          />
        )}
      </ChangingProgressProvider>
    </div>
  );
}
