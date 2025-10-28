type Props = {
  size?: number;
  bull?: string;
  arrow?: string;
  className?: string;
};

export default function MacroDashIcon({
  size = 36,
  bull = "#E2E8F0",
  arrow = "#22C55E",
  className,
}: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="MacroDash"
      className={className}
      preserveAspectRatio="xMidYMid meet"
      shapeRendering="geometricPrecision"
    >
      {/* --- BACKGROUND: chart arrow (NE breakout) --- */}
      <path
        d="M2.5 16.5 L7.5 11.5 L10.8 14.8 L16.4 9.2"
        fill="none"
        stroke={arrow}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.2 7.8h4v4h-2V10l-2.6 2.6-1.4-1.4L17.8 9h-0.6V7.8Z"
        fill={arrow}
      />

      {/* --- FOREGROUND: side-profile bull head with two horns --- */}
      {/* Uses evenodd to cut the eye hole out of the silhouette */}
      <path
        fill={bull}
        fillRule="evenodd"
        d="
          M5.6,7.7
          C4.9,7.0 4.3,6.0 4.2,5.2
          C4.1,4.7 4.5,4.4 5.0,4.6
          C5.9,5.0 6.9,5.7 7.8,6.6
          L8.3,7.1

          C9.3,6.0 10.8,5.3 12.4,5.3
          C13.3,5.3 14.2,5.5 15.0,5.9
          C15.3,6.0 15.5,6.4 15.4,6.7
          C15.2,7.6 14.9,8.3 14.5,9.1

          C15.8,8.9 17.0,9.1 18.2,9.8
          C18.5,9.9 18.6,10.3 18.5,10.6
          C18.1,11.5 17.5,12.2 16.7,12.8

          C17.3,13.8 17.6,15.0 17.6,16.2
          C17.6,18.5 16.6,20.4 14.9,21.8
          C13.0,23.4 10.2,23.7 8.0,22.8
          C5.8,21.9 4.1,20.1 3.6,17.9
          C3.2,16.3 3.5,14.7 4.4,13.2

          C3.8,13.0 3.3,12.7 2.9,12.4
          C2.3,12.0 2.0,11.2 2.2,10.6
          C2.4,10.0 3.0,9.8 3.5,10.1
          C4.3,10.5 5.2,11.2 6.0,12.0

          C6.5,10.9 7.5,9.6 8.8,8.7

          C8.6,8.4 8.2,8.0 7.8,7.7
          C7.2,7.2 6.4,7.1 5.6,7.7
          Z

          M11.7,13.9
          a 1.4 1.4 0 1 1 -2.8 0
          a 1.4 1.4 0 1 1  2.8 0
        "
      />

      {/* forward horn */}
      <path
        d="
          M13.2 6.0
          c 0.9 -0.3 1.9 -0.2 3.0 0.4
          c 0.3 0.2 0.4 0.6 0.2 0.9
          c -0.3 0.5 -0.6 0.9 -1.0 1.2
          c -0.8 -0.4 -1.7 -0.6 -2.6 -0.6
          c 0.2 -0.6 0.3 -1.2 0.4 -1.9
          Z"
        fill={bull}
      />

      {/* rear horn */}
      <path
        d="
          M7.1 6.1
          c -0.7 -0.7 -1.5 -1.3 -2.4 -1.8
          c -0.5 -0.3 -1.1 0.1 -1.0 0.6
          c 0.2 0.9 0.7 1.8 1.4 2.4
          c 0.7 -0.3 1.3 -0.6 2.0 -1.2
          Z"
        fill={bull}
      />

      {/* ear */}
      <path
        d="
          M6.4 8.1
          c -0.7 -0.1 -1.3 0.2 -1.8 0.7
          c 0.6 0.5 1.2 1.0 1.7 1.6
          c 0.4 -0.7 0.9 -1.3 1.5 -1.8
          c -0.4 -0.3 -0.9 -0.4 -1.4 -0.5
          Z"
        fill={bull}
      />
    </svg>
  );
}
