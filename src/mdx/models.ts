import { models } from '@content/site.config';
import { listFrames } from './media';

export interface ModelCatalogue {
    frames: Record<string, string[]>;
    ids: string[];
}

export const modelCatalogue = (): ModelCatalogue => ({
    frames: Object.fromEntries(models.map((model) => [model.id, listFrames(model.frames)])),
    ids: models.map((model) => model.id),
});
