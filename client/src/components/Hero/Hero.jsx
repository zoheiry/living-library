import styles from './Hero.module.scss';

export default function Hero() {
    return (
        <div className={styles.heroSection}>
            <h1>My Library</h1>
            <p>All your books in one place, beautifully organized.</p>
        </div>
    );
}
