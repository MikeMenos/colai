export type MapAction =
  | {
      label: string;
      href: string;
      icon: string;
      copyValue?: never;
    }
  | {
      label: string;
      href: null;
      icon: string;
      copyValue: string;
    };
