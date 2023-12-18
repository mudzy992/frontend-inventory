// MainMenu.tsx
import {Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, DropdownItem, DropdownTrigger, Dropdown, DropdownMenu, Avatar, NextUIProvider, NavbarMenuToggle, NavbarMenu, NavbarMenuItem, Button} from "@nextui-org/react";
import React, { useState, useEffect } from 'react';
import './style.css'
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

  useEffect(() => {
    setMenuItems(items);
  }, [items]);

  useEffect(() => {
    setMenuUserId(userId);
  }, [userId]);

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
        <NavbarMenuToggle aria-label={isMenuOpen ? "Close menu" : "Open menu"} />
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
        <NavbarContent justify="end">
            <NavbarItem className="lg:flex">
              <Button as={Link} color="warning" href="#/logout" variant="flat">Odjavi se</Button>
            </NavbarItem>
        </NavbarContent>
       <NavbarMenu>
       {menuItems.map(makeNavLinkToogle)}
        {/* {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link
              className="w-full"
              color={
                index === 2 ? "warning" : index === menuItems.length - 1 ? "danger" : "foreground"
              }
              href={item.link}
              size="lg"
            >
              {item.text}
            </Link> 
          </NavbarMenuItem>
        ))}*/}
      </NavbarMenu> 
    </Navbar></>    
  );
};

export default MainMenu;
