// Shared icon types. Kept in their own module so the generated catalog can be
// imported by plain-TS tooling (templates:validate) without pulling in React.

/** One SVG child element of an icon: a tag plus its presentation attributes. */
export type IconNodeChild = [string, Record<string, string | number>];

/** A lucide icon's geometry, drawn inside a 24x24 viewBox. */
export type IconNode = IconNodeChild[];

export type IconEntry = {
  /** lucide's own kebab-case id — the value stored on the blueprint. */
  name: string;
  label: string;
  node: IconNode;
};

export type IconGroup = {
  group: string;
  entries: IconEntry[];
};
