import { createContext, useContext, useReducer } from 'react';
import MIDI from '~/assets/midiList.json';
import SOUNDS from '~/assets/soundList.json';
import { SCENES } from '~/scenes';

const DEFAULT_STATE = {
  isRunning: false,
  midi: MIDI[2],
  selectedMap: 3,
  selectedScene: Object.keys(SCENES)[7],
  sound: SOUNDS[8],
};

export type State = typeof DEFAULT_STATE;

export enum ActionType {
  SetScene = 'SET_SCENE',
  SetSound = 'SET_SOUND',
  SetIsRunning = 'SET_IS_RUNNING',
  ChangeMap = 'CHANGE_MAP',
  SetMidi = 'SET_MIDI',
}

interface Payloads {
  [ActionType.SetScene]: string;
  [ActionType.SetSound]: string;
  [ActionType.SetIsRunning]: boolean;
  [ActionType.ChangeMap]: number;
  [ActionType.SetMidi]: string;
}
export type ActionMap<M extends Record<string, any>> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key;
      }
    : {
        type: Key;
        payload: M[Key];
      };
};

export type Actions = ActionMap<Payloads>[keyof ActionMap<Payloads>];

const reducer = (state: typeof DEFAULT_STATE, action: Actions) => {
  console.log('action', action);
  switch (action.type) {
    case ActionType.SetScene:
      return {
        ...state,
        selectedScene: action.payload,
      };
    case ActionType.SetSound:
      return {
        ...state,
        sound: action.payload,
      };
    case ActionType.SetIsRunning:
      return {
        ...state,
        isRunning: action.payload,
      };
    case ActionType.ChangeMap:
      return {
        ...state,
        selectedMap: action.payload,
      };
    case ActionType.SetMidi:
      return {
        ...state,
        midi: action.payload,
      };
    default:
      return state;
  }
};

const AppContext = createContext<{
  dispatch: React.Dispatch<Actions>;
  state: State;
}>({
  dispatch: () => null,
  state: DEFAULT_STATE,
});

export const AppContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(reducer, DEFAULT_STATE);

  return (
    <AppContext.Provider value={{ dispatch, state }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const { dispatch, state } = useContext(AppContext);

  return { dispatch, state };
};
