import update from "immutability-helper";
import React, { Dispatch, Reducer, ReducerAction, useReducer } from "react";
import { createContext, useContext } from "react";

interface Resolution {
  text: string;
}

interface ResolutionCtx {
  resolutions: Resolution[];
  generated: boolean;
}

type ResolutionAction =
  | { type: "ADD"; text: string }
  | { type: "REMOVE"; idx: number }
  | { type: "UPDATE"; idx: number; text: string }
  | { type: "ADD_MANY"; resolutions: string[] };

function reducer(
  state: ResolutionCtx,
  action: ResolutionAction
): ResolutionCtx {
  switch (action.type) {
    case "ADD":
      return update(state, { resolutions: { $push: [{ text: action.text }] } });
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
    case "ADD_MANY":
      return {
        ...state,
        resolutions: [
          ...state.resolutions,
          ...action.resolutions.map((text) => ({ text })),
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
