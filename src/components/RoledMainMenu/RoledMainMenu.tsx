import React from 'react';
import { MainMenu, MainMenuItem } from '../MainMenu/MainMenu';
import { useUserContext } from '../UserContext/UserContext';

const RoledMainMenu: React.FC = () => {
    const { userId, role } = useUserContext();
  
    const getUserItems = (): MainMenuItem[] => [
      new MainMenuItem("Naslovna", `/user/profile/${userId}`),
      new MainMenuItem("Log out", "/user/logout/"),
    ];
  
    const getAdministratorItems = (): MainMenuItem[] => [
      new MainMenuItem("Naslovna", "/"),
      new MainMenuItem("Dashboard", "/admin/dashboard"),
    ];
  
    const items = role === 'administrator' ? getAdministratorItems() : getUserItems();
  
    return <MainMenu items={items} userId={userId} role={role} />;
  };
  

export default RoledMainMenu;
