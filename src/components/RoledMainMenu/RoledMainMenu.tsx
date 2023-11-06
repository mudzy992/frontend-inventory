import React from "react";
import { MainMenu, MainMenuItem } from '../MainMenu/MainMenu'

interface RoledMainMenuProperties {
    role: 'administrator' | 'user',
    userId?: number
}

export default class RoledMainMenu extends React.Component<RoledMainMenuProperties> {
    render() {
        let items: MainMenuItem[] = [];

        switch (this.props.role) {
            case 'administrator': items = this.getAdministratorItems(); break;
            case 'user': items = this.getUserItems(); break;
        }

        return <MainMenu items={items} />
    }
    getUserItems(): MainMenuItem[] {
        const {userId} = this.props; // ovaj dio oko preusmjeravanja ID ne radi kako treba
        return [
            new MainMenuItem("Naslovna", `/user/profile/${userId}`),
            new MainMenuItem("Log out", "/user/logout/"),
        ]
    }
    getAdministratorItems(): MainMenuItem[] {
        return [
            new MainMenuItem("Naslovna", "/"),
        ]
    }
}