import React, { useState } from "react";
import { Button, Popover, List } from "antd";
import {
  DashboardOutlined,
  AppstoreAddOutlined,
  StarOutlined,
  ProfileOutlined,
  UserAddOutlined,
  FileTextOutlined,
  ApartmentOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./SpeedDial.css";

const actions = [
  {
    icon: <DashboardOutlined style={{ fontSize: "21px" }} />,
    name: "Dashboard",
    link: "/",
  },
  {
    icon: <AppstoreAddOutlined style={{ fontSize: "21px" }} />,
    name: "Artikli",
    link: "/admin/article",
  },
  {
    icon: <StarOutlined style={{ fontSize: "21px" }} />,
    name: "Osobine",
    link: "/admin/feature",
  },
  {
    icon: <ProfileOutlined style={{ fontSize: "21px" }} />,
    name: "Kategorije",
    link: "/admin/category",
  },
  {
    icon: <UserAddOutlined style={{ fontSize: "21px" }} />,
    name: "Korisnici",
    link: "/admin/user/",
  },
  {
    icon: <FileTextOutlined style={{ fontSize: "21px" }} />,
    name: "Dokumenti",
    link: "/admin/documents/",
  },
  {
    icon: <ApartmentOutlined style={{ fontSize: "21px" }} />,
    name: "Sektor/služba/odjeljenje",
    link: "/admin/department/",
  },
];

const SpeedDial: React.FC = () => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);

  const handleButtonClick = () => {
    setIsActive((prev) => !prev);
  };

  const content = (
    <List
      dataSource={actions}
      renderItem={(action) => (
        <List.Item>
          <Button
            type="text"
            className="flex w-full items-center justify-start"
            icon={action.icon}
            onClick={() => navigate(action.link)}
            style={{  gap: "10px" }}
          >
            {action.name}
          </Button>
        </List.Item>
      )}
    />
  );

  return (
    <Popover
      placement="topLeft"
      content={content}
      trigger="click"
      onOpenChange={handleButtonClick}
      overlayStyle={{
        position: "absolute",
        bottom: 92,
        right: 30,
      }}
      getPopupContainer={(trigger) => trigger.parentElement!} // Sprečava pomeranje
    >
      <Button
        type="primary"
        shape="circle"
        size="large"
        className={`speed-dial ${isActive ? "rotate-icon" : ""}`}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 1000,
          width: 60,
          height: 60,
          fontSize: "18px",
        }}
        icon={<PlusOutlined />}
      />
    </Popover>
  );
};

export default SpeedDial;
