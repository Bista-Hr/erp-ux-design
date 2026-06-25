import * as React from "react";

export interface EmptyStateProps {
  /** Bold title line. */
  title?: string;
  /** Optional supporting sentence under the title. */
  subtitle?: string;
  /** Optional CTA button label (requires `onAction`). */
  cta?: string;
  /** CTA click handler. */
  onAction?: () => void;
  /** Tighter vertical padding for use inside cards. */
  compact?: boolean;
}

export function EmptyState(props: EmptyStateProps): JSX.Element;
