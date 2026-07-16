type IconProps = { size?: number; className?: string };

export function FacebookIcon({ size = 22, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="48" height="48" rx="10" fill="#1877F2" />
      <path
        d="M27.5 24.5h-3.2V38h-5.5V24.5H16.5V19.6h2.3v-2.7c0-3.15 1.5-5.9 6.1-5.9h4v4.6h-2.6c-1.05 0-1.4.5-1.4 1.5v2.5h4l-.4 4.9Z"
        fill="#fff"
      />
    </svg>
  );
}

export function ZaloIcon({ size = 22, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="48" height="48" rx="10" fill="#0068FF" />
      <path
        d="M14 27.5c0-6.35 4.9-11.3 10.9-11.3 5.55 0 10.15 4.3 10.75 9.85.06.5.1 1 .1 1.5 0 6.35-4.9 11.3-10.9 11.3-1.75 0-3.4-.4-4.85-1.15L14 39l1.6-5.35c-1-1.75-1.6-3.85-1.6-6.15Z"
        fill="#fff"
      />
      <text x="24" y="29.5" textAnchor="middle" fontSize="10" fontWeight="800" fontFamily="Arial, sans-serif" fill="#0068FF">
        Zalo
      </text>
    </svg>
  );
}

export function YoutubeIcon({ size = 22, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="48" height="48" rx="10" fill="#FF0000" />
      <path d="M20 17.5v13l11.5-6.5L20 17.5Z" fill="#fff" />
    </svg>
  );
}

export function InstagramIcon({ size = 22, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="ig-grad" x1="0" y1="48" x2="48" y2="0">
          <stop offset="0" stopColor="#FEE411" />
          <stop offset="0.3" stopColor="#F0090C" />
          <stop offset="0.65" stopColor="#CD1BCF" />
          <stop offset="1" stopColor="#6228D7" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="10" fill="url(#ig-grad)" />
      <rect x="13" y="13" width="22" height="22" rx="7" stroke="#fff" strokeWidth="2.4" fill="none" />
      <circle cx="24" cy="24" r="6" stroke="#fff" strokeWidth="2.4" fill="none" />
      <circle cx="31.5" cy="16.5" r="1.6" fill="#fff" />
    </svg>
  );
}

export function ThreadsIcon({ size = 22, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="48" height="48" rx="10" fill="#000000" />
      <path
        d="M24 12c-7 0-11 4.6-11 12s4 12 11 12c5.4 0 8.7-2.6 9.6-6.9.4-1.9-.6-3.3-2.1-3.7-1.3-.4-2.6.2-3.1 1.6-.5 1.5-1.8 2.6-4 2.6-3.1 0-4.7-2-4.9-4.6 3.4-.2 6-.9 7.6-2.1 1.8-1.3 2.5-3.2 1.9-5.3-.7-2.5-3.1-4-6.4-4-3.9 0-6.9 2-7.9 5.5"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function ShopeeIcon({ size = 22, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M10 16.5C10 14.567 11.567 13 13.5 13h21c1.933 0 3.5 1.567 3.5 3.5V37a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4V16.5Z"
        fill="#EE4D2D"
      />
      <path
        d="M17 16v-2.5a7 7 0 1 1 14 0V16"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M18.5 24.5c0 1.9 1.79 2.6 4.2 3.3 3 .9 6.3 1.9 6.3 5.4 0 2.9-2.55 4.8-6.13 4.8-2.66 0-4.98-.98-6.37-2.66"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GoogleIcon({ size = 22, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5Z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6 29.6 4 24 4c-7.4 0-13.8 4.2-17.1 10.4Z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.5 0 10.5-2.1 14.3-5.6l-6.6-5.6C29.7 34.5 27 35.5 24 35.5c-5.2 0-9.6-3.3-11.3-7.9l-6.6 5C9.1 39.6 16 44 24 44Z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.6 5.6C41.6 36.5 44 30.7 44 24c0-1.3-.1-2.7-.4-3.5Z"
      />
    </svg>
  );
}

export function TiktokIcon({ size = 22, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="48" height="48" rx="10" fill="#000000" />
      <path
        d="M29.5 9h-4.6v20.6c0 2.3-1.86 4.17-4.15 4.17a4.16 4.16 0 0 1-4.15-4.17c0-2.3 1.86-4.16 4.15-4.16.4 0 .78.06 1.15.17v-4.7a8.9 8.9 0 0 0-1.15-.08c-4.85 0-8.79 3.96-8.79 8.85s3.94 8.85 8.79 8.85 8.79-3.96 8.79-8.85V18.2a11.1 11.1 0 0 0 6.46 2.06v-4.63c-2.99-.08-5.6-1.62-7.2-3.98A8.7 8.7 0 0 1 29.5 9Z"
        fill="#FE2C55"
      />
      <path
        d="M28.4 8h-4.6v20.6c0 2.3-1.86 4.17-4.15 4.17a4.16 4.16 0 0 1-4.15-4.17c0-2.3 1.86-4.16 4.15-4.16.4 0 .78.06 1.15.17v-4.7a8.9 8.9 0 0 0-1.15-.08c-4.85 0-8.79 3.96-8.79 8.85s3.94 8.85 8.79 8.85 8.79-3.96 8.79-8.85V17.2a11.1 11.1 0 0 0 6.46 2.06v-4.63c-2.99-.08-5.6-1.62-7.2-3.98A8.7 8.7 0 0 1 28.4 8Z"
        fill="#25F4EE"
      />
      <path
        d="M28.95 8.5h-4.6v20.6c0 2.3-1.86 4.17-4.15 4.17a4.16 4.16 0 0 1-4.15-4.17c0-2.3 1.86-4.16 4.15-4.16.4 0 .78.06 1.15.17v-4.7a8.9 8.9 0 0 0-1.15-.08c-4.85 0-8.79 3.96-8.79 8.85s3.94 8.85 8.79 8.85 8.79-3.96 8.79-8.85V17.7a11.1 11.1 0 0 0 6.46 2.06v-4.63c-2.99-.08-5.6-1.62-7.2-3.98A8.7 8.7 0 0 1 28.95 8.5Z"
        fill="#fff"
      />
    </svg>
  );
}
