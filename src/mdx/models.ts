import { campaignConfig } from './campaign';
import { listFrames } from './media';

export interface ModelCatalogue {
    frames: Record<string, string[]>;
    ids: string[];
}

export const modelCatalogue = (): ModelCatalogue => ({
    frames: Object.fromEntries(campaignConfig().models.map((model) => [model.id, listFrames(model.frames)])),
    ids: campaignConfig().models.map((model) => model.id),
});
