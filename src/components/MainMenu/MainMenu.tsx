import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStoreAlt } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { HashRouter, Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'jquery/dist/jquery.js';
import 'popper.js/dist/popper.js';
import 'bootstrap/dist/js/bootstrap.min.js';
import "bootstrap/js/src/collapse.js";
import 'bootstrap-icons/font/bootstrap-icons.css';

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
}
interface MainMenuState {
    items: MainMenuItem[];
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

    render() {
        return (
            <Navbar
                bg="dark"
                variant="dark"
                sticky="top"
                expand="lg"
                collapseOnSelect
            >
                <Container>
                    <Navbar.Brand href="#"> <FontAwesomeIcon icon={faStoreAlt} /> Inventory Database</Navbar.Brand>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                    <Navbar.Collapse id="responsive-navbar-nav">
                        <Nav className='me-auto' >
                            <HashRouter>
                                {this.state.items.map(this.makeNavLink)}
                            </HashRouter>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        );
    }
    /* a može i ova varijanta */
    private makeNavLink(item: MainMenuItem) {
        return (
            <Link to={item.link}
                className="nav-link" >{item.text}</Link>
        );
    }
}

/* Standardna jedna metoda kreiranja komponente */
/* Importi, export klase s nazivom, proširena sa React.Componentom, obavezni render i bubaš kod */