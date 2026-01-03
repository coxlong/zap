import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import { Candidate } from '@/plugins/types';
import { getLocalResults, rerank } from '@/plugins/engine';

// ============ 状态定义 ============

interface SearchState {
  isComposing: boolean;
  searchTerm: string;
  results: Candidate[];
  error: string | null;
}

type SearchAction =
  | { type: 'SET_TERM'; payload: string }
  | { type: 'SET_COMPOSING'; payload: boolean }
  | { type: 'SET_RESULTS'; payload: Candidate[] }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };

const initialState: SearchState = {
  isComposing: false,
  searchTerm: '',
  results: [],
  error: null,
};

// ============ Reducer ============

function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case 'SET_TERM':
      return {
        ...state,
        searchTerm: action.payload,
        error: null,
      };

    case 'SET_COMPOSING':
      return {
        ...state,
        isComposing: action.payload,
      };

    case 'SET_RESULTS':
      return {
        ...state,
        results: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

// ============ Context ============

interface SearchContextValue {
  state: SearchState;
  setSearchTerm: (term: string) => void;
  startComposition: () => void;
  endComposition: (value: string) => void;
  reset: () => void;
}

const SearchStateContext = createContext<SearchContextValue | undefined>(
  undefined,
);

// ============ Provider ============

export function SearchStateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(searchReducer, initialState);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentTermRef = useRef('');

  const performSearch = useCallback(async (term: string) => {
    if (!term) {
      dispatch({ type: 'RESET' });
      return;
    }

    currentTermRef.current = term;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const localResults = await getLocalResults(term);
    dispatch({ type: 'SET_RESULTS', payload: localResults });

    try {
      const rankedResults = await rerank(term, localResults);
      if (term === currentTermRef.current) {
        dispatch({ type: 'SET_RESULTS', payload: rankedResults });
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.name !== 'AbortError' &&
        term === currentTermRef.current
      ) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    }
  }, []);

  const setSearchTerm = useCallback(
    (term: string) => {
      dispatch({ type: 'SET_TERM', payload: term });
      if (!state.isComposing) {
        performSearch(term);
      }
    },
    [performSearch, state.isComposing],
  );

  const startComposition = useCallback(() => {
    dispatch({ type: 'SET_COMPOSING', payload: true });
  }, []);

  const endComposition = useCallback(
    (value: string) => {
      dispatch({ type: 'SET_COMPOSING', payload: false });
      dispatch({ type: 'SET_TERM', payload: value });
      performSearch(value);
    },
    [performSearch],
  );

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
    currentTermRef.current = '';
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  React.useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const value = useMemo(
    () => ({
      state,
      setSearchTerm,
      startComposition,
      endComposition,
      reset,
    }),
    [state, setSearchTerm, startComposition, endComposition, reset],
  );

  return (
    <SearchStateContext.Provider value={value}>
      {children}
    </SearchStateContext.Provider>
  );
}

// ============ Hook ============

export function useSearch() {
  const context = useContext(SearchStateContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchStateProvider');
  }
  return context;
}
