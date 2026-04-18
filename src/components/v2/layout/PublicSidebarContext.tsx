'use client'
import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';

interface SidebarState {
  expandedNodes: Set<string>;
  activeNodeId: string | null;
  mobileOpen: boolean;
}

type SidebarAction =
  | { type: 'TOGGLE_NODE'; id: string }
  | { type: 'SET_ACTIVE'; id: string | null }
  | { type: 'EXPAND_TO_NODE'; ids: string[] }
  | { type: 'TOGGLE_MOBILE' }
  | { type: 'CLOSE_MOBILE' };

function sidebarReducer(state: SidebarState, action: SidebarAction): SidebarState {
  switch (action.type) {
    case 'TOGGLE_NODE': {
      const next = new Set(state.expandedNodes);
      if (next.has(action.id)) {
        next.delete(action.id);
      } else {
        next.add(action.id);
      }
      return { ...state, expandedNodes: next };
    }
    case 'SET_ACTIVE':
      if (state.activeNodeId === action.id) {
        return state;
      }
      return { ...state, activeNodeId: action.id };
    case 'EXPAND_TO_NODE': {
      const next = new Set(state.expandedNodes);
      let didChange = false;
      action.ids.forEach((id) => {
        if (!next.has(id)) {
          next.add(id);
          didChange = true;
        }
      });
      if (!didChange) {
        return state;
      }
      return { ...state, expandedNodes: next };
    }
    case 'TOGGLE_MOBILE':
      return { ...state, mobileOpen: !state.mobileOpen };
    case 'CLOSE_MOBILE':
      if (!state.mobileOpen) {
        return state;
      }
      return { ...state, mobileOpen: false };
    default:
      return state;
  }
}

interface SidebarContextValue {
  expandedNodes: Set<string>;
  activeNodeId: string | null;
  mobileOpen: boolean;
  toggleNode: (id: string) => void;
  setActiveNode: (id: string | null) => void;
  expandToNode: (ids: string[]) => void;
  toggleMobile: () => void;
  closeMobile: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function PublicSidebarProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(sidebarReducer, {
    expandedNodes: new Set<string>(),
    activeNodeId: null,
    mobileOpen: false,
  });

  const toggleNode = useCallback((id: string) => dispatch({ type: 'TOGGLE_NODE', id }), []);
  const setActiveNode = useCallback((id: string | null) => dispatch({ type: 'SET_ACTIVE', id }), []);
  const expandToNode = useCallback((ids: string[]) => dispatch({ type: 'EXPAND_TO_NODE', ids }), []);
  const toggleMobile = useCallback(() => dispatch({ type: 'TOGGLE_MOBILE' }), []);
  const closeMobile = useCallback(() => dispatch({ type: 'CLOSE_MOBILE' }), []);

  return (
    <SidebarContext.Provider
      value={{
        expandedNodes: state.expandedNodes,
        activeNodeId: state.activeNodeId,
        mobileOpen: state.mobileOpen,
        toggleNode,
        setActiveNode,
        expandToNode,
        toggleMobile,
        closeMobile,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function usePublicSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('usePublicSidebar must be used within PublicSidebarProvider');
  return ctx;
}
