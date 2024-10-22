import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <ul className="navbar-list">
        <li className="navbar-item">
          <Link to="/" className="navbar-link">
            <h3>🍵 Anon Tea</h3>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
