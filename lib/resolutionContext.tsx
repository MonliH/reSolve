import update from "immutability-helper";
import { useRouter } from "next/router";
import React, {
  Dispatch,
  Reducer,
  ReducerAction,
  useEffect,
  useReducer,
  useState,
} from "react";
import { createContext, useContext } from "react";
import { v4 as uuidv4 } from "uuid";

export interface NextStep {
  text: string;
  done: boolean;
}

export interface Resolution {
  text: string;
  loading: boolean;
  nextSteps: NextStep[] | null;
  nextStepError?: string;
  aiGenerated?: boolean;
}

interface ResolutionCtx {
  resolutions: Resolution[];
  generated: boolean;
  token: string;
}

type ResolutionAction =
  | { type: "ADD"; text: string }
  | { type: "OVERWRITE"; value: ResolutionCtx }
  | { type: "REMOVE"; idx: number }
  | { type: "UPDATE"; idx: number; text: string }
  | { type: "ADD_MANY"; resolutions: string[]; aiGenerated: boolean }
  | { type: "SET_GENERATED"; generated: boolean }
  | { type: "SET_LOADING"; loading: boolean; idx: number }
  | {
      type: "SET_NEXT_STEP_DONE";
      resolutionIdx: number;
      setIdx: number;
      value: boolean;
    }
  | { type: "SET_TOKEN"; token: string }
  | { type: "SET_NEXT"; nextSteps: string[]; idx: number }
  | { type: "SET_ERROR"; error: string; idx: number }
  | { type: "RESET_ERROR"; idx: number };

function reducer(
  state: ResolutionCtx,
  action: ResolutionAction
): ResolutionCtx {
  switch (action.type) {
    case "OVERWRITE":
      return action.value;
    case "ADD":
      return update(state, {
        resolutions: {
          $push: [{ text: action.text, loading: false, nextSteps: null }],
        },
      });
    case "REMOVE":
      return update(state, {
        resolutions: { $splice: [[action.idx, 1]] },
      });
    case "UPDATE":
      return update(state, {
        resolutions: {
          [action.idx]: { text: { $set: action.text } },
        },
      });
    case "SET_NEXT_STEP_DONE":
      return update(state, {
        resolutions: {
          [action.resolutionIdx]: {
            nextSteps: { [action.setIdx]: { done: { $set: action.value } } },
          },
        },
      });
    case "SET_GENERATED":
      return update(state, {
        generated: { $set: action.generated },
      });
    case "SET_LOADING":
      return update(state, {
        resolutions: { [action.idx]: { loading: { $set: action.loading } } },
      });
    case "SET_ERROR":
      return update(state, {
        resolutions: {
          [action.idx]: { nextStepError: { $set: action.error } },
        },
      });
    case "RESET_ERROR":
      return update(state, {
        resolutions: {
          [action.idx]: { nextStepError: { $set: undefined } },
        },
      });
    case "SET_NEXT":
      return update(state, {
        resolutions: {
          [action.idx]: {
            nextSteps: {
              $set: action.nextSteps.map((n) => ({ text: n, done: false })),
            },
          },
        },
      });
    case "SET_TOKEN":
      return { ...state, token: action.token };
    case "ADD_MANY":
      return {
        ...state,
        resolutions: [
          ...state.resolutions,
          ...action.resolutions.map((text) => ({
            text,
            loading: false,
            nextSteps: null,
            aiGenerated: action.aiGenerated,
          })),
        ],
      };
    default:
      return state;
  }
}

const defaultVal = {
  resolutions: [],
  generated: false,
  token: "DEFAULT_TOKEN",
};
type ResolutionProviderProps = [
  ResolutionCtx,
  Dispatch<ReducerAction<Reducer<ResolutionCtx, ResolutionAction>>>
];
const resolutionCtx = createContext([
  defaultVal,
  () => reducer,
] as ResolutionProviderProps);

export function ResolutionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(reducer, defaultVal);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    let token = localStorage.getItem("token");
    if (!token) {
      token = uuidv4() as string;
      localStorage.setItem("token", token);
    }

    const resolutions = localStorage.getItem("resolutions");
    if (resolutions) {
      const val = JSON.parse(resolutions);
      if (val.resolutions && val.resolutions.length > 0) {
        dispatch({ type: "OVERWRITE", value: val });
        dispatch({ type: "SET_TOKEN", token });
        router.replace("/next-steps", undefined, { shallow: true });
        return;
      }
    }
    dispatch({ type: "SET_TOKEN", token });
    setLoading(false);
  }, []);

  useEffect(() => {
    if (router.pathname === "/next-steps") {
      setLoading(false);
    }
  }, [router.pathname]);

  useEffect(() => {
    localStorage.setItem("resolutions", JSON.stringify(state));
  }, [state]);

  return (
    <resolutionCtx.Provider
      value={[state, dispatch] as ResolutionProviderProps}
    >
      {!loading && children}
    </resolutionCtx.Provider>
  );
}
export const useResolutions = () => useContext(resolutionCtx);
export const MAX_RESOLUTIONS = 5;
