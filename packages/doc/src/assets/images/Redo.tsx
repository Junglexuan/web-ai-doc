export default function AiIcon(props: {className?: string; onClick?: () => void}): JSX.Element {
  return (
    <span {...props}>
      <svg fill="currentColor" version="1.1" width="1em" height="1em" viewBox="0 0 1024 1024">
        <path d="M0.00032 576a510.72 510.72 0 0 0 173.344 384l84.672-96A383.136 383.136 0 0 1 128.00032 576C128.00032 363.936 299.93632 192 512.00032 192c106.048 0 202.048 42.976 271.52 112.48L640.00032 448h384V64l-149.984 149.984A510.272 510.272 0 0 0 512.00032 64C229.21632 64 0.00032 293.216 0.00032 576z"></path>
      </svg>
    </span>
  );
}
