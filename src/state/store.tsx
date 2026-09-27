'use client';

import { createContext, useContext, useReducer, type ReactNode } from 'react';
import { campaigns, type Answers } from '@campaigns';
import type { SiteStrings } from '@/mdx/pages';

type ModalState = { type: '' } | { type: 'contact' } | { type: 'youtube'; title: string; videoId: string };

interface SiteState {
    answers: Answers;
    campaign: string;
    menuOpen: boolean;
    modal: ModalState;
    motionPaused: boolean;
    recommendedModel: string;
    selectedModel: string;
    shareImage: string;
}

type Action =
    | { type: 'toggleMenu' }
    | { type: 'closeMenu' }
    | { type: 'openContact' }
    | { type: 'showVideo'; title: string; videoId: string }
    | { type: 'closeModal' }
    | { type: 'setMotion'; paused: boolean }
    | { type: 'selectModel'; model: string }
    | { type: 'answer'; questionId: string; optionId: string };

function reduce(state: SiteState, action: Action): SiteState {
    switch (action.type) {
        case 'toggleMenu':
            return { ...state, menuOpen: !state.menuOpen };
        case 'closeMenu':
            return { ...state, menuOpen: false };
        case 'openContact':
            return { ...state, modal: { type: 'contact' } };
        case 'showVideo':
            return { ...state, modal: { title: action.title, type: 'youtube', videoId: action.videoId } };
        case 'closeModal':
            return { ...state, modal: { type: '' } };
        case 'setMotion':
            return { ...state, motionPaused: action.paused };
        case 'selectModel':
            return { ...state, selectedModel: action.model };
        case 'answer': {
            const answers = { ...state.answers, [action.questionId]: action.optionId };
            const recommend = campaigns[state.campaign]?.recommendModel;

            if (!recommend) {
                return { ...state, answers };
            }

            const recommendedModel = recommend(answers);

            return { ...state, answers, recommendedModel, selectedModel: recommendedModel };
        }
    }
}

const StateContext = createContext<SiteState | null>(null);
const DispatchContext = createContext<(action: Action) => void>(() => undefined);
const StringsContext = createContext<SiteStrings | null>(null);

interface SiteStateProviderProps {
    campaign: string;
    children: ReactNode;
    initialModel: string;
    shareImage: string;
    strings: SiteStrings;
}

export function SiteStateProvider({ campaign, children, initialModel, shareImage, strings }: SiteStateProviderProps) {
    const [state, dispatch] = useReducer(reduce, initialModel, (selectedModel): SiteState => ({
        answers: {},
        campaign,
        menuOpen: false,
        modal: { type: '' },
        motionPaused: false,
        recommendedModel: '',
        selectedModel,
        shareImage,
    }));

    return (
        <StateContext.Provider value={state}>
            <DispatchContext.Provider value={dispatch}>
                <StringsContext.Provider value={strings}>{children}</StringsContext.Provider>
            </DispatchContext.Provider>
        </StateContext.Provider>
    );
}

export function useSiteState(): SiteState {
    const state = useContext(StateContext);

    if (!state) {
        throw new Error('useSiteState must be used inside SiteStateProvider');
    }

    return state;
}

export const useSiteDispatch = () => useContext(DispatchContext);

export function useStrings(): SiteStrings {
    const strings = useContext(StringsContext);

    if (!strings) {
        throw new Error('useStrings must be used inside SiteStateProvider');
    }

    return strings;
}
