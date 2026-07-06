export type Props = {
    value: string;
    onChange: (next: string) => void;
    length?: number;
    name?: string;
    disabled?: boolean;
};
