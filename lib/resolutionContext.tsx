import update from "immutability-helper";
import React, { Dispatch, Reducer, ReducerAction, useReducer } from "react";
import { createContext, useContext } from "react";

interface NextStep {
  text: string;
  done: boolean;
}

interface Resolution {
  text: string;
  loading: boolean;
  nextSteps: NextStep[] | null;
  nextStepError?: string;
}

interface ResolutionCtx {
  resolutions: Resolution[];
  generated: boolean;
}

type ResolutionAction =
  | { type: "ADD"; text: string }
  | { type: "REMOVE"; idx: number }
  | { type: "UPDATE"; idx: number; text: string }
  | { type: "ADD_MANY"; resolutions: string[] }
  | { type: "SET_GENERATED"; generated: boolean }
  | { type: "SET_LOADING"; loading: boolean; idx: number }
  | {
      type: "SET_NEXT_STEP_DONE";
      resolutionIdx: number;
      setIdx: number;
      value: boolean;
    }
  | { type: "SET_NEXT"; nextSteps: string[]; idx: number }
  | { type: "SET_ERROR"; error: string; idx: number }
  | { type: "RESET_ERROR"; idx: number };

function reducer(
  state: ResolutionCtx,
  action: ResolutionAction
): ResolutionCtx {
  switch (action.type) {
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
    case "ADD_MANY":
      return {
        ...state,
        resolutions: [
          ...state.resolutions,
          ...action.resolutions.map((text) => ({
            text,
            loading: false,
            nextSteps: null,
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
  const state = useReducer(reducer, defaultVal);
  return (
    <resolutionCtx.Provider value={state as ResolutionProviderProps}>
      {children}
    </resolutionCtx.Provider>
  );
}
export const useResolutions = () => useContext(resolutionCtx);
