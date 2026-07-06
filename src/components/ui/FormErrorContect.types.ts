export type ErrorCtx = {
    errors: Record<string, string | boolean>;
    clearError?: (field: string) => void;
};
