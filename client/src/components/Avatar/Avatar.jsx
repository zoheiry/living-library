import styles from './Avatar.module.scss';
import { useMemo } from 'react';

export default function Avatar({ index = 0, size = 'medium' }) {
    // 10x10 Grid
    // Index 0-99

    // Safety check
    const safeIndex = Math.max(0, Math.min(99, Number(index) || 0));


    const style = useMemo(() => {
        const col = safeIndex % 10;
        const row = Math.floor(safeIndex / 10);

        const x = col * 10.63 + 2.1;
        const y = row * 10.662 + 2.5;

        return {
            backgroundPosition: `${x}% ${y}%`
        };
    }, [safeIndex]);

    return (
        <div className={`${styles.avatarContainer} ${size === 'large' ? styles.large : ''}`}>
            <div className={styles.avatarSprite} style={style} />
        </div>
    );
}
