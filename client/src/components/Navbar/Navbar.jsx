import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Navbar.module.scss';
import Avatar from '../Avatar/Avatar';

export default function Navbar({ onAddBook }) {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const avatarIndex = user?.avatarIndex || 0;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className={styles.navbarWrapper}>
            <div className={`${styles.navbar} container`}>
                <Link to="/" className={styles.brand}>
                    <img src="/assets/logo.png" alt="Logo" className={styles.logoImage} />
                    <span className={styles.brandText}>Living Bookshelf</span>
                </Link>

                <div className={styles.navActions}>
                    <button className={styles.addBtn} onClick={onAddBook}>
                        <span className={styles.btnText}>Add Book</span>
                    </button>

                    <div style={{ position: 'relative' }} ref={dropdownRef}>
                        <div
                            className={styles.userAvatarWrapper}
                            title="User Menu"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                        >
                            <Avatar index={avatarIndex} />
                        </div>

                        {dropdownOpen && (
                            <div className={styles.dropdownMenu}>
                                <Link to="/settings" onClick={() => setDropdownOpen(false)}>Settings</Link>
                                <button onClick={handleLogout}>Logout</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
