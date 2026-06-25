import * as React from "react";

export type ButtonVariant = "primary" | "stroke" | "blue" | "ghost" | "danger" | "auth";
export type ButtonSize = "md" | "sm" | "xs";

export interface ButtonProps {
  /** Visual style. `primary` = gold fill + black text (the in-app CTA convention). */
  variant?: ButtonVariant;
  /** Control height. `md` (default), `sm`, `xs`. */
  size?: ButtonSize;
  /** Remix Icon slug (without the `ri-` prefix) shown before the label. */
  icon?: string;
  /** Remix Icon slug shown after the label. */
  iconRight?: string;
  /** Button label. When omitted the button renders as a square icon-only button. */
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export function Button(props: ButtonProps): JSX.Element;
