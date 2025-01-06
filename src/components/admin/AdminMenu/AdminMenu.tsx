import { Button, Tooltip } from "@nextui-org/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminMenu = () => {
  const actions = [
    {
      icon: <i className="bi bi-stack" style={{ fontSize: "21px" }} />,
      name: "Dashboard",
      link: "/",
    },
    {
      icon: <i className="bi bi-database-add" style={{ fontSize: "21px" }} />,
      name: "Artikli",
      link: "/admin/article",
    },
    {
      icon: <i className="bi bi-list-stars" style={{ fontSize: "21px" }} />,
      name: "Osobine",
      link: "/admin/feature",
    },
    {
      icon: <i className="bi bi-card-checklist" style={{ fontSize: "21px" }} />,
      name: "Kategorije",
      link: "/admin/category",
    },
    {
      icon: (
        <i className="bi bi-person-plus-fill" style={{ fontSize: "21px" }} />
      ),
      name: "Korisnici",
      link: "/admin/user/",
    },
    {
      icon: <i className="bi bi-journal-text" style={{ fontSize: "21px" }} />,
      name: "Dokumenti",
      link: "/admin/documents/",
    },
    {
      icon: <i className="bi bi-building-add" style={{ fontSize: "21px" }} />,
      name: "Sektor/služba/odljenje",
      link: "/admin/department/",
    },
  ];

  const [isMenuVisible, setMenuVisible] = useState(false);
  const navigate = useNavigate();

  const handleMouseEnter = () => {
    setMenuVisible(true);
  };

  const handleMouseLeave = () => {
    setMenuVisible(false);
  };

  const toggleMenuVisibility = () => {
    setMenuVisible(!isMenuVisible);
  };

  const handleButtonClick = (link: string) => {
    navigate(link);
    setMenuVisible(false);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group fixed bottom-4 right-4"
    >
      {isMenuVisible && (
        <div
          id="speed-dial-menu-text-outside-button-square"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="mb-4 flex flex-col items-center space-y-2"
        >
          {actions.map((action, index) => (
            <Tooltip
              isOpen
              content={action.name}
              placement="left"
              showArrow
              key={index}
            >
              <Button
                key={index}
                onClick={() => handleButtonClick(action.link)}
                startContent={action.icon}
                className="relative h-[52px] w-[52px]"
                size="sm"
                radius="full"
                variant="shadow"
                color="secondary"
              ></Button>
            </Tooltip>
          ))}
        </div>
      )}

      <Button
        variant="shadow"
        color="primary"
        onClick={toggleMenuVisibility}
        className="flex h-14 w-14 items-center justify-center rounded-full"
      >
        <svg
          className="h-5 w-5 transition-transform group-hover:rotate-45"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 18 18"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 1v16M1 9h16"
          />
        </svg>
      </Button>
    </div>
  );
};

export default AdminMenu;
