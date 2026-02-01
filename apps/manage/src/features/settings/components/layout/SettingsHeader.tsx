interface SettingsHeaderProps {
  title?: string;
  description?: string;
}

export function SettingsHeader({
  title = 'Settings',
  description = 'Manage your store preferences',
}: SettingsHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-xl font-medium text-gray-900">{title}</h1>
      <p className="text-sm text-gray-500 mt-0.5">{description}</p>
    </div>
  );
}
