export type MapDirectionAction =
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

export function buildMapDirectionActions(
  query: string,
  location: string,
): MapDirectionAction[] {
  const encodedQuery = encodeURIComponent(query);

  return [
    {
      label: "Google Maps",
      href: `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`,
      icon: "bi-google",
    },
    {
      label: "Maps",
      href: `https://maps.apple.com/?q=${encodedQuery}`,
      icon: "bi-map",
    },
    {
      label: "Waze",
      href: `https://waze.com/ul?q=${encodedQuery}&navigate=yes`,
      icon: "bi-sign-turn-right",
    },
    {
      label: "Αντιγραφή διεύθυνσης",
      href: null,
      icon: "bi-copy",
      copyValue: location,
    },
  ];
}
