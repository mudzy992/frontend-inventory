// MainMenu.tsx
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import React, { useState, useEffect } from "react";
import "./style.css";
import UserType from "../../types/UserType";
import api, { ApiResponse } from "../../API/api";
/* import { Container, Nav, Navbar } from 'react-bootstrap'; */

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
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [user, setUser] = useState<UserType>({});

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
        "api/user/" + menuUserId + "/mainmenu",
        "get",
        {},
        role,
      );

      const data: UserType = res.data || {}; // Ako nema podataka, postavi prazan objekat
      setUser(data);

      return data; // Vraćanje podataka o korisniku
    } catch (error) {
      console.error("Greška prilikom dohvatanja korisničkih podataka:", error);
      // Možete dodati dodatnu logiku ili obradu grešaka prema potrebi
      throw error; // Bacanje greške kako bi je mogle uhvatiti komponente koje koriste ovu funkciju
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getUserData();
      } catch (error) {
        console.error(
          "Greška prilikom dohvaćanja korisničkih podataka kroz useEffect:",
          error,
        );
      }
    };
    if (menuUserId !== undefined && role !== undefined) {
      fetchData();
    }
  }, [menuUserId, role]);

  const makeNavLink = (item: MainMenuItem, index: number) => (
    <NavbarItem key={index}>
      <Link key={index} href={item.link} className="text-white">
        {item.text}
      </Link>
    </NavbarItem>
  );

  const makeNavLinkToogle = (item: MainMenuItem, index: number) => (
    <NavbarMenuItem key={`${index}`}>
      <Link key={index} href={item.link} className="text-white">
        {item.text}
      </Link>
    </NavbarMenuItem>
  );

  const getNavbarBrandHref = () => {
    if (menuUserId === undefined || role === undefined) {
      return "#";
    } else {
      return role !== "user" ? "#" : `#/user/profile/${menuUserId}`;
    }
  };

  function combineFirstLetters(surname: string, forname: string) {
    const inicialLetters =
      surname.charAt(0).toUpperCase() + forname.charAt(0).toUpperCase();
    return inicialLetters;
  }

  function gender(gender: string) {
    let genderString;
    if (gender === "muško") {
      return (genderString = "Dobrodošao ");
    } else if (gender === "žensko") {
      return (genderString = "Dobrodošla ");
    }
    return genderString;
  }

  return (
    <>
      <Navbar
        classNames={{ wrapper: "max-w-[100%]" }}
        className="justify-normal"
        disableAnimation
        isBordered
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
      >
        <NavbarContent className="sm:hidden" justify="start">
          <NavbarMenuToggle
            aria-label={isMenuOpen ? "Zatvori meni" : "Otvori meni"}
          />
        </NavbarContent>
        <NavbarContent className="pr-3 sm:hidden " justify="center">
          <NavbarBrand className="justify-start">
            <i className="bi bi-incognito incognito-icon mr-2 bg-gradient-to-r from-amber-500 to-pink-500 bg-clip-text text-3xl text-transparent" />
            <Link
              href={getNavbarBrandHref()}
              className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent"
            >
              <span className="font-bold text-inherit">Inventory Database</span>{" "}
            </Link>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent className="hidden gap-4 sm:flex " justify="center">
          <NavbarBrand className="justify-start ">
            <i className="bi bi-incognito incognito-icon mr-2 bg-gradient-to-r from-amber-500 to-pink-500 bg-clip-text text-3xl text-transparent" />
            <Link
              href={getNavbarBrandHref()}
              className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent"
            >
              <span className="font-bold text-inherit">Inventory Database</span>{" "}
            </Link>
          </NavbarBrand>
          {menuItems.map(makeNavLink)}
        </NavbarContent>
        <NavbarContent as="div" justify="end">
          <span className="hidden text-small lg:inline">
            {gender(user.gender || "")} {user.surname}
          </span>
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                as="button"
                className="transition-transform"
                color="primary"
                name={combineFirstLetters(
                  user.surname || "",
                  user.forname || "",
                )}
                size="sm"
                isBordered
              >
                {" "}
              </Avatar>
            </DropdownTrigger>
            <DropdownMenu aria-label="Akcije profila" variant="flat">
              <DropdownItem
                key="profile"
                textValue="Profil"
                href={`#/user/profile/${userId}`}
              >
                <i className="bi bi-person-square" /> Profil
              </DropdownItem>
              <DropdownItem
                key="logout"
                textValue="Odjavi se"
                color="danger"
                href="#/logout"
              >
                <i className="bi bi-box-arrow-left" /> Odjevi se
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>
        <NavbarMenu>{menuItems.map(makeNavLinkToogle)}</NavbarMenu>
      </Navbar>
    </>
  );
};

export default MainMenu;
