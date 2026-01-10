import BookCard from '../BookCard/BookCard';
import styles from './BookList.module.scss';

export default function BookList({ books }) {
    // Group books by year
    const booksByYear = books.reduce((acc, book) => {
        const year = new Date(book.DateRead).getFullYear();
        if (!acc[year]) acc[year] = [];
        acc[year].push(book);
        return acc;
    }, {});

    const years = Object.keys(booksByYear).sort((a, b) => b - a);

    return (
        <div className={styles.bookList}>
            {years.map(year => (
                <div key={year} className={styles.yearSection}>
                    <h2 className={styles.yearHeader}>
                        Read in {year}
                    </h2>
                    <div className={styles.booksGrid}>
                        {booksByYear[year].map(book => (
                            <BookCard key={book.EntityId} book={book} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
