import React from 'react';
import { Card, CardGroup, Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api, { ApiResponse } from '../../../API/api';
import CategoryType from '../../../types/CategoryType';
import { Redirect } from 'react-router-dom';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu'
import UserPage from '../UserPage/UserPage';


/* Obavezni dio komponente je state (properties nije), u kome definišemo konačno stanje komponente */
interface HomePageState {
    /* u ovom dijelu upisuje type npr. ako je kategorija je nekog tipa */
    categories: CategoryType[];
    isLoggedIn: boolean;
    message: string;
}

/* U većini slučajeva će biti potrebno napraviti DataTransferObjekat koji će raditi sa podacima,
gdje ćemo definisati da je neka veza primjerak tog DTO-a*/

interface CategoryDto {
    categoryId: number,
    name: string,
    imagePath: string,
}

/* Ova komponenta je proširena da se prikazuje na osnovu parametara koje smo definisali iznad */
export default class HomePage extends React.Component {
    state: HomePageState;

    constructor(props: Readonly<{}>) {
        super(props);
        this.state = {
            categories: [],
            isLoggedIn: true,
            message:'',
        }
    }

    /* SET FUNKCIJE ĆEMO DEFINISATI PRIJE RENDERA */
    private setLogginState(isLoggedIn: boolean) {
        const newState = Object.assign(this.state, {
            isLoggedIn: isLoggedIn,
        });

        this.setState(newState);
    }

    private setMessageState(message: string) {
        const newState = Object.assign(this.state, {
            message: message,
        });

        this.setState(newState);
    }

    private putCategoriesInState(data: CategoryDto[]) {
        const categories: CategoryType[] = data.map(category => {
            return {
                categoryId: category.categoryId,
                name: category.name,
                image: category.imagePath,
            }
        })
        const newState = Object.assign(this.state, {
            categories: categories
        })
        this.setState(newState)
    }

    /* KRAJ SET FUNCKIJA */

    render() {
        /* Prije povratne izvršenja returna možemo izvršiti neke provjere */
        if (this.state.isLoggedIn === false) {
            return (
                <Redirect to="/user/login" />
            );
        }
        /* kraj provjera */
        return (
            /* prikaz klijentu */
            <>
                <RoledMainMenu role='administrator'/>
                    <Container style={{marginTop: 15 }}>
                            <Card className="mb-3 text-white bg-dark">
                            <Card.Header>
                                <Card.Title>
                                <i className="bi bi-card-list" style={{fontSize:22}}/> Top level kategorije
                                </Card.Title>
                            </Card.Header>
                            <Card.Body>
                            <Row>
                                {/* Ako je korisnik ulogovan, prikazati spisak kategorija 
                            to smo uradili tako što smo mapirali jednu funkciju ispod*/}
                                {this.state.categories.map(this.singleCategory)}
                                <p>{this.state.message}</p>
                            </Row>
                            </Card.Body>
                            </Card>
                            <UserPage />
                    </Container>
            </>
        )
    }

    private singleCategory(category: CategoryType) {
        return (
            <Col lg="3" md="4" sm="6" xs="12">
                <CardGroup>
                <Card className="text-dark bg-light mb-3">
                    <Card.Header>
                        <Card.Title>
                            {category.name}
                        </Card.Title>
                    </Card.Header>
                    <Card.Body>
                        Ovjde će ići slika zvao se ja mudzy ili ne
                        {/* <Card.Img variant="top" src={ApiConfig.PHOTO_PATH + `${category.image}`} /> */}
                    </Card.Body>
                    <Card.Footer>
                        <small><Link to={`/category/${category.categoryId}`}
                            className='btn btn-primary btn-block btn-sm'>Prikaži kategoriju</Link></small>
                    </Card.Footer>
                </Card>
                </CardGroup>
            </Col>
        )
    }

    /* GET I MOUNT FUNKCIJE ĆEMO DEFINISATI ISPOD RENDERA */
    componentDidMount() {
        /* Upisujemo funkcije koje se izvršavaju prilikom učitavanja stranice */
        this.getCategories()
    }

    componentDidUpdate() {
        /* Upisujemo logiku koja će se izvršavati nakon update (da se ne osvježava stalno stranica) */
    }

    /* Funkcija za dopremanje podataka, veza sa api-jem  
    api u većini slučajeva traži povratnu informaciju 3 parametra
    api('1', '2', '3'){} 
    1. ruta (provjeriti u backend), 
    2. method (onaj koji definišemo u api da koristimo get, post, patch, delete, update..) 
    3. body (ako je get tj. prazan body stavljamo {} a ako nije unutar {definišemo body}) */
    private getCategories() {
        api('api/category/?filter=parentCategoryId||$isnull', 'get', {}, 'administrator')
            .then((res: ApiResponse) => {
                if (res.status === 'login') {
                    return this.setLogginState(false);
                }
                /* Nakon što se izvrši ruta, šta onda */
                this.putCategoriesInState(res.data)
            })
    }
} /* Kraj koda */
    /* KRAJ GET I MOUNT FUNKCIJA */