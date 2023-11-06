import React from "react";
import { Card, Col, Container, Row, Badge } from 'react-bootstrap';
import api, { ApiResponse } from '../../../API/api';
import Moment from 'moment';
import { Alert, Table, TableContainer, TableHead, TableRow, TableBody, TableCell, Link } from "@mui/material";
import Paper from '@mui/material/Paper';
import ApiUserProfileDto from "../../../dtos/ApiUserProfileDto";
import FeaturesType from "../../../types/FeaturesType";
import { Redirect } from 'react-router-dom';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import UserType from "../../../types/UserType";
import ArticleType from "../../../types/ArticleType";
import DepartmentByIdType from "../../../types/DepartmentByIdType";


/* Obavezni dio komponente je state (properties nije), u kome definišemo konačno stanje komponente */
interface UserProfilePageProperties {
    match: {
        params: {
            userID: number;
        }
    }
}

interface UserProfilePageState {
    /* u ovom dijelu upisuje type npr. ako je kategorija je nekog tipa
    ako u nazivu tog typa stavimo upitnik, time kažemo da nije obavezno polje dolje ispod u konstruktoru */
    user?: UserType;
    users?: UserType;
    message: string;
    article: ArticleType[];
    features: FeaturesType[];
    isLoggedIn: boolean;
    departmentJobs: DepartmentByIdType[];
}

/* Ova komponenta je proširena da se prikazuje na osnovu parametara koje smo definisali iznad */
export default class UserProfilePage extends React.Component<UserProfilePageProperties> {
    state: UserProfilePageState;

    constructor(props: Readonly<UserProfilePageProperties>) {
        super(props);
        this.state = {
            message: "",
            article: [],
            features: [],
            isLoggedIn: true,
            departmentJobs: [],
        }
    }
    private setFeaturesData(featuresData: FeaturesType[]) {
        this.setState(Object.assign(this.state, {
            features: featuresData
        }))
    }

    private setUsers(userProfileDate: ApiUserProfileDto | undefined) {
        this.setState(Object.assign(this.state, {
            users: userProfileDate
        }))
    }

    private setArticleByUser(articleData: ArticleType[]) {
        this.setState(Object.assign(this.state, {
            article: articleData
        }))
    }

    private setErrorMessage(message: string) {
        this.setState(Object.assign(this.state, {
            message: message,
        }));
    }

    private setLogginState(isLoggedIn: boolean) {
        const newState = Object.assign(this.state, {
            isLoggedIn: isLoggedIn,
        });

        this.setState(newState);
    }

    /* KRAJ SET FUNCKIJA */

    /* GET I MOUNT FUNKCIJE ĆEMO DEFINISATI ISPOD RENDERA */
    componentDidMount() {
        /* Upisujemo funkcije koje se izvršavaju prilikom učitavanja stranice */
        this.getUserData()
    }

    componentDidUpdate() {
        /* Upisujemo logiku koja će se izvršavati nakon update (da se ne osvježava stalno stranica) */

    }

    private printOptionalMessage() {
        if (this.state.message === '') {
            return;
        }
        return (
            <Card.Text>
                {this.state.message}
            </Card.Text>
        );
    }

    /* Funkcija za dopremanje podataka, veza sa api-jem  
    api u većini slučajeva traži povratnu informaciju 3 parametra
    api('1', '2', '3'){} 
    1. ruta (provjeriti u backend), 
    2. method (onaj koji definišemo u api da koristimo get, post, patch, delete, update..) 
    3. body (ako je get tj. prazan body stavljamo {} a ako nije unutar {definišemo body}) */
    private getUserData() {
        api('api/user/' + this.props.match.params.userID, 'get', {}, 'user')
            .then((res: ApiResponse) => {
                /* Nakon što se izvrši ruta, šta onda */
                if (res.status === 'error') {
                    this.setUsers(undefined);
                    this.setErrorMessage('Greška prilikom učitavanja kategorije. Osvježite ili pokušajte ponovo kasnije')
                    return;
                }
                if (res.status === 'login') {
                    return this.setLogginState(false);
                }

                const data: ApiUserProfileDto = res.data;
                this.setErrorMessage('')
                this.setUsers(data)
            })
            api('api/article/?filter=user.userId||$eq||'
            + this.props.match.params.userID
            , 'get', {}, 'user')
            .then((res: ApiResponse) => {
                const articleByUser: ArticleType[] = res.data;
                this.setArticleByUser(articleByUser)
                const features: FeaturesType[] = [];

                for (const start of articleByUser) {
                    for (const articleFeature of start.stock?.stockFeatures || []) {
                        const value = articleFeature.value;
                        const articleId = articleFeature.feature?.articleId;
                        const name = articleFeature.feature?.name;

                        features.push({ articleId, name, value });
                    }
                }
                this.setFeaturesData(features);
            } 
        )
    }

    /* KRAJ GET I MOUNT FUNKCIJA */

    render() {
        /* Prije povratne izvršenja returna možemo izvršiti neke provjere */
        /* kraj provjera */
        if (this.state.isLoggedIn === false) {
            return (
                <Redirect to="/user/login" />
            );
        }
        return (
            <div>
                <RoledMainMenu role='user' userId={this.state.user?.userId} /> /* ovaj dio oko preusmjeravanja id ne radi kako treba */
                <Container style={{ marginTop: 20 }}>
                    <Card className="text-white bg-dark">
                        <Card.Header>
                            <Card.Title>
                                <i className="bi bi-card-checklist" /> {
                                    this.state.users ?
                                        this.state.users.fullname :
                                        'Kartica korisnika nije pronadjena'
                                }
                            </Card.Title>
                        </Card.Header>
                        <Card.Body> {this.printOptionalMessage()}
                                {
                                    this.state.users ?
                                        (this.renderArticleData(this.state.users)) :
                                        ''
                                }
                        </Card.Body>
                    </Card>
                </Container>
            </div>
        )
    }

    private responsibilityArticlesOnUser() {
        if (this.state.users?.articles?.length === 0) {
            return (
                <div>
                    <b>Zadužena oprema</b><br />
                    <Alert variant="filled" severity="info">Korisnik nema zadužene opreme</Alert>
                </div>
            )
        }
        return (
            <div>
                <b>Zadužena oprema</b><br />
                <TableContainer style={{ maxHeight: 300, overflowY: 'auto' }} component={Paper}>
                    <Table sx={{ minWidth: 700 }} stickyHeader aria-label="sticky table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Naziv</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Datum zaduženja</TableCell>
                                <TableCell>Serijski broj</TableCell>
                                <TableCell>Inventoruni broj broj</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.state.users?.articles?.map((ura, index) => (
                                <TableRow hover key={index}>
                                    <TableCell><Link href={`#/user/article/${ura.serialNumber}`} style={{ textDecoration: 'none', fontWeight: 'bold' }} >{ura.stock?.name}</Link></TableCell>
                                    <TableCell>{ura.status}</TableCell>
                                    <TableCell>{Moment(ura.timestamp).format('DD.MM.YYYY. - HH:mm')}</TableCell>
                                    <TableCell>{ura.serialNumber}</TableCell>
                                    <TableCell>{ura.invNumber}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        )
    }

    private renderArticleData(user: UserType) {
        return (
            <Row>
                <Col xs="12" lg="3" style={{ backgroundColor: "", padding: 5, paddingLeft: 5 }} key={user.userId}>
                    <ul className="list-group"  style={{ borderRadius: '--bs-card-border-radius', overflow: 'hidden' }}>
                        <div>
                            <li className="list-group-item active"><b>Detalji korisnika</b></li>
                            <li className="list-group-item">Ime: {user.surname}</li>
                            <li className="list-group-item">Prezime: {user.forname}</li>
                            <li className="list-group-item">Email: {user.email}</li>
                            <li className="list-group-item">Sektor: {user.department?.title}</li>
                            <li className="list-group-item">Radno mjesto: {user.job?.title}</li>
                            <li className="list-group-item">Lokacija: {user.location?.name}</li>
                        </div>
                    </ul>
                </Col>
                <Col xs="12" lg="9">
                    <Row >
                        {this.articles()}
                    </Row>
                   {   <Row style={{ padding: 5 }}>
                        {this.responsibilityArticlesOnUser()}
                    </Row>
                   }
                </Col>
            </Row>
        );
    }

    private articles() {
        
        return (
            this.state.article.map((artikal) => (
                
                    <Col lg="3" xs="6" style={{paddingTop: 5, paddingLeft:16}} key={artikal.articleId}>
                        <Card  text="dark" className="mb-3" style={{backgroundColor:"#316B83"}}>
                            <Card.Body style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <Badge pill bg="primary">
                                    {artikal.category?.name}
                                </Badge>{<div style={{ fontSize: 11, color:"white" }}>{artikal.stock?.name}</div>}
                                <i className={`${artikal.category?.imagePath}`} style={{ fontSize: 52, color:"white" }}/>
                            </Card.Body>
                        </Card>
                    </Col>
                
            )))
    }
}