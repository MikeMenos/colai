export type Props = {
    onRefresh: () => Promise<any> | void;
    isRefreshing?: boolean;
    threshold?: number; // px
    maxPull?: number; // px
    scrollSelector?: string; // default ".app-content"
    children: React.ReactNode;
    useSelfScroll?: boolean;
    style?: React.CSSProperties;
    className?: string;
};
