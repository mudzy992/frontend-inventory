import React from "react";
import { Card, Col, Container, Row, Badge, Button, OverlayTrigger, Tooltip, Modal } from 'react-bootstrap';
import api, { ApiResponse } from '../../../API/api';
import Moment from 'moment';
import { Alert, Table, TableContainer, TableHead, TableRow, TableBody, TableCell, Link, Avatar } from "@mui/material";
import Paper from '@mui/material/Paper';
import ArticleByUserData from "../../../data/ArticleByUserData";
import ArticleByUserType from "../../../types/ArticleByUserType";
import ApiUserDto from "../../../dtos/ApiUserDto";
import ResponsibilityType from "../../../types/ResponsibilityType";
import DebtType from "../../../types/DebtType";
import DestroyedType from "../../../types/DestroyedType";
import FeaturesType from "../../../types/FeaturesType";
import { Redirect } from 'react-router-dom';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import saveAs from "file-saver";
import { ApiConfig } from "../../../config/api.config";
import DepartmentByIdType from "../../../types/DepartmentByIdType";
import EditUser from "../EditUser/EditUser";

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
    users?: ApiUserDto;
    message: string;
    responsibility: ResponsibilityType[];
    debt: DebtType[];
    destroyed: DestroyedType[];
    articlesByUser: ArticleByUserData[];
    features: FeaturesType[];
    isLoggedIn: boolean;
    departmentJobs: DepartmentByIdType[];
    modal: {
        editUser:{
            visible: boolean,
        }
    }
}

/* Ova komponenta je proširena da se prikazuje na osnovu parametara koje smo definisali iznad */
export default class AdminUserProfilePage extends React.Component<AdminUserProfilePageProperties> {
    state: AdminUserProfilePageState;

    constructor(props: Readonly<AdminUserProfilePageProperties>) {
        super(props);
        this.state = {
            message: "",
            responsibility: [],
            debt: [],
            destroyed: [],
            articlesByUser: [],
            features: [],
            isLoggedIn: true,
            departmentJobs: [],
            modal:{
                editUser: {
                    visible: false,
                }
            }
        }
    }
    private setFeaturesData(featuresData: FeaturesType[]) {
        this.setState(Object.assign(this.state, {
            features: featuresData
        }))
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

    private setUsers(userProfileDate: ApiUserDto | undefined) {
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

    private setLogginState(isLoggedIn: boolean) {
        const newState = Object.assign(this.state, {
            isLoggedIn: isLoggedIn,
        });
        this.setState(newState);
    }

    private async showEditModal() {
        this.setEditModalVisibleState(true)
    }

    private setEditModalVisibleState(newState: boolean) {
        this.setState(Object.assign(this.state.modal.editUser, {
                visible: newState,
            }));
    }

    /* KRAJ SET FUNCKIJA */

    /* GET I MOUNT FUNKCIJE ĆEMO DEFINISATI ISPOD RENDERA */
    componentDidMount() {
        /* Upisujemo funkcije koje se izvršavaju prilikom učitavanja stranice */
        this.getUserData()
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

    private Avatar(surename: string, forname: string) {
        return(
            <Avatar sx={{ bgcolor: "#497174", borderColor:"#EB6440", boderSize:5, width:150, height:150, fontSize: 50 }}>{surename.charAt(0) + '' + forname.charAt(0)}</Avatar>
        )
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

                const data: ApiUserDto = res.data;
                this.setErrorMessage('')
                this.setUsers(data)
            })
        /* Ova dva api su viška za debt i destroy jer sve to imam u api za article po user-u */
        api('api/userArticle/?filter=userId||$eq||' + this.props.match.params.userID + '&filter=status||$eq||razduženo' + '&sort=timestamp,DESC', 'get', {}, 'administrator')
            .then((res: ApiResponse) => {
                const debt: DebtType[] = res.data;
                this.setDebt(debt)
            })
        api('api/userArticle/?filter=userId||$eq||' + this.props.match.params.userID + '&filter=status||$eq||otpisano' + '&sort=timestamp,DESC', 'get', {}, 'administrator')
            .then((res: ApiResponse) => {
                const destroyed: DestroyedType[] = res.data;
                this.setDestroyed(destroyed)
            })
        api('api/userArticle/?filter=userId||$eq||' + this.props.match.params.userID + '&filter=status||$eq||zaduženo' + '&sort=timestamp,DESC', 'get', {}, 'administrator')
            .then((res: ApiResponse) => {
                const responsibility: ResponsibilityType[] = res.data;
                this.setResponsibility(responsibility)
            })
        /* api('api/departmentJob/?filter=users.userId||$eq||' + this.props.match.params.userID, 'get', {}, 'administrator')
            .then((res: ApiResponse) => {
                const departmentJobs: DepartmentByIdType[] = res.data;
                this.setDepartmentJobs(departmentJobs)
            }) */
        /* api('api/article/?filter=userArticles.userId||$eq||'
            + this.props.match.params.userID
            , 'get', {}, 'administrator')
            .then((res: ApiResponse) => {
                const articleByUser: ArticleByUserType[] = res.data;
                this.setArticleByUser(articleByUser)
                const features: FeaturesType[] = [];

                for (const start of articleByUser) {
                    for (const articleFeature of start.articleFeature) {
                        const value = articleFeature.value;
                        const articleId = articleFeature.articleId;
                        let name = '';

                        for (const feature of start.features) {
                            if (feature.featureId === articleFeature.featureId) {
                                name = feature.name;
                                break;
                            }
                        }
                        features.push({ articleId, name, value });
                    }
                }
                this.setFeaturesData(features);
            }
            ) */
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
            <>
                <RoledMainMenu role='administrator' />
                <Container style={{ marginTop: 20 }}>
                    <Card className="text-white bg-dark mb-3">
                        <Card.Header>
                            <Card.Title>
                                <Row style={{display:"flex", alignItems:"center"}}>
                                    <Col>
                                   {
                                    this.state.users ?
                                        this.state.users.fullname :
                                        'Kartica korisnika nije pronadjena'
                                    }
                                    </Col>
                                    <Col style={{display:"flex", flexDirection:"row-reverse"}}>
                                    <Button onClick={() => this.showEditModal()} > 
                                        Izmjeni</Button>
                                        <Modal size="lg" centered show={this.state.modal.editUser.visible} onHide={() => this.setEditModalVisibleState(false)}>
                                         <EditUser match={{
                                                    params: {
                                                        userId: this.props.match.params.userID
                                                    }
                                                }} />
                                        </Modal>
                                    </Col>
                                </Row>
                                
                            </Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <Card.Text>
                                {this.printOptionalMessage()}
                                {
                                    this.state.users ?
                                        (this.renderArticleData(this.state.users)) :
                                        ''
                                }
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Container>
            </>
        )
    }

    private saveFile (docPath: any) {
        if(!docPath) {
            return (<>
            <Button size='sm' style={{backgroundColor:"#9D5353"}}>
                <OverlayTrigger 
                placement="top"
                delay={{ show: 250, hide: 400 }}
                overlay={
                <Tooltip id="tooltip-prenosnica">Prenosnica nije generisana</Tooltip>
                }><i className="bi bi-file-earmark-text" style={{ fontSize: 20, color:"white" }}/></OverlayTrigger>
                </Button></> )
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
        if (this.state.responsibility.length === 0) {
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
                            {this.state.responsibility?.map(ura => (
                                <TableRow hover>
                                    <TableCell><Link href={`#/admin/userArticle/${ura.userId}/${ura.articleId}/${ura.serialNumber}`} style={{ textDecoration: 'none', fontWeight: 'bold' }} >{ura.article?.name}</Link></TableCell>
                                    <TableCell>{ura.status}</TableCell>
                                    <TableCell>{Moment(ura.timestamp).format('DD.MM.YYYY. - HH:mm')}</TableCell>
                                    <TableCell>{ura.serialNumber}</TableCell>
                                    <TableCell>{this.saveFile(ura.document?.path)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </>
        )
    }

    private debtArticlesOnUser() {
        if (this.state.debt.length === 0) {
            return (
                <>
                    <b>Razdužena oprema</b><br />
                    <Alert variant="filled" severity="info">Korisnik nema razdužene opreme</Alert>
                </>
            )
        }
        return (
            <>
                <b>Razdužena oprema</b><br />
                <TableContainer style={{ maxHeight: 300, overflowY: 'auto' }} component={Paper}>
                    <Table sx={{ minWidth: 700 }} aria-label="customized table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Naziv</TableCell>
                                <TableCell>Komentar</TableCell>
                                <TableCell>Datum razduženja</TableCell>
                                <TableCell>Serijski broj</TableCell>
                                <TableCell>#</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.state.debt?.map(debt => (
                                <TableRow hover>
                                    <TableCell><Link href={`#/admin/userArticle/${this.props.match.params.userID}/${debt.articleId}/${debt.serialNumber}`} style={{ textDecoration: 'none', fontWeight: 'bold' }}>{debt.article?.name}</Link></TableCell>
                                    <TableCell>{debt.comment}</TableCell>
                                    <TableCell>{Moment(debt.timestamp).format('DD.MM.YYYY. - HH:mm')}</TableCell>
                                    <TableCell>{debt.serialNumber}</TableCell>
                                    <TableCell>{this.saveFile(debt.document?.path)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </>
        )
    }

    private destroyedArticlesOnUser() {
        if (this.state.destroyed.length === 0) {
            return (
                <>
                    <b>Uništena oprema</b><br />
                    <Alert variant="filled" severity="info">Korisnik nema otpisane opreme</Alert>
                </>
            )
        }
        return (
            <>
                <b>Uništena oprema</b><br />
                <TableContainer style={{ maxHeight: 300, overflowY: 'auto' }} component={Paper}>
                    <Table sx={{ minWidth: 700 }} aria-label="custumuzed table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Naziv</TableCell>
                                <TableCell>Komentar</TableCell>
                                <TableCell>Datum uništenja</TableCell>
                                <TableCell>Serijski broj</TableCell>
                                <TableCell>#</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.state.destroyed?.map(destroyed => (
                                <TableRow hover>
                                    <TableCell><Link href={`#/admin/userArticle/${this.props.match.params.userID}/${destroyed.articleId}/${destroyed.serialNumber}`} style={{ textDecoration: 'none', fontWeight: 'bold' }} >{destroyed.article?.name}</Link></TableCell>
                                    <TableCell>{destroyed.comment}</TableCell>
                                    <TableCell>{Moment(destroyed.timestamp).format('DD.MM.YYYY. - HH:mm')}</TableCell>
                                    <TableCell>{destroyed.serialNumber}</TableCell>
                                    <TableCell>{this.saveFile(destroyed.document?.path)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </>
        )
    }

    private renderArticleData(user: ApiUserDto) {

        return (
            <>
                <Row>
                    <Col xs="12" lg="3" style={{ backgroundColor: "", padding: 5, paddingLeft: 5 }}>
                    <Row>
                        <Col style={{display:"flex", justifyContent:"center"}} className="mb-3">
                        {this.Avatar(user.surname, user.forname)}
                        </Col>
                    </Row>
                        <ul className="list-group">
                            <>
                                <li className="list-group-item active"><b>Detalji korisnika</b></li>
                                <li className="list-group-item">Ime: {user.surname}</li>
                                <li className="list-group-item">Prezime: {user.forname}</li>
                                <li className="list-group-item">Email: {user.email}</li>
                                <li className="list-group-item">Sektor: {user.department?.title}</li>
                                <li className="list-group-item">Radno mjesto: {user.job?.title}</li>
                                <li className="list-group-item">Lokacija: {user.location?.name}</li>
                                <li className="list-group-item">Broj lokala: {user.localNumber}</li>
                                <li className="list-group-item">Telefon: {user.telephone}</li>
                            </>
                        </ul>
                    </Col>
                    <Col xs="12" lg="9">
                        <Row>
                            {this.articlesByUser()}
                        </Row>
                        <Row style={{ padding: 5 }}>
                            {this.responsibilityArticlesOnUser()}
                        </Row>
                        <Row style={{ padding: 5 }}>
                            {this.debtArticlesOnUser()}
                        </Row>
                        <Row style={{ padding: 5 }}>
                            {this.destroyedArticlesOnUser()}
                        </Row>
                    </Col>
                </Row>
            </>
        );
    }

    private articlesByUser() {
        
        return (
            this.state.articlesByUser.map(artikal => (
                <>
                <Col lg="3" xs="6" style={{paddingTop: 5, paddingLeft:5}}>
                    <Card  text="dark" className="mb-3" style={{backgroundColor:"#316B83"}}>
                        <Card.Body style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <Badge pill bg="primary">
                                {artikal.category.name}
                            </Badge>{<div style={{ fontSize: 11, color:"white" }}>{artikal.name}</div>}
                            <i className={`${artikal.category.imagePath}`} style={{ fontSize: 52, color:"white" }}/>
                        </Card.Body>
                    </Card>
                    </Col>
                </>
            ))        
            )
    }
}