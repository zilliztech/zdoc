import {createContext, useContext} from 'react';

interface TOCContextValue {
  tocVisible: boolean;
  toggleTOC: () => void;
}

export const TOCContext = createContext<TOCContextValue | null>(null);
export function useTOCContext(): TOCContextValue | null {
  return useContext(TOCContext);
}
