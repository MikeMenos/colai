/** `/orders/:orderId/:orderType/edit` or `.../new` */
export const ORDER_WIZARD_PATH_RE =
  /^\/orders\/([^/]+)\/([^/]+)\/(edit|new)$/;

export function isOrderWizardPath(pathname: string): boolean {
  return ORDER_WIZARD_PATH_RE.test(pathname);
}
