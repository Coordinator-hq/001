import React from 'react';

interface TwitterVerifiedBadgeProps {
  className?: string;
  size?: number | string;
  title?: string;
}

/**
 * Authentic Twitter/X Verified Checkmark Badge
 * Scalloped 12-point rosette in Twitter verification blue (#1D9BF0)
 * with a solid white center checkmark.
 */
export const TwitterVerifiedBadge: React.FC<TwitterVerifiedBadgeProps> = ({
  className = 'w-4 h-4',
  size,
  title = 'Verified Figure'
}) => {
  return (
    <svg
      viewBox="0 0 22 22"
      aria-label={title}
      role="img"
      className={`inline-block shrink-0 select-none align-middle ${className}`}
      style={size ? { width: size, height: size } : undefined}
    >
      <title>{title}</title>
      <g>
        {/* Twitter Blue 12-lobed Rosette Badge */}
        <path
          fill="#1D9BF0"
          d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.887-1.692-.45-.474-1.02-.803-1.65-.953-.633-.15-1.293-.119-1.91.092-.306-.57-.775-1.037-1.353-1.344-.577-.306-1.23-.443-1.888-.394-.658.049-1.285.285-1.808.68-.522.395-.916.928-1.137 1.536-.628-.182-1.297-.183-1.926-.002-.628.18-1.194.536-1.63 1.026-.436.49-.714 1.094-.803 1.74-.088.647.014 1.306.295 1.902-.564.303-1.03.774-1.34 1.356-.309.581-.444 1.24-.39 1.901.053.66.297 1.29.702 1.812.404.522.946.91 1.56 1.121-.15.637-.113 1.306.106 1.924.22.617.614 1.164 1.134 1.572.52.408 1.144.664 1.794.737.65.073 1.306-.045 1.886-.341.34.55.823.992 1.393 1.274.57.282 1.212.399 1.85.337.638-.063 1.245-.308 1.748-.707.504-.4 1.018-.741 1.545-.994.613.197 1.272.213 1.895.045.624-.168 1.189-.512 1.628-.992.44-.48.726-1.077.824-1.717.098-.64.004-1.295-.27-1.89.576-.289 1.055-.745 1.38-1.314.324-.57.472-1.226.425-1.887z"
        />
        {/* Pure White Crisp Center Checkmark */}
        <path
          fill="#FFFFFF"
          d="M9.684 15.808l-3.73-3.73 1.414-1.414 2.316 2.316 5.684-5.684 1.414 1.414-7.098 7.098z"
        />
      </g>
    </svg>
  );
};
