export function Avatar({ name, small = false }: { name: string; small?: boolean }) {
  const initials = name.split(/\s+/).slice(-2).map((part) => part[0]).join("").toUpperCase();
  return <span className={`avatar ${small ? "small" : ""}`} aria-label={name}>{initials}</span>;
}
