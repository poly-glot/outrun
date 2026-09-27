import type { ComponentType } from 'react';
import { momoTrustDisplay } from './outrun/fonts';
import { CheetahLogo } from './outrun/Logo';
import { recommendModel } from './outrun/recommendation';
import { archivoBlack } from './pace/fonts';
import { recommendModel as recommendFit } from './pace/recommendation';
import './pace/theme.css';

export type Answers = Record<string, string>;

export interface Campaign {
    fontClassName: string;
    Logo?: ComponentType<{ className?: string }>;
    recommendModel?: (answers: Answers) => string;
}

export const campaigns: Record<string, Campaign> = {
    outrun: { fontClassName: momoTrustDisplay.variable, Logo: CheetahLogo, recommendModel },
    pace: { fontClassName: archivoBlack.variable, recommendModel: recommendFit },
};
