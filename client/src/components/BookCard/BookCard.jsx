import { Link } from 'react-router-dom';
import styles from './BookCard.module.scss';

export default function BookCard({ book }) {
    return (
        <Link to={`/book/${encodeURIComponent(book.EntityId)}`} className={styles.bookCardLink}>
            <div className={styles.bookCard}>
                <div className={styles.coverContainer}>
                    {book.CoverImage ? (
                        <img src={book.CoverImage} alt={book.Title} />
                    ) : (
                        <div className={styles.noCover}>No Cover</div>
                    )}
                </div>
                <div className={styles.bookInfo}>
                    <h3>{book.Title}</h3>
                    <p>{book.Author}</p>
                </div>
            </div>
        </Link>
    );
}
