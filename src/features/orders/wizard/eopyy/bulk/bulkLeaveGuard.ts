type BulkLeaveGuard = {
  hasContent: () => boolean;
  abortAll: () => void;
};

let activeGuard: BulkLeaveGuard | null = null;

export function registerBulkLeaveGuard(guard: BulkLeaveGuard): () => void {
  activeGuard = guard;
  return () => {
    if (activeGuard === guard) {
      activeGuard = null;
    }
  };
}

export function getBulkLeaveGuard(): BulkLeaveGuard | null {
  return activeGuard;
}
