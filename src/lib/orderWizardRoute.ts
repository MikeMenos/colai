/** `/orders/:orderId/:orderType/edit` or `.../new` */
export const ORDER_WIZARD_PATH_RE =
  /^\/orders\/([^/]+)\/([^/]+)\/(edit|new)$/;

/** `/orders/:orderId/eopyy-bulk/new` */
export const ORDER_EOPPY_BULK_PATH_RE =
  /^\/orders\/([^/]+)\/eopyy-bulk\/new$/;

export function isOrderWizardPath(pathname: string): boolean {
  return ORDER_WIZARD_PATH_RE.test(pathname);
}

export function isOrderEoppyBulkPath(pathname: string): boolean {
  return ORDER_EOPPY_BULK_PATH_RE.test(pathname);
}

export function shouldGuardOrderWizardLeave(pathname: string): boolean {
  return isOrderWizardPath(pathname) && !isOrderEoppyBulkPath(pathname);
}
