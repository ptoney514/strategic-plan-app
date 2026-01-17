declare global {
  interface Window {
    uj: {
      init: (projectId: string, options?: {
        widget?: boolean;
        position?: 'left' | 'right';
        theme?: 'auto' | 'light' | 'dark';
      }) => void;
      identify: (user: {
        id: string;
        email: string;
        name?: string;
      }) => void;
    };
    $ujq: unknown[];
  }
}

export {};
