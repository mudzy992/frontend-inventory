import React, { useState, useEffect } from "react";
import { Menu, Dropdown, Avatar, Typography, Drawer } from "antd";
import { Link } from "react-router-dom";
import {
  MenuFoldOutlined,
  LogoutOutlined,
  ProfileOutlined,
} from "@ant-design/icons";
import UserType from "../../types/UserType";
import api, { ApiResponse } from "../../API/api";

export interface MainMenuItem {
  text: string;
  link: string;
}

interface MainMenuProps {
  items: MainMenuItem[];
  userId?: number;
  role?: "administrator" | "moderator" | "user";
}

const MainMenu: React.FC<MainMenuProps> = ({ items, userId, role }) => {
  const [menuItems, setMenuItems] = useState<MainMenuItem[]>(items);
  const [menuUserId, setMenuUserId] = useState<number | undefined>(userId);
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<UserType>({});
  const [drawerVisible, setDrawerVisible] = useState(false); // State for Drawer visibility

  useEffect(() => {
    if (items !== undefined) {
      setMenuItems(items);
    }
  }, [items]);

  useEffect(() => {
    if (userId !== undefined) {
      setMenuUserId(userId);
    }
  }, [userId]);

  const getUserData = async () => {
    try {
      const res: ApiResponse = await api(
        `api/user/${menuUserId}/mainmenu`,
        "get",
        {},
        role
      );
      const data: UserType = res.data || {};
      setUser(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    if (menuUserId !== undefined && role !== undefined) {
      getUserData();
    }
  }, [menuUserId, role]);

  const menu = (
    <Menu>
      <Menu.Item key="profile" icon={<ProfileOutlined />}>
        <Link to={`/user/profile/${userId}`}>Profil</Link>
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />} danger>
        <Link to="/logout">Odjavi se</Link>
      </Menu.Item>
    </Menu>
  );

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const getNavbarBrandHref = () => {
    if (menuUserId === undefined || role === undefined) {
      return "/";
    }
    return role !== "user" ? "/" : `/user/profile/${menuUserId}`;
  };

  const genderGreeting = (gender: string) => {
    if (gender === "muško") return "Dobrodošao";
    if (gender === "žensko") return "Dobrodošla";
    return "";
  };

  // Funkcija koja filtrira menije prema ulozi
  const getMenuForRole = () => {
    // Za ulogu administratora, moderatore i korisnike
    let roleSpecificItems: JSX.Element[] = [];

    if (role === "administrator") {
      // Stavke za administratore
      roleSpecificItems = [
       /* <Menu.Item key="admin-dashboard">
          <Link to="/admin/dashboard">Admin Dashboard</Link>
        </Menu.Item>,
         <Menu.Item key="settings">
          <Link to="/admin/settings">Postavke</Link>
        </Menu.Item>, */
      ];
    } else if (role === "moderator") {
      // Stavke za moderatore
      roleSpecificItems = [
        <Menu.Item key="moderator-dashboard">
          <Link to="/moderator/dashboard">Moderator Dashboard</Link>
        </Menu.Item>,
      ];
    } else if (role === "user") {
      // Stavke za obične korisnike
      roleSpecificItems = [
        <Menu.Item key="user-dashboard">
          <Link to="/user/dashboard">Korisnički Dashboard</Link>
        </Menu.Item>,
      ];
    }

    // Dodaj sve ostale stavke iz main menu-a
    return [
      ...roleSpecificItems,
      ...menuItems.map((item, index) => (
        <Menu.Item key={index} className="h-14">
          <Link to={item.link}>{item.text}</Link>
        </Menu.Item>
      )),
    ];
  };

  const showDrawer = () => {
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
  };

  return (
    <div className="bg-transparent flex flex-row justify-between h-14 px-4">
      {role ? (
        <><div className="flex md:hidden text-black items-center" onClick={showDrawer}>
          <MenuFoldOutlined className="p-2 hover:bg-gray-200 hover:text-black rounded-md" />
        </div><Drawer
          title="Meni"
          placement="left"
          onClose={closeDrawer}
          open={drawerVisible}
          width="250px"
        >
            <Menu
              mode="inline"
              selectedKeys={[]}
              style={{ width: "100%" }}
            >
              {getMenuForRole()}
            </Menu>
          </Drawer>
          <div className="logo md:flex flex items-center text-black font-bold text-[18px]">
            <Link to={getNavbarBrandHref()}>
              Inventory Database
            </Link>
          </div>
          </>) : (<div></div>)
      }

      {/* User Avatar and Dropdown */}
      {role && (
        <><Menu
          className="bg-transparent hidden md:block h-14"
          mode="horizontal"
          selectedKeys={[]}
          style={{ flex: 1 }}
        >
          {getMenuForRole()}
        </Menu><div className="flex items-center">
            <Typography.Text className="hidden md:block" style={{ color: "black" }}>
              {genderGreeting(user.gender || "")} {user.surname}
            </Typography.Text>
            <Dropdown overlay={menu} placement="bottomRight">
              <Avatar
                shape="square"
                style={{ borderRadius: "12px" }}
                className="bg-primary ml-2 border-2 border-primary-300 p-4 cursor-pointer">
                {user.surname?.charAt(0)}
                {user.forname?.charAt(0)}
              </Avatar>
            </Dropdown>
          </div></>
      )}
    </div>
  );
};

export default MainMenu;
