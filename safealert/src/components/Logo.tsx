export function Logo({ size = 28 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2 font-extrabold tracking-tight">
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 2 3 6v6c0 5.25 3.75 9.75 9 10 5.25-.25 9-4.75 9-10V6l-9-4Z"
          fill="#dc2626"
        />
        <path d="M12 7v6" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="16.2" r="1.1" fill="white" />
      </svg>
      <span>SafeAlert</span>
    </div>
  );
}
