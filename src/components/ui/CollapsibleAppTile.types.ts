export type Inset = "default" | "compact";

export type CollapsibleAppTileSummary = React.ReactNode | ((open: boolean) => React.ReactNode);

export type CollapsibleAppTileProps = {
    summary: CollapsibleAppTileSummary;
    children: React.ReactNode;
    className?: string;
    contentClassName?: string;
    inset?: Inset;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};
