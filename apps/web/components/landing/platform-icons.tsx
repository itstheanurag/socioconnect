import React from "react";

export interface PlatformIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
  title?: string;
}

export function YouTubeIcon({
  className = "h-4 w-4",
  size = 16,
  title,
  ...props
}: PlatformIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden={!title}
      {...props}
    >
      {title && <title>{title}</title>}
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export function TwitchIcon({
  className = "h-4 w-4",
  size = 16,
  title,
  ...props
}: PlatformIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden={!title}
      {...props}
    >
      {title && <title>{title}</title>}
      <path d="M2.149 0L.537 4.119v16.836h5.731V24h3.224l3.045-3.045h4.657l6.269-6.269V0H2.149zm19.164 13.612l-3.582 3.582H12l-3.045 3.045v-3.045H4.836V2.149h16.478v11.463zm-8.239-6.448h2.149v6.09h-2.149V7.164zm-5.015 0h2.149v6.09H8.06V7.164z" />
    </svg>
  );
}

export function InstagramIcon({
  className = "h-4 w-4",
  size = 16,
  title,
  ...props
}: PlatformIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={!title}
      {...props}
    >
      {title && <title>{title}</title>}
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export function XTwitterIcon({
  className = "h-4 w-4",
  size = 16,
  title,
  ...props
}: PlatformIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden={!title}
      {...props}
    >
      {title && <title>{title}</title>}
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function LinkedInIcon({
  className = "h-4 w-4",
  size = 16,
  title,
  ...props
}: PlatformIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden={!title}
      {...props}
    >
      {title && <title>{title}</title>}
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

export function RedditIcon({
  className = "h-4 w-4",
  size = 16,
  title,
  ...props
}: PlatformIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden={!title}
      {...props}
    >
      {title && <title>{title}</title>}
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.703zM9.25 12C8.56 12 8 12.56 8 13.25c0 .688.56 1.25 1.25 1.25.688 0 1.25-.562 1.25-1.25 0-.69-.562-1.25-1.25-1.25zm5.5 0c-.688 0-1.25.56-1.25 1.25 0 .688.562 1.25 1.25 1.25.69 0 1.25-.562 1.25-1.25 0-.69-.56-1.25-1.25-1.25zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.197-2.512-.73a.326.326 0 0 0-.232-.095z" />
    </svg>
  );
}

export function PeerlistIcon({
  className = "h-4 w-4",
  size = 16,
  title,
  ...props
}: PlatformIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden={!title}
      {...props}
    >
      {title && <title>{title}</title>}
      <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm-1.5 5h3c2.485 0 4.5 2.015 4.5 4.5S15.985 16 13.5 16h-3v3H8V7h2.5zm0 2.5v4h3c1.105 0 2-.895 2-2s-.895-2-2-2h-3z" />
    </svg>
  );
}

export function BlueskyIcon({
  className = "h-4 w-4",
  size = 16,
  title,
  ...props
}: PlatformIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden={!title}
      {...props}
    >
      {title && <title>{title}</title>}
      <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.002 2.503-4.475 7.42 2.378 4.628 8.04 1.34 9.468-1.597 1.428 2.937 7.09 6.225 9.468 1.597 2.527-4.917-.563-6.84-4.475-7.42-.139-.016-.277-.034-.415-.056.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.479 0-.687-.139-1.86-.902-2.203-.659-.299-1.664-.621-4.3 1.24C16.046 4.747 13.087 8.686 12 10.8z" />
    </svg>
  );
}

export function PlatformIcon({
  platform,
  className = "h-4 w-4",
  size = 16,
  title,
}: {
  platform: string;
  className?: string;
  size?: number;
  title?: string;
}) {
  switch (platform.toLowerCase()) {
    case "youtube":
      return <YouTubeIcon className={`text-[#FF0000] ${className}`} size={size} title={title} />;
    case "twitch":
      return <TwitchIcon className={`text-[#9146FF] ${className}`} size={size} title={title} />;
    case "instagram":
      return <InstagramIcon className={`text-[#E1306C] ${className}`} size={size} title={title} />;
    case "x":
    case "twitter":
      return <XTwitterIcon className={`text-stone-900 ${className}`} size={size} title={title} />;
    case "linkedin":
      return <LinkedInIcon className={`text-[#0A66C2] ${className}`} size={size} title={title} />;
    case "reddit":
      return <RedditIcon className={`text-[#FF4500] ${className}`} size={size} title={title} />;
    case "peerlist":
      return <PeerlistIcon className={`text-[#00AA45] ${className}`} size={size} title={title} />;
    case "bluesky":
      return <BlueskyIcon className={`text-[#0285FF] ${className}`} size={size} title={title} />;
    default:
      return null;
  }
}
