"use client";

import Link, { type LinkProps } from "next/link";
import { forwardRef } from "react";

type AnchorProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

export type AppLinkProps = LinkProps &
  AnchorProps & {
    ariaLabel?: string;
    external?: boolean;
  };

const AppLink = forwardRef<HTMLAnchorElement, AppLinkProps>(function AppLink(
  { ariaLabel, external, className, rel, target, "aria-label": ariaLabelProp, ...rest },
  ref
) {
  const isExternal = external ?? (typeof rest.href === "string" && rest.href.startsWith("http"));
  const resolvedTarget = target ?? (isExternal ? "_blank" : undefined);
  const resolvedRel =
    resolvedTarget === "_blank"
      ? Array.from(new Set([rel, "noopener", "noreferrer"].filter(Boolean))).join(" ")
      : rel;

  return (
    <Link
      ref={ref}
      aria-label={ariaLabel ?? ariaLabelProp}
      className={className}
      target={resolvedTarget}
      rel={resolvedRel}
      {...rest}
    />
  );
});

export default AppLink;
