import styles from './YouTubePlayer.module.css';

interface YouTubePlayerProps {
    locale: string;
    title: string;
    videoId: string;
}

export function YouTubePlayer({ locale, title, videoId }: YouTubePlayerProps) {
    const query = new URLSearchParams({ autoplay: '1', cc_lang_pref: locale, cc_load_policy: '1', playsinline: '1', rel: '0' });

    return (
        <iframe
            className={styles.player}
            src={`https://www.youtube-nocookie.com/embed/${videoId}?${query}`}
            title={title}
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
        />
    );
}
