import React from 'react';
import './navbar.css'; // Import CSS file for styling
import {useDarkMode} from '../context/DarkModeContext';

const Navbar = () => {

  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <nav className="navbar">
      <div className="navbar-logo">Randomly</div>
      <ul className="navbar-menu">
        <li className="navbar-item"><a href="#contact">Contact</a></li>
        <li className="navbar-item"><a href="#services">Services</a></li>
        <li className="navbar-item"><a href="#feedback">Feedback</a></li>
        <li className="navbar-item"><a href="#report">Report an Issue</a></li>
      </ul>
      <div className="navbar-switch" >Dark Mode
        <label className="switch">
          <input type="checkbox"   checked={darkMode}  onChange={toggleDarkMode} />
          <span className="slider round"></span>
        </label>
      </div>
    </nav>
  );
};

export default Navbar;
