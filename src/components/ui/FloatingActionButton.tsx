import Link from "next/link";

type FloatingActionButtonProps = {
  href: string;
  ariaLabel: string;
  iconClassName?: string;
  inline?: boolean;
};

/**
 * Mobile-style floating action button.
 * Positioned via the `.app-fab` class (inside the phone canvas).
 */
export function FloatingActionButton({
  href,
  ariaLabel,
  iconClassName = "bi-plus-lg",
  inline = false,
}: FloatingActionButtonProps) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={`app-fab btn btn-primary rounded-circle shadow d-flex align-items-center justify-content-center${
        inline ? " app-fab--inline" : ""
      }`}
      style={{ width: 56, height: 56 }}
    >
      <i className={`bi ${iconClassName}`} style={{ fontSize: "1.25rem" }} />
    </Link>
  );
}
