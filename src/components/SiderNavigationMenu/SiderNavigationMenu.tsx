import {  Menu } from "antd";
import { DashboardOutlined, AppstoreAddOutlined, FileTextOutlined, StarOutlined, ProfileOutlined, UserAddOutlined, ApartmentOutlined } from "@ant-design/icons";
import { useUserContext } from "../Contexts/UserContext/UserContext";

interface MenuProps {
    collapsed:boolean
}

const SiderNavigationMenu:React.FC<MenuProps> = ({collapsed}) => {
  const { role } = useUserContext(); 
  const adminMenu = [
    {
      icon: <DashboardOutlined />,
      name: "Dashboard",
      link: "#/"
    },
    {
      icon: <AppstoreAddOutlined  />,
      name: "Artikli",
      link: "#/admin/article"
    },
    {
      icon: <StarOutlined/>,
      name: "Osobine",
      link: "#/admin/feature"
    },
    {
      icon: <ProfileOutlined />,
      name: "Kategorije",
      link: "#/admin/category"
    },
    {
      icon: <UserAddOutlined />,
      name: "Korisnici",
      link: "#/admin/user/"
    },
    {
      icon: <FileTextOutlined />,
      name: "Dokumenti",
      link: "#/admin/documents/"
    },
    {
      icon: <ApartmentOutlined />,
      name: "Sektor/služba/odjeljenje",
      link: "#/admin/department/"
    }
  ];

  const commonMenu = [
    { text: "Početna", link: "/" }
  ];

  const renderMenuItems = (menu: any) => {
    return menu.map((item: any) => (
      <Menu.Item className="flex items-center justify-center" key={item.name} icon={item.icon}>
        <a href={item.link}>{item.name}</a>
      </Menu.Item>
    ));
  };

  return (
    <Menu
        inlineCollapsed={collapsed}
        className="mt-2"
        style={{
            border: "none",
        }}
        mode="inline" 
    >
        {role === "user" && renderMenuItems(commonMenu)}

        {(role === "administrator" || role === "moderator") && (
            <>
            {renderMenuItems(adminMenu)}
            </>
        )}
    </Menu>
  );
};

export default SiderNavigationMenu;
