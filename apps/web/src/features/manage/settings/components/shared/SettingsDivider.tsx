interface SettingsDividerProps {
  className?: string;
}

export function SettingsDivider({ className = '' }: SettingsDividerProps) {
  return <hr className={`border-gray-100 my-8 ${className}`} />;
}
