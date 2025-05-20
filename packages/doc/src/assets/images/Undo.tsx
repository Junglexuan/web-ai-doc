export default function AiIcon(props: {className?: string; onClick?: () => void}): JSX.Element {
  return (
    <span {...props}>
      <svg fill="currentColor" version="1.1" width="1em" height="1em" viewBox="0 0 1024 1024">
        <path d="M512 64A510.272 510.272 0 0 0 149.984 213.984L0.032 64v384h384L240.512 304.48A382.784 382.784 0 0 1 512.032 192c212.064 0 384 171.936 384 384 0 114.688-50.304 217.632-130.016 288l84.672 96a510.72 510.72 0 0 0 173.344-384c0-282.784-229.216-512-512-512z"></path>
      </svg>
    </span>
  );
}
