import { cache } from 'react';
import * as outrun from '@content/outrun/campaign.config';
import * as pace from '@content/pace/campaign.config';

export type CampaignLogo = { kind: 'component' } | { kind: 'image'; src: string } | { kind: 'svg'; markup: string };

export interface CampaignConfig {
    background: { landscape: string; portrait: string };
    brand: string;
    defaultLocale: string;
    defaultModel: string;
    logo: CampaignLogo;
    mediaBase: string;
    models: { frames: string; id: string }[];
    siteUrl: string;
    social: { image: string };
}

const campaignConfigs: Record<string, CampaignConfig> = { outrun, pace };

const requestCampaign = cache((): { id?: string } => ({}));

export function setCampaign(id: string) {
    if (!campaignConfigs[id]) {
        throw new Error(`content/${id} has no campaign.config.ts registered in src/mdx/campaign.ts`);
    }

    requestCampaign().id = id;
}

export function currentCampaign(): string {
    const { id } = requestCampaign();

    if (!id) {
        throw new Error('setCampaign was not called before reading campaign data');
    }

    return id;
}

export const campaignConfig = (): CampaignConfig => campaignConfigs[currentCampaign()];
