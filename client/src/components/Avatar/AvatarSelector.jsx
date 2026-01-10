import styles from './Avatar.module.scss';
import Avatar from './Avatar';

export default function AvatarSelector({ selectedIndex, onSelect }) {
    return (
        <div className={styles.selectorGrid}>
            {Array.from({ length: 100 }).map((_, i) => (
                <div
                    key={i}
                    className={`${styles.selectorItem} ${selectedIndex === i ? styles.selected : ''}`}
                    onClick={() => onSelect(i)}
                >
                    <Avatar index={i} />
                </div>
            ))}
        </div>
    );
}
