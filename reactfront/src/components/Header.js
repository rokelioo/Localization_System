import React from 'react';
import { useNavigate } from 'react-router-dom';
import "../CSS/header.css";

const Header = () => {
  const navigate = useNavigate();

  const isLoggedIn = () => {
    return sessionStorage.getItem('UserSession') !== null;
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const handleLogoutClick = () => {
    sessionStorage.clear();
    navigate('/');
  };

  const handleAddPersonClick = () => {
    navigate('/addperson');
  };

  const handleHousePlanner = () => {
    navigate('/planner');
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };
  const handleStatisticsClick = () => {
    navigate('/statistics');
  }
  const handleLocationClick = () => {
    navigate('/add-location');
  }
  const handleMain = () => {
    navigate('/main');
  }
  return (
    <header>
      <nav>
        <ul>
          {isLoggedIn() ? (
            <>
              <li><button onClick={handleMain}>Main</button></li>
              <li><button onClick={handleHousePlanner}>House Planner</button></li>
              <li><button onClick={handleLocationClick}>Add Location</button></li>
              <li><button onClick={handleAddPersonClick}>Add Person</button></li>
              <li><button onClick={handleSettingsClick}>User Settings</button></li>
              <li><button onClick={handleStatisticsClick}>Statistics</button></li>
              <li><button onClick={handleLogoutClick}>Logout</button></li>
            </>
          ) : (
            <>
              <li><button className='header-button' onClick={handleLoginClick}>Login</button></li>
              <li><button className='header-button' onClick={handleRegisterClick}>Register</button></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;