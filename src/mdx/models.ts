import { models } from '@content/site.config';
import { listFrames } from './media';

export interface ModelCatalogue {
    frames: Record<string, string[]>;
    list: { id: string; label: string }[];
}

let catalogue: ModelCatalogue | null = null;

export function modelCatalogue(): ModelCatalogue {
    catalogue ??= {
        frames: Object.fromEntries(models.map((model) => [model.id, listFrames(model.frames)])),
        list: models.map(({ id, label }) => ({ id, label })),
    };

    return catalogue;
}
