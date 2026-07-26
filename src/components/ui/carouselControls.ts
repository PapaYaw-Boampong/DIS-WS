// Shared styling for carousel navigation controls that overlay the media and
// reveal on hover/focus. The parent carousel must be `relative` and carry the
// `group` class. On touch/no-hover devices the controls stay visible.

const REVEAL =
  "opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100";

/** Left/right arrow pill, vertically centred on the carousel edge. */
export const CAROUSEL_SIDE_BUTTON = `absolute top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/95 text-charcoal shadow-card backdrop-blur transition-[color,border-color,opacity] duration-200 hover:border-curry-orange hover:text-curry-orange disabled:cursor-not-allowed pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto [@media(hover:none)]:pointer-events-auto ${REVEAL}`;

/** Container for dot indicators, overlaid near the bottom-centre of the media. */
export const CAROUSEL_DOTS_OVERLAY = `absolute inset-x-0 bottom-4 z-20 flex items-center justify-center gap-2 ${REVEAL}`;
