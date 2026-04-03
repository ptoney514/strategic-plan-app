export interface MaterialIconProps {
  icon: string;
  size?: number;
  weight?: number;
  fill?: boolean;
  className?: string;
}

export function MaterialIcon({
  icon,
  size,
  weight,
  fill = false,
  className = '',
}: MaterialIconProps) {
  const style: React.CSSProperties = {};
  const settings: string[] = [];

  settings.push(`'FILL' ${fill ? 1 : 0}`);
  settings.push(`'wght' ${weight ?? 400}`);
  settings.push("'GRAD' 0");
  settings.push(`'opsz' ${size ?? 24}`);

  style.fontVariationSettings = settings.join(', ');
  if (size) style.fontSize = `${size}px`;

  return (
    <span className={`material-symbols-outlined ${className}`} style={style}>
      {icon}
    </span>
  );
}
