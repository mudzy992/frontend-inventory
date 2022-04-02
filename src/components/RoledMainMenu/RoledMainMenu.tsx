import React from "react";
import { MainMenu, MainMenuItem } from '../MainMenu/MainMenu'

interface RoledMainMenuProperties {
    role: 'administrator' | 'user';
}

export default class RoledMainMenu extends React.Component<RoledMainMenuProperties> {
    render() {
        let items: MainMenuItem[] = [];

        switch (this.props.role) {
            case 'administrator': items = this.getAdministratorItems(); break;
            case 'user': items = this.getUserItems(); break;
        }

        return < MainMenu items={items} />
    }
    getUserItems(): MainMenuItem[] {
        return [
        ]
    }
    getAdministratorItems(): MainMenuItem[] {
        return [
            new MainMenuItem("Naslovna", "/"),
            new MainMenuItem("Dodaj", "/admin/article/"),
        ]
    }
}