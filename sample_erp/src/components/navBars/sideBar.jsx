import React from 'react';
import { NavLink } from 'react-router-dom';
import './sidBar.css';

const Sidebar = () => {
  const menuItems = [
    { name: 'Customers', path: '/customers', icon: '👤' },
    { name: 'Invoices', path: '/invoices', icon: '📄' },
    { name: 'Accounts', path: '/accounts', icon: '💼' },
    { name: 'Payments', path: '/payments', icon: '💳' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <h2>Dashboard</h2>
      </div>
      <nav className="sidebar-menu">
        {menuItems.map((item, index) => (
          <NavLink 
            key={index} 
            to={item.path} 
            className={({ isActive }) => 
              isActive ? 'sidebar-link active' : 'sidebar-link'
            }
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-text">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
