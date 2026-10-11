/**
 * Evita que un doble clic adentro del diálogo, o un clic en un Select/Popover
 * portaleado, dispare el dismiss de Radix.
 */
export function preventAccidentalDialogDismiss(event: {
  preventDefault: () => void;
  detail: { originalEvent: Event };
}) {
  const original = event.detail.originalEvent;
  if (original instanceof PointerEvent && original.detail > 1) {
    event.preventDefault();
    return;
  }
  const target = original.target;
  if (
    target instanceof Element &&
    target.closest('[data-radix-popper-content-wrapper], [data-radix-select-content]')
  ) {
    event.preventDefault();
  }
}
