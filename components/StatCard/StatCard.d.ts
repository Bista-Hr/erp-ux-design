import * as React from "react";

export interface StatCardProps {
  /** Metric label, e.g. "Open Postings". */
  title: React.ReactNode;
  /** Metric value, e.g. "24". */
  value: React.ReactNode;
  /** Position in the row — drives the alternating gold/red tint. */
  index?: number;
}

export function StatCard(props: StatCardProps): JSX.Element;
