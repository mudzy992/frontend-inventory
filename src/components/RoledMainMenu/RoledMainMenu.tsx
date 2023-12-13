// RoledMainMenu.tsx
import React from 'react';
import MainMenu from '../MainMenu/MainMenu';
import { useUserContext } from '../UserContext/UserContext';

// Uvoz tipova
import type { MainMenuItem } from '../MainMenu/MainMenu';

const RoledMainMenu: React.FC = () => {
  const { userId, role } = useUserContext();

  // Definicija stavki
  const getUserItems = (): MainMenuItem[] => [
    { text: 'Naslovna', link: `/user/profile/${userId}` },
    { text: 'Log out', link: '/logout/' },
  ];

  const getAdministratorItems = (): MainMenuItem[] => [
    { text: 'Naslovna', link: '/' },
    { text: 'Dashboard', link: '/admin/dashboard' },
    { text: 'Log out', link: '/logout/' },
  ];

  // Odabir stavki ovisno o roli
  const items = role === 'administrator' ? getAdministratorItems() : getUserItems();

  // Prikazivanje komponente MainMenu s odabranim stavkama
  return <MainMenu items={items} userId={userId} role={role} />;
};

export default RoledMainMenu;
