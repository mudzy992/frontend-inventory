// MainMenu.tsx
import {Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, NavbarMenuToggle, NavbarMenu, NavbarMenuItem, Button, Avatar, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from "@nextui-org/react";
import React, { useState, useEffect } from 'react';
import './style.css'
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
  role?: 'administrator' | 'user';
}

const MainMenu: React.FC<MainMenuProps> = ({ items, userId, role }) => {
  const [menuItems, setMenuItems] = useState<MainMenuItem[]>(items);
  const [menuUserId, setMenuUserId] = useState<number | undefined>(userId);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [user, setUser] = useState<UserType>({})

  useEffect(() => {
    setMenuItems(items);
  }, [items]);

  useEffect(() => {
    setMenuUserId(userId);
  }, [userId]);

  const getUserData = async () => {
    try {
      const res: ApiResponse = await api('api/user/' + menuUserId, 'get', {}, role);
  
      const data: UserType = res.data || {}; // Ako nema podataka, postavi prazan objekat
      setUser(data);
  
      return data; // Vraćanje podataka o korisniku
    } catch (error) {
      console.error('Greška prilikom dohvatanja korisničkih podataka:', error);
      // Možete dodati dodatnu logiku ili obradu grešaka prema potrebi
      throw error; // Bacanje greške kako bi je mogle uhvatiti komponente koje koriste ovu funkciju
    }
  };
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getUserData();
      } catch (error) {
        console.error('Greška prilikom dohvaćanja korisničkih podataka kroz useEffect:', error);
      }
    };
  
    fetchData();
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
      return '#';
    } else {
      return role === 'administrator' ? '#' : `#/user/profile/${menuUserId}`;
    }
  };

  return (
    <>
    <Navbar 
    classNames={{wrapper:'max-w-[100%]'}} 
    className="justify-normal" 
    disableAnimation
    isBordered
    isMenuOpen={isMenuOpen}
    onMenuOpenChange={setIsMenuOpen}
      >
      <NavbarContent className="sm:hidden" justify="start">
        <NavbarMenuToggle aria-label={isMenuOpen ? "Zatvori meni" : "Otvori meni"} />
      </NavbarContent>
      <NavbarContent className="sm:hidden pr-3" justify="center">
        <NavbarBrand className="justify-start">
          <i className="bi bi-shop mr-2 text-xl" />
          <Link href={getNavbarBrandHref()} className="text-white"><span className="font-bold text-inherit">Inventory Database</span>   </Link>
        </NavbarBrand>
      </NavbarContent>
        
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarBrand className="justify-start">
          <i className="bi bi-shop mr-2 text-xl" />
          <Link href={getNavbarBrandHref()} className="text-white"><span className="font-bold text-inherit">Inventory Database</span>   </Link>
        </NavbarBrand>
           {menuItems.map(makeNavLink)}
      </NavbarContent>
      <NavbarContent as="div" justify="end">
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            {/* <Avatar
              isBordered
              as="button"
              className="transition-transform"
              color="secondary"
              name="Jason Hughes"
              size="sm"
              src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
            /> */}
            <Avatar className="ikonica" isBordered > </Avatar>
          </DropdownTrigger>
          <DropdownMenu aria-label="Akcije profila" variant="flat">
            <DropdownItem key="profile" textValue="Profil" className="h-14 gap-2">
              <p className="font-semibold">Prijavljeni kao</p>
              <p className="font-semibold">{user.fullname ? (user.fullname) : ('Admin')}</p>
            </DropdownItem>
            <DropdownItem key="logout" textValue="Odjavi se" color="danger" href="#/logout">
            <i className="bi bi-box-arrow-left" /> Odjevi se
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
        {/* <NavbarContent justify="end">
            <NavbarItem className="lg:flex">
              
            </NavbarItem>
        </NavbarContent> */}
       <NavbarMenu>
       {menuItems.map(makeNavLinkToogle)}
      </NavbarMenu> 
    </Navbar></>    
  );
};

export default MainMenu;
