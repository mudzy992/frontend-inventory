import {  Menu, MenuProps } from "antd";
import { FileDoneOutlined, AppstoreOutlined, CustomerServiceOutlined, GlobalOutlined, DashboardOutlined, AppstoreAddOutlined, FileTextOutlined, StarOutlined, ProfileOutlined, UserAddOutlined, ApartmentOutlined } from "@ant-design/icons";
import { useUserContext } from "../Contexts/UserContext/UserContext";
import { useEffect, useState } from "react";

interface MenuProp {
    collapsed:boolean
}

type MenuItem = Required<MenuProps>['items'][number];

const SiderNavigationMenu:React.FC<MenuProp> = ({collapsed}) => {
  const { role } = useUserContext(); 
  const [selectedKey, setSelectedKey] = useState<string>("");
  const adminMenu: MenuItem[] = [
    {
      key: "admin-dashboard",
      icon: <DashboardOutlined />,
      label: (
        <a
        rel="noopener noreferrer" 
        href={`#/`}>
        Naslovna
        </a>
      ),
    },
    {
      type: 'divider',
    },
    {
      key:"admin-helpdesk",
      icon: <CustomerServiceOutlined  />,
      label: (
        <a 
        rel="noopener noreferrer" 
        href={`#/admin/helpdesk`}>
        Helpdesk
        </a>
      )
    },
    {
      key:"admin-invoices",
      icon: <FileDoneOutlined  />,
      label: (
        <a 
        rel="noopener noreferrer" 
        href={`#/admin/invoices`}>
        Fakture
        </a>
      )
    },
    {
      key:"admin-documents",
      icon: <FileTextOutlined />,
      label: (
        <a 
        rel="noopener noreferrer" 
        href={`#/admin/documents`}>
        Dokumenti
        </a>
      )
    },
    {
      key:"admin-article",
      icon: <AppstoreOutlined  />,
      label: (
        <a 
        rel="noopener noreferrer" 
        href={`#/admin/article`}>
        Artikli
        </a>
      ),
      children:[
        {
          key:"admin-article-add",
          label: (
            <a 
            rel="noopener noreferrer" 
            href={`#/admin/article/add`}>
            Dodaj novi artikal
            </a>
          ),
        }
      ]
    },
    {
      key:"admin-feature",
      icon: <StarOutlined/>,
      label: (
        <a 
        rel="noopener noreferrer" 
        href={`#/admin/feature`}>
        Osobine
        </a>
      )
    },
    {
      key:"admin-category",
      icon: <ProfileOutlined />,
      label: (
        <a 
        rel="noopener noreferrer" 
        href={`#/admin/category`}>
        Kategorije
        </a>
      )
    },
    {
      key:"admin-user",
      icon: <UserAddOutlined />,
      label: (
        <a 
        rel="noopener noreferrer" 
        href={`#/admin/user`}>
        Korisnici
        </a>
      )
    },
    {
      key:"admin-department",
      icon: <ApartmentOutlined />,
      label: (
        <a 
        rel="noopener noreferrer" 
        href={`#/admin/department`}>
        Sektori/službe/odjeljenja
        </a>
      )
    },
    {
      type: 'divider',
    },
    {
      key:"admin-telecom",
      icon: <GlobalOutlined  />,
      label: (
        <a 
        rel="noopener noreferrer" 
        href={`#/admin/telecom`}>
        Telekom priprema
        </a>
      )
    },
  ];

  const commonMenu: MenuItem[] = [
    {
      key: "home",
      icon: <DashboardOutlined />,
      label: (
        <a 
        rel="noopener noreferrer" 
        href={`#/`}>
        Početna
        </a>
      ),
    }
  ];

  useEffect(() => {
    const path = window.location.hash.replace("#", ""); 
    if (path === "/") {
      setSelectedKey("admin-dashboard"); 
    } else {
      setSelectedKey(`admin-${path.split("/")[2]}` || "admin-dashboard");
    }
  }, [selectedKey]);

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    setSelectedKey(e.key);
  };

  return (
    <Menu
        inlineCollapsed={collapsed}
        className="mt-2"
        style={{
            border: "none",
        }}
        mode="inline"
        items={role === 'user' ? commonMenu : adminMenu}
        selectedKeys={[selectedKey]}
        onClick={handleMenuClick}
    />
  );
};

export default SiderNavigationMenu;
