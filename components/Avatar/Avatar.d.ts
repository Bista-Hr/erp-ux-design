import * as React from "react";

export interface AvatarProps {
  /** Person's full name — initials and the hashed color are derived from this. */
  name?: string;
  /** Diameter in px (default 36). */
  size?: number;
  /** Optional photo URL; when set, renders the image instead of initials. */
  src?: string;
}

export function Avatar(props: AvatarProps): JSX.Element;
