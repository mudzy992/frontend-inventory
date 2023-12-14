// RoledMainMenu.tsx
import React, { useEffect } from 'react';
import MainMenu from '../MainMenu/MainMenu';
import { useUserContext } from '../UserContext/UserContext';

import type { MainMenuItem } from '../MainMenu/MainMenu';

const RoledMainMenu: React.FC = () => {
  const { userId, role } = useUserContext();

  const getUserItems = (): MainMenuItem[] => [
    { text: 'Naslovna', link: `/user/profile/${userId}` },
    { text: 'Log out', link: '/logout/' },
  ];

  const getAdministratorItems = (): MainMenuItem[] => [
    { text: 'Naslovna', link: '/' },
    { text: 'Dashboard', link: '/admin/dashboard' },
    { text: 'Log out', link: '/logout/' },
  ];

  const items = role === 'administrator' ? getAdministratorItems() : getUserItems();
  return <MainMenu items={items} userId={userId} role={role} />;
};

export default RoledMainMenu;
