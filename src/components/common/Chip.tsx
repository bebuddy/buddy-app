export const Chip = ({
  children,
  solid,
  textSize,
  color = "primary",
}: React.PropsWithChildren<{
  solid?: boolean;
  textSize?: number;
  color?: "primary" | "secondary" | "linear-primary";
}>) => {
  const borderColor =
    color === "primary"
      ? "border-primary-500"
      : color === "secondary"
      ? "border-secondary-500"
      : "border-transparent";

  const bgColor = solid
    ? color === "primary"
      ? "bg-primary-500"
      : color === "secondary"
      ? "bg-secondary-500"
      : "bg-gradient-to-r from-[#FF883F] to-[#FFE555]"
    : "";

  const textColor = solid ? "text-white" : "text-black";
  const textClass = textSize ? `font-regular-${textSize}` : "font-regular-16";

  return (
    <span
      className={`inline-flex w-fit items-center px-3 py-0.5 rounded-full border-[1px] ${textClass} ${borderColor} ${bgColor} ${textColor}`}
    >
      {children}
    </span>
  );
};
