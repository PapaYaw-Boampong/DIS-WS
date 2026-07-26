// Minimal ambient types for `page-flip` (StPageFlip). The published build we
// import at runtime doesn't ship a matching declaration file, so we declare the
// small surface this app uses.
declare module "page-flip" {
  export interface PageFlipSettings {
    width: number;
    height: number;
    size?: "fixed" | "stretch";
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    maxShadowOpacity?: number;
    showCover?: boolean;
    mobileScrollSupport?: boolean;
    usePortrait?: boolean;
  }

  export class PageFlip {
    constructor(element: HTMLElement, settings: PageFlipSettings);
    loadFromImages(images: string[]): void;
    on(event: string, callback: (event: { data: number }) => void): void;
    getPageCount(): number;
    flipNext(): void;
    flipPrev(): void;
    destroy(): void;
  }
}
