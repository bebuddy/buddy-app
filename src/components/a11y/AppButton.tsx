"use client";

import { forwardRef } from "react";

export type AppButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  ariaLabel?: string;
  isIconOnly?: boolean;
  minSize?: number;
};

const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(function AppButton(
  {
    ariaLabel,
    isIconOnly,
    minSize = 44,
    type = "button",
    className,
    style,
    "aria-label": ariaLabelProp,
    ...rest
  },
  ref
) {
  const computedAriaLabel = ariaLabel ?? ariaLabelProp;

  return (
    <button
      ref={ref}
      type={type}
      aria-label={computedAriaLabel}
      data-icon-only={isIconOnly ? "true" : undefined}
      className={`inline-flex items-center justify-center gap-2 ${className ?? ""}`}
      style={{ minWidth: minSize, minHeight: minSize, ...style }}
      {...rest}
    />
  );
});

export default AppButton;
