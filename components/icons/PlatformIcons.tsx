type IconProps = { size?: number; className?: string };

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
