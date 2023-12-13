// MainMenu.tsx
import React, { useState, useEffect } from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export interface MainMenuItem {
  text: string;
  link: string;
}

interface MainMenuProps {
  items: MainMenuItem[];
  userId?: number;
  role?: 'administrator' | 'user';
}

const MainMenu: React.FC<MainMenuProps> = ({ items, userId, role }) => {
  const [menuItems, setMenuItems] = useState<MainMenuItem[]>(items);
  const [menuUserId, setMenuUserId] = useState<number | undefined>(userId);

  useEffect(() => {
    setMenuItems(items);
  }, [items]);

  useEffect(() => {
    setMenuUserId(userId);
  }, [userId]);

  const makeNavLink = (item: MainMenuItem, index: number) => (
    <Link key={index} to={item.link} className="nav-link">
      {item.text}
    </Link>
  );

  const getNavbarBrandHref = () => {
    if (menuUserId === undefined || role === undefined) {
      return '#';
    } else {
      return role === 'administrator' ? '#' : `#/user/profile/${menuUserId}`;
    }
  };

  return (
    <Navbar bg="dark" variant="dark" sticky="top" expand="lg" collapseOnSelect>
      <Container fluid>
        <Navbar.Brand href={getNavbarBrandHref()} className="text-2x1">
          {' '}
          <i className="bi bi-shop" /> Inventory Database
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">{menuItems.map(makeNavLink)}</Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default MainMenu;
