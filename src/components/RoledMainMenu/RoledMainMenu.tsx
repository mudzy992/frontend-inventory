// RoledMainMenu.tsx
import React from "react";
import MainMenu from "../MainMenu/MainMenu";
import { useUserContext } from "../UserContext/UserContext";

import type { MainMenuItem } from "../MainMenu/MainMenu";

const RoledMainMenu: React.FC = () => {
  const { userId, role } = useUserContext();

  const getUserItems = (): MainMenuItem[] => [
    { text: "Naslovna", link: `#/user/profile/${userId}` },
  ];

  const getAdministratorItems = (): MainMenuItem[] => [
    { text: "Naslovna", link: "#/" },
    { text: "Helpdesk", link: "#/admin/helpdesk" },
    { text: "SNMP", link: "#/admin/snmp" },
    { text: "Fakture", link: "#/admin/telecom" },
  ];

  const items =
    role !== "user" ? getAdministratorItems() : getUserItems();
  return <MainMenu items={items} userId={userId} role={role} />;
};

export default RoledMainMenu;
