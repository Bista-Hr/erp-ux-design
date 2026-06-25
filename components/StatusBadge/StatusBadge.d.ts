import * as React from "react";

export type StatusVariant =
  | "active" | "inactive" | "approved" | "completed" | "pending" | "review"
  | "rejected" | "cancelled" | "warning" | "success" | "current" | "past"
  | "draft" | "open" | "shortlisted" | "closed" | "info" | "error" | "default";

export interface StatusBadgeProps {
  /** Semantic status — drives the circle color, glyph and default label. */
  variant?: StatusVariant;
  /** Override the label. Defaults to the variant's standard text. */
  text?: string;
  /** Hide the leading colored circle/glyph. */
  showIcon?: boolean;
  /** Pill size. */
  size?: "sm" | "md" | "lg";
}

export function StatusBadge(props: StatusBadgeProps): JSX.Element;
