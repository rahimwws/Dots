import React from "react";
import { Svg, Path, SvgProps } from "react-native-svg";

interface ProgressUpProps extends SvgProps {
  size?: number;
  color?: string;
}

export const ProgressUp: React.FC<ProgressUpProps> = ({
  size = 24,
  color = "#171717",
  ...props
}) => {
  return (
    <Svg width={size} height={size} fill="none" viewBox="0 0 24 24" {...props}>
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="m16.5 9.5-4.2 4.2-1.6-2.4-3.2 3.2"
      />
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M14.5 9.5h2v2"
      />
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M9 22h6c5 0 7-2 7-7V9c0-5-2-7-7-7H9C4 2 2 4 2 9v6c0 5 2 7 7 7Z"
      />
    </Svg>
  );
};
