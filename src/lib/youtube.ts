export interface YouTubePlayer {
    destroy(): void;
}

interface PlayerOptions {
    height?: string | number;
    host?: string;
    playerVars?: Record<string, string | number>;
    videoId: string;
    width?: string | number;
}

interface YouTubeApi {
    Player: new (element: HTMLElement, options: PlayerOptions) => YouTubePlayer;
}

declare global {
    interface Window {
        YT?: YouTubeApi;
        onYouTubeIframeAPIReady?: () => void;
    }
}

let pending: Promise<YouTubeApi> | null = null;

export function loadYouTubeApi(): Promise<YouTubeApi> {
    if (window.YT?.Player) {
        return Promise.resolve(window.YT);
    }

    if (pending) {
        return pending;
    }

    pending = new Promise<YouTubeApi>((resolve) => {
        window.onYouTubeIframeAPIReady = () => resolve(window.YT as YouTubeApi);

        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        script.async = true;
        document.head.append(script);
    });

    return pending;
}
