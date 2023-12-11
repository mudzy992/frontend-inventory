import React from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { HashRouter, Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'jquery/dist/jquery.js';
import 'popper.js/dist/popper.js';
import 'bootstrap/dist/js/bootstrap.min.js';
import "bootstrap/js/src/collapse.js";
import 'bootstrap-icons/font/bootstrap-icons.css';
import './style.css'

export class MainMenuItem {
    text: string = "";
    link: string = "#";

    constructor(text: string, link: string) {
        this.text = text;
        this.link = link;
    }
}

interface MainMenuProperties {
    items: MainMenuItem[];
    userId?: number;
    role?: 'administrator' | 'user';
  }  
interface MainMenuState {
    items: MainMenuItem[];
    userId?: number;
}

export class MainMenu extends React.Component<MainMenuProperties> {
    state: MainMenuState;
    constructor(props: MainMenuProperties | Readonly<MainMenuProperties>) {
        super(props)
        this.state = {
            items: props.items,
        }
    }
    /* Kada god dođe do poziva setItems  */
    setItems(items: MainMenuItem[]) {
        /* i kada god se setuje novi state tj. novi items */
        /* tog trenutka gdje god se goristi state.items doći do promjene */
        this.setState({
            items: items
        })
    }

    setUserId(userID: number) {
        this.setState({
            userId: userID
        })
    }

    render() {
        return (
            <Navbar
                bg="dark"
                variant="dark"
                sticky="top"
                expand="lg"
                collapseOnSelect
            >
                <Container fluid >
                    <Navbar.Brand href={this.getNavbarBrandHref()} className="text-2x1"> <i className="bi bi-shop" /> Inventory Database</Navbar.Brand>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                    <Navbar.Collapse id="responsive-navbar-nav">
                        <Nav className='me-auto' >
                                {this.state.items.map(this.makeNavLink)}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        );
    }
    /* a može i ova varijanta */
    private makeNavLink(item: MainMenuItem, index: number) {
        return (
            <Link
                key={index}
                to={item.link}
                className="nav-link" >
                    {item.text}
            </Link>
        );
    }

    getNavbarBrandHref() {
        const { userId, role } = this.props;

        if (userId === undefined || role === undefined) {
        return "#";
        } else {
        return role === 'administrator' ? "#" : `#/user/profile/${userId}`;
        }
    }
}

/* Standardna jedna metoda kreiranja komponente */
/* Importi, export klase s nazivom, proširena sa React.Componentom, obavezni render i kod */
