import { Menu, MenuProps } from "antd";
import {
  FileDoneOutlined,
  AppstoreOutlined,
  CustomerServiceOutlined,
  GlobalOutlined,
  DashboardOutlined,
  FileTextOutlined,
  StarOutlined,
  ProfileOutlined,
  UserAddOutlined,
  ApartmentOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useUserContext } from "../../Contexts/UserContext/UserContext";
import { useLocation } from "react-router-dom";

interface SiderNavigationMenuProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

type MenuItem = Required<MenuProps>['items'][number];

const SiderNavigationMenu: React.FC<SiderNavigationMenuProps> = ({
  collapsed,
  setCollapsed,
}) => {
  const { role, userId } = useUserContext();
  const location = useLocation();
  const [selectedKey, setSelectedKey] = useState<string>("");

  const adminMenu: MenuItem[] = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: (
        <a rel="noopener noreferrer" href={'/#'}>
          Naslovna
        </a>
      ),
    },
    {
      type: "divider",
    },
    {
      key: "helpdesk",
      icon: <CustomerServiceOutlined />,
      label: (
        <a rel="noopener noreferrer" href={`#/admin/helpdesk`}>
          Helpdesk
        </a>
      ),
    },
    {
      key: "invoices",
      icon: <FileDoneOutlined />,
      label: (
        <a rel="noopener noreferrer" href={`#/admin/invoices`}>
          Fakture
        </a>
      ),
    },
    {
      key: "documents",
      icon: <FileTextOutlined />,
      label: (
        <a rel="noopener noreferrer" href={`#/admin/documents`}>
          Dokumenti
        </a>
      ),
    },
    {
      key: "article",
      icon: <AppstoreOutlined />,
      label: (
        <a rel="noopener noreferrer" href={`#/admin/article`}>
          Artikli
        </a>
      ),
      children: [
        {
          key: "article-add",
          label: (
            <a rel="noopener noreferrer" href={`#/admin/article/add`}>
              Dodaj novi artikal
            </a>
          ),
        },
      ],
    },
    {
      key: "feature",
      icon: <StarOutlined />,
      label: (
        <a rel="noopener noreferrer" href={`#/admin/feature`}>
          Osobine
        </a>
      ),
    },
    {
      key: "category",
      icon: <ProfileOutlined />,
      label: (
        <a rel="noopener noreferrer" href={`#/admin/category`}>
          Kategorije
        </a>
      ),
    },
    {
      key: "user",
      icon: <UserAddOutlined />,
      label: (
        <a rel="noopener noreferrer" href={`#/admin/user`}>
          Korisnici
        </a>
      ),
    },
    {
      key: "department",
      icon: <ApartmentOutlined />,
      label: (
        <a rel="noopener noreferrer" href={`#/admin/department`}>
          Sektori/službe/odjeljenja
        </a>
      ),
    },
    {
      type: "divider",
    },
    {
      key: "telecom",
      icon: <GlobalOutlined />,
      label: (
        <a rel="noopener noreferrer" href={`#/admin/telecom`}>
          Telekom priprema
        </a>
      ),
    },
  ];

  const commonMenu: MenuItem[] = [
    {
      key: "home",
      icon: <DashboardOutlined />,
      label: (
        <a rel="noopener noreferrer" href={`#/profile/${userId}`}>
          Početna
        </a>
      ),
    },
  ];

  useEffect(() => {
    const path = location.pathname;
    let key = "dashboard";
    if (path.startsWith("/admin/")) {
      key = path.split("/")[2] || "dashboard";
    } else if (path.startsWith("profile")) {
      key = "home";
    }
    setSelectedKey(key);
  }, [location]);

  const handleMenuClick = (e: { key: string }) => {
    setSelectedKey(e.key);
    setCollapsed(true);
  };

  return (
    <Menu
      inlineCollapsed={collapsed}
      className="mt-2 bg-[#141414] text-white"
      style={{
        border: "none",
      }}
      mode="inline"
      theme="dark"
      items={role === "user" ? commonMenu : adminMenu}
      selectedKeys={[selectedKey]} // Koristi `selectedKey` za selektovani meni
      onClick={handleMenuClick}
    />
  );
};

export default SiderNavigationMenu;
