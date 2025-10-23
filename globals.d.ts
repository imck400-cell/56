// This file provides global type definitions for libraries loaded via script tags in index.html.
// This prevents TypeScript errors during the build process on platforms like Vercel.

declare global {
  interface Window {
    // Defines the structure of the jspdf object attached to the window.
    jspdf: {
      jsPDF: new (options?: any) => {
        addImage: (...args: any[]) => any;
        addPage: () => any;
        save: (filename: string) => void;
      };
    };
    // Defines the html2canvas function attached to the window.
    html2canvas: (element: HTMLElement, options?: any) => Promise<HTMLCanvasElement>;
  }
}

// Export an empty object to make this file a module and ensure it's processed correctly.
export {};
