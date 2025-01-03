// RoledMainMenu.tsx
import React, { useEffect, useState } from "react";
import MainMenu from "../MainMenu/MainMenu";
import { useUserContext } from "../UserContext/UserContext";

import type { MainMenuItem } from "../MainMenu/MainMenu";

const RoledMainMenu: React.FC = () => {
  const { userId, role, isAuthenticated } = useUserContext();

  const getUserItems = (): MainMenuItem[] => [
    { text: "Naslovna", link: `#/user/profile/${userId}` },
  ];

  const getAdministratorItems = (): MainMenuItem[] => [
    { text: "Naslovna", link: "/" },
    { text: "Helpdesk", link: "/admin/helpdesk" },
    { text: "Fakture", link: "/admin/invoices" },
    { text: "Telekom priprema", link: "/admin/telecom" },
  ];

  const items =
    role !== "user" ? getAdministratorItems() : getUserItems();
  return (
    <MainMenu items={items} userId={userId} role={role} isAuthenticated={isAuthenticated} />
);
};

export default RoledMainMenu;
