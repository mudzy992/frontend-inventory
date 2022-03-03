import React from "react";
import {Card, CardGroup, Col, Container, Row,  } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import api, { ApiResponse } from '../../API/api';
import { faListCheck } from "@fortawesome/free-solid-svg-icons";
import ApiUserProfileDto from "../../dtos/ApiUserProfileDto";
import Moment from 'moment';
import ResponsibilityType from "../../types/ResponsibilityType";
import DebtType from "../../types/DebtType";
import DestroyedType from "../../types/DestroyedType";
import { Alert, Table, TableContainer, TableHead, TableRow, TableBody, TableCell } from "@mui/material";
import Paper from '@mui/material/Paper';
import ArticleByUserData from "../../data/ArticleByUserData";
import ArticleByUserType from "../../types/ArticleByUserType";



/* Obavezni dio komponente je state (properties nije), u kome definišemo konačno stanje komponente */
interface UserProfilePageProperties {
    match: {
        params: {
            userID: number;
        }
    }
}

interface responsibilityData {
    articleId: number;
    name: string;
    value: number;
    status: string;
    timestamp: string;
    serialNumber: string;
}

interface debtData {
    articleId: number;
    name: string;
    value: number;
    comment: string;
    timestamp: string;
    serialNumber: string;
}

interface destroyedData {
    articleId: number;
    name: string;
    value: number;
    comment: string;
    timestamp: string;
    serialNumber: string;
}

interface UserProfilePageState {
    /* u ovom dijelu upisuje type npr. ako je kategorija je nekog tipa
    ako u nazivu tog typa stavimo upitnik, time kažemo da nije obavezno polje dolje ispod u konstruktoru */
    users?: ApiUserProfileDto;
    message: string;
    responsibility: responsibilityData[];
    debt: debtData[];
    destroyed: destroyedData[];
    articlesByUser: ArticleByUserData[];
}

/* Ova komponenta je proširena da se prikazuje na osnovu parametara koje smo definisali iznad */
export default class UserProfilePage extends React.Component<UserProfilePageProperties> {
    state: UserProfilePageState;

    constructor(props: Readonly<UserProfilePageProperties>){
        super(props);
        this.state = {
            message: "",
            responsibility: [],
            debt: [],
            destroyed: [],
            articlesByUser: [],
        }
    }

    private setResponsibility(responsibilityData: ResponsibilityType[]) {
        this.setState(Object.assign(this.state, {
            responsibility: responsibilityData
        }))
    }

    private setDebt(debtData: DebtType[]) {
        this.setState(Object.assign(this.state, {
            debt: debtData
        }))
    }

    private setDestroyed(destroyedData: DestroyedType[]) {
        this.setState(Object.assign(this.state, {
            destroyed: destroyedData
        }))
    }

    private setUsers(userProfileDate: ApiUserProfileDto | undefined) {
        this.setState(Object.assign(this.state, {
            users: userProfileDate
        }))
    }

    private setArticleByUser(articleByUserData: ArticleByUserType[]) {
        this.setState(Object.assign(this.state, {
            articlesByUser: articleByUserData
        }))
    }

    private setErrorMessage(message: string) {
        this.setState(Object.assign(this.state, {
            message: message,
        }));
    }

        /* KRAJ SET FUNCKIJA */

    /* GET I MOUNT FUNKCIJE ĆEMO DEFINISATI ISPOD RENDERA */
    componentDidMount(){
        /* Upisujemo funkcije koje se izvršavaju prilikom učitavanja stranice */
        this.getUserData()
        
    }

    componentDidUpdate(){
        /* Upisujemo logiku koja će se izvršavati nakon update (da se ne osvježava stalno stranica) */
        
    }

    private printOptionalMessage() {
        if (this.state.message === '') {
            return;
        }
        return (
            <Card.Text>
                { this.state.message }
            </Card.Text>
        );
    }

    /* Funkcija za dopremanje podataka, veza sa api-jem  
    api u većini slučajeva traži povratnu informaciju 3 parametra
    api('1', '2', '3'){} 
    1. ruta (provjeriti u backend), 
    2. method (onaj koji definišemo u api da koristimo get, post, patch, delete, update..) 
    3. body (ako je get tj. prazan body stavljamo {} a ako nije unutar {definišemo body}) */
    private getUserData () {
        api('api/user/' + this.props.match.params.userID, 'get', {} )
        .then((res: ApiResponse ) => {
            /* Nakon što se izvrši ruta, šta onda */
            if (res.status === 'error') {
                this.setUsers(undefined);
                this.setErrorMessage('Greška prilikom učitavanja kategorije. Osvježite ili pokušajte ponovo kasnije')
                return;
            }

            const data: ApiUserProfileDto = res.data;
            this.setErrorMessage('')
            this.setUsers(data)

            const responsibility : ResponsibilityType[] = [];
            for (const resArticles of data.responsibilityArticles) {
                const articleId = resArticles.articleId;
                const value = resArticles.value;
                const status = resArticles.status;
                const serialNumber = resArticles.serialNumber;
                const timestamp = resArticles.timestamp;

                let name = '';
                
                for (const article of data.articles) {
                    if(article.articleId === resArticles.articleId) {
                        name = article.name
                        break;
                    }
                }
                responsibility.push({articleId, name, value, status, timestamp, serialNumber})
            }
            this.setResponsibility(responsibility)
        })
        api('api/debtArticles/?filter=userId||$eq||' + this.props.match.params.userID, 'get', {} )
        .then((res:ApiResponse)=>{
            const debt : DebtType[] = res.data;
            this.setDebt(debt)
        })
        api('api/destroyedArticles/?filter=userId||$eq||' + this.props.match.params.userID, 'get', {} )
        .then((res:ApiResponse)=>{
            const destroyed : DestroyedType[] = res.data;
            this.setDestroyed(destroyed)
        })
        api('api/article/?join=userDetails&filter=userDetails.userId||$eq||' + this.props.match.params.userID, 'get', {} )
        .then((res:ApiResponse) => {
            const articleByUser : ArticleByUserType[] = res.data;
            this.setArticleByUser(articleByUser)
        })
    }
    
    /* KRAJ GET I MOUNT FUNKCIJA */

    render() {
        /* Prije povratne izvršenja returna možemo izvršiti neke provjere */
        /* kraj provjera */
        return(
            <Container style={{marginTop:20}}>
                <Card className="text-white bg-dark">
                    <Card.Header>
                        <Card.Title>
                            <FontAwesomeIcon icon={faListCheck}/> {
                                this.state.users ?
                                this.state.users?.surname + ' ' + this.state.users?.forname : 
                                'Article not found'
                            }
                        </Card.Title>
                    </Card.Header>
                <Card.Body>
                    <Card.Text>
                    { this.printOptionalMessage() }
                        {
                            this.state.users ?
                            ( this.renderArticleData(this.state.users) ) :
                            ''
                        }
                    </Card.Text>
                </Card.Body>
                </Card>
            </Container>
        )
    }

    private responsibilityArticlesOnUser () {
        if (this.state.responsibility.length === 0 ) {
            return (
                <>
                <b>Zadužena oprema</b><br />
                <Alert variant="filled" severity="info">Korisnik nema zadužene opreme</Alert>
                </>
            )
        }
        return (
            <>
            <b>Zadužena oprema</b><br />
            <TableContainer style={{maxHeight:300, overflowY: 'auto'}} component={Paper}>
                <Table sx={{ minWidth: 700}} stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>Naziv</TableCell>
                            <TableCell>Količina</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Datum zaduženja</TableCell>
                            <TableCell>Serijski broj</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {this.state.responsibility?.map(ura => (
                            <TableRow hover>
                                <TableCell>{ura.articleId}</TableCell>
                                <TableCell>{ura.name}</TableCell>
                                <TableCell>{ura.value}</TableCell>
                                <TableCell>{ura.status}</TableCell>
                                <TableCell>{Moment(ura.timestamp).format('DD.MM.YYYY. - HH:mm')}</TableCell>
                                <TableCell>{ura.serialNumber}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            </>
        )
    }

    private debtArticlesOnUser () {
        if (this.state.debt.length === 0){
            return (
                <>
                <b>Razdužena oprema</b><br />
                <Alert variant="filled" severity="info">Korisnik nema razdužene opreme</Alert>
                </>
            )
        }
        return(
            <>
            <b>Razdužena oprema</b><br />
            <TableContainer style={{maxHeight:300, overflowY: 'auto'}} component={Paper}>
                <Table sx={{ minWidth: 700 }} aria-label="customized table">
                    <TableHead>
                        <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>Naziv</TableCell>
                            <TableCell>Količina</TableCell>
                            <TableCell>Komentar</TableCell>
                            <TableCell>Datum razdužena</TableCell>
                            <TableCell>Serijski broj</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {this.state.debt?.map(debt => (
                            <TableRow hover>
                                <TableCell>{debt.articleId}</TableCell>
                                <TableCell>{debt.name}</TableCell>
                                <TableCell>{debt.value}</TableCell>
                                <TableCell>{debt.comment}</TableCell>
                                <TableCell>{Moment(debt.timestamp).format('DD.MM.YYYY. - HH:mm')}</TableCell>
                                <TableCell>{debt.serialNumber}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            </>
        )
    }

    private destroyedArticlesOnUser () {
        if (this.state.destroyed.length === 0 ) {
            return (
                <>
                <b>Uništena oprema</b><br />
                <Alert variant="filled" severity="info">Korisnik nema otpisane opreme</Alert>
                </>
            )
        }
        return(
        <>
        <b>Uništena oprema</b><br />
        <TableContainer style={{maxHeight:300, overflowY: 'auto'}} component={Paper}>
            <Table sx={{ minWidth: 700 }} aria-label="custumuzed table">
                <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Naziv</TableCell>
                        <TableCell>Količina</TableCell>
                        <TableCell>Komentar</TableCell>
                        <TableCell>Datum uništenja</TableCell>
                        <TableCell>Serijski broj</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {this.state.destroyed?.map(destroyed => (
                        <TableRow hover>
                            <TableCell>{destroyed.articleId}</TableCell>
                            <TableCell>{destroyed.name}</TableCell>
                            <TableCell>{destroyed.value}</TableCell>
                            <TableCell>{destroyed.comment}</TableCell>
                            <TableCell>{Moment(destroyed.timestamp).format('DD.MM.YYYY. - HH:mm')}</TableCell>
                            <TableCell>{destroyed.serialNumber}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
        </>
        )
    }

    private renderArticleData(user: ApiUserProfileDto) {
        return (
            <Row>
                <Col xs="12" lg="4" style={{ padding:5, paddingLeft:5}}>
                        <ul className="list-group">
                            <>
                            <li className="list-group-item active"><b>Detalji korisnika</b></li>
                            <li className="list-group-item">Ime: {user.surname}</li>
                            <li className="list-group-item">Prezime: {user.forname}</li>
                            <li className="list-group-item">Email: {user.email}</li>
                            <li className="list-group-item">Sektor: {user.department}</li>
                            <li className="list-group-item">Radno mjest: {user.jobTitle}</li>
                            <li className="list-group-item">Lokacija: {user.location}</li>
                            </> 
                        </ul>
                    <Row>
                    </Row>
                </Col>
                <Col xs="12" lg="8" >
                    <Row style={{padding: 5}}>
                      {this.articlesByUser()}  
                    </Row>
                    <Row style={{padding: 5}}>
                      {this.responsibilityArticlesOnUser()}  
                    </Row>
                    <Row style={{padding:5}}>
                      {this.debtArticlesOnUser()}  
                    </Row>
                    <Row style={{padding:5}}>
                     {this.destroyedArticlesOnUser()}   
                    </Row>
                </Col>
                
            </Row>
        );
    }

    private articlesByUser(){
        return (
                this.state.articlesByUser.map(kategorija => (
<>
                    {/* <CardGroup>
                        <Card>
                            <Card.Title>
                                {kategorija.category.name}
                            </Card.Title>
                        </Card>
                    </CardGroup> */}

                <Col xs lg="2" style={{maxWidth:150, height:150, display:'inherit'}}>
                    <Row style={{padding:5}}>
                        <Card bg="light" text="dark" className="mb-2">
                            <Card.Title>
                                {kategorija.category.name}
                            </Card.Title>
                        </Card>
                    </Row>
                </Col>
                 </>
            ))
        )
    }
}