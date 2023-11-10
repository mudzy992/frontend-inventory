import React from "react";
import { Card, Col, Container, Row, Badge, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import api, { ApiResponse } from '../../../API/api';
import Moment from 'moment';
import { Alert, Table, TableContainer, TableHead, TableRow, TableBody, TableCell, Link, List, ListSubheader, ListItemButton, ListItemIcon, ListItemText, Collapse } from "@mui/material";
import Paper from '@mui/material/Paper';
import FeaturesType from "../../../types/FeaturesType";
import { Redirect } from 'react-router-dom';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import saveAs from "file-saver";
import { ApiConfig } from "../../../config/api.config";
import DepartmentByIdType from "../../../types/DepartmentByIdType";
import ArticleType from "../../../types/ArticleType";
import UserType from "../../../types/UserType";
import { ExpandLess, ExpandMore, StarBorder } from "@mui/icons-material";

/* Obavezni dio komponente je state (properties nije), u kome definišemo konačno stanje komponente */
interface AdminUserProfilePageProperties {
    match: {
        params: {
            userID: number;
        }
    }
}

interface AdminUserProfilePageState {
    /* u ovom dijelu upisuje type npr. ako je kategorija je nekog tipa
    ako u nazivu tog typa stavimo upitnik, time kažemo da nije obavezno polje dolje ispod u konstruktoru */
    user?: UserType;
    users?: UserType;
    message: string;
    article: ArticleType[];
    features: FeaturesType[];
    isLoggedIn: boolean;
    departmentJobs: DepartmentByIdType[];
    open: string | null;
}

/* Ova komponenta je proširena da se prikazuje na osnovu parametara koje smo definisali iznad */
export default class AdminUserProfilePage extends React.Component<AdminUserProfilePageProperties> {
    state: AdminUserProfilePageState;

    constructor(props: Readonly<AdminUserProfilePageProperties>) {
        super(props);
        this.state = {
            message: "",
            article: [],
            features: [],
            isLoggedIn: true,
            departmentJobs: [],
            open: null,
        }
    }
    private setFeaturesData(featuresData: FeaturesType[]) {
        this.setState(Object.assign(this.state, {
            features: featuresData
        }))
    }

    private setUsers(userProfileDate: UserType | undefined) {
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

    private setDepartmentJobs(departmentJobsData: DepartmentByIdType[]) {
        this.setState(Object.assign(this.state, {
            departmentJobs: departmentJobsData
        }))
    }

    handleClick = (categoryName: string) => {
        this.setState((prevState: AdminUserProfilePageState) => ({
            open: prevState.open === categoryName ? null : categoryName,
        }));
    };

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
        api('api/user/' + this.props.match.params.userID, 'get', {}, 'administrator')
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

                const data: UserType = res.data;
                this.setErrorMessage('')
                this.setUsers(data)
            })
        api('api/article/?filter=user.userId||$eq||'
            + this.props.match.params.userID
            , 'get', {}, 'administrator')
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
                <Redirect to="/admin/login" />
            );
        }
        return (
            <div>
                <RoledMainMenu role='administrator' />
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

    private saveFile (docPath: any) {
        if(!docPath) {
            return (<div>
            <Button size='sm' style={{backgroundColor:"#9D5353"}}>
                <OverlayTrigger 
                placement="top"
                delay={{ show: 250, hide: 400 }}
                overlay={
                <Tooltip id="tooltip-prenosnica">Prenosnica nije generisana</Tooltip>
                }><i className="bi bi-file-earmark-text" style={{ fontSize: 20, color:"white" }}/></OverlayTrigger>
                </Button></div> )
        }
        if (docPath) {
            const savedFile = (docPath:any) => {
                saveAs(
                    ApiConfig.TEMPLATE_PATH + docPath,
                    docPath
                );
            }
            return (
                <Button size='sm' style={{backgroundColor:"#3A6351"}} onClick={() => savedFile(docPath)}>
                <i className="bi bi-file-earmark-text" style={{ fontSize: 20, color:"white" }}/></Button>
            )
    }
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
                                <TableCell>#</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.state.users?.articles?.map((ura, index) => (
                                <TableRow hover key={index}>
                                    <TableCell><Link href={`#/admin/user/${ura.serialNumber}`} style={{ textDecoration: 'none', fontWeight: 'bold' }} >{ura.stock?.name}</Link></TableCell>
                                    <TableCell>{ura.status}</TableCell>
                                    <TableCell>{Moment(ura.timestamp).format('DD.MM.YYYY. - HH:mm')}</TableCell>
                                    <TableCell>{ura.serialNumber}</TableCell>
                                    <TableCell>{this.saveFile(ura.documents?.map(docpath => (docpath.path)))}</TableCell>
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
                        {/* {this.articles()} */}
                        {this.artikliulisti()} 
                    </Row>
                   {   <Row style={{ padding: 5 }}>
                        {this.responsibilityArticlesOnUser()}
                    </Row>
                   }
                </Col>
            </Row>
        );
    }


    private artikliulisti() {
        const uniqueCategories = Array.from(new Set(this.state.article.map(artikal => artikal.category?.name)));

        return(
            <Card>
                <List
                sx={{
                    bgcolor: 'background.paper',
                    
                }}
                component="nav"
                aria-labelledby="nested-list-subheader"
                subheader={
                    <ListSubheader component="div" id="nested-list-subheader">
                    Zadužena oprema
                    </ListSubheader>
                    }>
                        {
                            uniqueCategories.map(categoryName => {
                                const categoryArticles = this.state.article.filter(artikal => artikal.category?.name === categoryName);

                                return (
                                    <><ListItemButton sx={{ width: '100%'}} onClick={() => categoryName && this.handleClick(categoryName)}>
                                        <ListItemIcon>
                                            <i className={categoryArticles[0]?.category?.imagePath} style={{ fontSize: 16 }} />
                                        </ListItemIcon>
                                        <ListItemText>{categoryName}</ListItemText> {this.state.open === categoryName ? <ExpandLess /> : <ExpandMore />}
                                    </ListItemButton>
                                    <Collapse in={this.state.open === categoryName} timeout="auto" unmountOnExit>
                                            <List component="div" disablePadding
                                            sx={{
                                                maxHeight:300,
                                                overflow: 'auto'
                                            }}
                                            >
                                            {categoryArticles.map(artikal => (
                                                <ListItemButton key={artikal.articleId} sx={{ pl: 4 }}>
                                                    <ListItemIcon>
                                                    <i className={categoryArticles[0]?.category?.imagePath} style={{ fontSize: 16 }} />
                                                    </ListItemIcon>
                                                    <ListItemText>{artikal.serialNumber}</ListItemText>
                                                </ListItemButton>
                                            ))}
                                            </List>
                                    </Collapse></>
                                );
                            })
                        }
                </List>
            </Card>
        )
        
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