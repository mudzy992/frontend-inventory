import React from "react";
import { Card, Col, Container, Row, Badge, Button, OverlayTrigger, Tooltip, Modal, Popover } from 'react-bootstrap';
import api, { ApiResponse } from '../../../API/api';
import Moment from 'moment';
import { Alert, Table, TableContainer, TableHead, TableRow, TableBody, TableCell, Link, Avatar, Stack } from "@mui/material";
import Paper from '@mui/material/Paper';
import ArticleByUserData from "../../../data/ArticleByUserData";
import ArticleByUserType from "../../../types/ArticleByUserType";
import ApiUserDto from "../../../dtos/ApiUserDto";
import FeaturesType from "../../../types/FeaturesType";
import { Redirect } from 'react-router-dom';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import saveAs from "file-saver";
import { ApiConfig } from "../../../config/api.config";
import DepartmentByIdType from "../../../types/DepartmentByIdType";
import EditUser from "../EditUser/EditUser";
import ArticleTimelineType from "../../../types/ArticleTimelineType";
import UserArticleType from "../../../types/UserArticleType";

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
    userArticle: UserArticleType[];
    articleTimeline: ArticleTimelineType[];
    articlesByUser: ArticleByUserData[];
    features: FeaturesType[];
    isLoggedIn: boolean;
    departmentJobs: DepartmentByIdType[];
    modal: {
        editUser:{
            visible: boolean,
        },
    }
}

/* Ova komponenta je proširena da se prikazuje na osnovu parametara koje smo definisali iznad */
export default class AdminUserProfilePage extends React.Component<AdminUserProfilePageProperties> {
    state: AdminUserProfilePageState;

    constructor(props: Readonly<AdminUserProfilePageProperties>) {
        super(props);
        this.state = {
            message: "",
            userArticle: [],
            articleTimeline: [],
            articlesByUser: [],
            features: [],
            isLoggedIn: true,
            departmentJobs: [],
            modal:{
                editUser: {
                    visible: false,
                },
            }
        }
    }
    private setFeaturesData(featuresData: FeaturesType[]) {
        this.setState(Object.assign(this.state, {
            features: featuresData
        }))
    }

    private setUserArticle(userArticleData: UserArticleType[]) {
        this.setState(Object.assign(this.state, {
            userArticle: userArticleData
        }))
    }

    private setArticleTimeline(articleTimelineData: ArticleTimelineType[]) {
        this.setState(Object.assign(this.state, {
            articleTimeline: articleTimelineData
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
            <Avatar sx={{ bgcolor: "#497174", boxShadow:"0px 0px 6px 3px #424747", width:150, height:150, fontSize: 50, marginBottom:2 }}>{surename.charAt(0) + '' + forname.charAt(0)}</Avatar>
        )
    }

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

        api('api/articleTimeline/?filter=userId||$eq||' + this.props.match.params.userID + '&filter=status||$eq||razduženo&sort=timestamp,DESC', 'get', {}, 'administrator')
            .then((res: ApiResponse) => {
                this.setArticleTimeline(res.data)
            })
        api('api/userArticle/?filter=userId||$eq||' + this.props.match.params.userID + '&sort=timestamp,DESC', 'get', {}, 'administrator')
            .then((res: ApiResponse) => {
                this.setUserArticle(res.data)
            })

        api('api/article/?filter=userArticles.userId||$eq||'
            + this.props.match.params.userID + '&filter=userArticles.status||$eq||zaduženo',
            'get', {}, 'administrator')
            .then((res: ApiResponse) => {
                const articleByUser: ArticleByUserType[] = res.data;
                this.setArticleByUser(articleByUser)
                const features: FeaturesType[] = [];

                for (const start of articleByUser) {
                    let value = "";
                    let articleId = start.articleId;
                    let name = '';
                    let featureId = 0;
                    let categoryId = start.categoryId;
                    for (const articleFeature of start.articleFeature) {
                        if(articleFeature.articleId === articleId) {
                            value = articleFeature.value;
                            featureId = articleFeature.featureId;
                            for (const feature of start.features) {
                                if (feature.featureId === articleFeature.featureId) {
                                    name = feature.name;
                                    categoryId = feature.categoryId;
                                    break;
                                }
                            }
                            features.push({ articleId, name, value, featureId, categoryId});
                        }
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
        const responsibilitiy: UserArticleType[] = this.state.userArticle.filter(ua => ua.status === 'zaduženo');
        if (responsibilitiy.length === 0) {
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
                            {responsibilitiy.map(ura => (
                                <TableRow hover>
                                <TableCell><Link href={`#/admin/userArticle/${ura.articleId}/${ura.serialNumber}`} style={{ textDecoration: 'none', fontWeight: 'bold' }} >{ura.article?.name}</Link></TableCell>
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
        if (this.state.articleTimeline.length === 0) {
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
                            {this.state.articleTimeline?.map(debt => (
                                <TableRow hover>
                                    <TableCell><Link href={`#/admin/userArticle/${debt.articleId}/${debt.serialNumber}`} style={{ textDecoration: 'none', fontWeight: 'bold' }}>{debt.article?.name}</Link></TableCell>
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
        const destroye: UserArticleType[] = this.state.userArticle.filter(ua => ua.status === 'otpisano');
        if (destroye.length === 0) {
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
                <TableContainer className="mb-3" style={{ maxHeight: 300, overflowY: 'auto' }} component={Paper}>
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
                            {destroye.map(ura => (
                                <TableRow hover>
                                <TableCell><Link href={`#/admin/userArticle/${ura.articleId}/${ura.serialNumber}`} style={{ textDecoration: 'none', fontWeight: 'bold' }} >{ura.article?.name}</Link></TableCell>
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

    private renderArticleData(user: ApiUserDto) {
        return (
            <>
                <Row className="mb-3">
                    <Col xs="12" lg="3" >
                    <Row className="mb-3">
                        <Col style={{display:"flex", justifyContent:"center"}} >
                        {this.Avatar(user.surname, user.forname)}
                        </Col>
                    </Row>
                    <Row>
                        <Col className="mb-3">
                            <ul className="list-group mb-3">
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
                    </Row>
                    </Col>
                    <Col>
                        <Row>
                            {this.articlesByUser()}
                        </Row>
                        <Row>
                            <Col className="mb-3">
                                {this.responsibilityArticlesOnUser()}
                            </Col>
                        </Row>
                        <Row >
                            <Col className="mb-3">
                                {this.debtArticlesOnUser()}
                            </Col>
                        </Row>
                        <Row>
                            <Col className="mb-3">
                                {this.destroyedArticlesOnUser()}
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </>
        );
    }

    private featurePopover (features: FeaturesType[], articleId: number) {
        return features.filter(x => x.articleId === articleId).map(ftr => (
            <>
            <li style={{display: "flex", alignItems:"flex-start", flexWrap:"wrap"}} className="list-group-item"><strong>{ftr.name}: </strong>{ftr.value}</li>
            </>
        ))
    }

    private articlesByUser() {
        return (           
            this.state.articlesByUser.map(artikal => (
                <>
               <Col className="mb-3" lg="3" xs="6">
                    <div style={{backgroundColor:"#316B83", padding:10, borderRadius:"0.375rem", boxShadow:"0px 0px 0px 5px #252d34"}}
                   
                   >
                            <Row style={{width:"auto", margin:"auto"}} >
                                <OverlayTrigger 
                                    placement="bottom"
                                    delay={{ show: 250, hide: 400 }}
                                    overlay={
                                    <Popover>
                                        <Popover.Body>
                                        <ul style={{width:"auto", margin:"auto"}}>                                        
                                            {this.featurePopover(this.state.features, artikal.articleId)}
                                        </ul>
                                    </Popover.Body>
                                    </Popover>
                                    }>
                                    <Badge pill bg="#344D67" style={{backgroundColor:"#344D67" , marginTop:-20, boxShadow:"1px 0px 5px 0px black"}} >
                                        <Stack>
                                            {artikal.category.name}
                                            <i style={{position:"absolute"}} className="bi bi-info-circle"  />  
                                        </Stack>
                                    </Badge>
                                </OverlayTrigger>
                            </Row>
                        <Stack 
                            direction="row"
                            justifyContent="flex-start"
                            alignItems="center"
                            spacing={1}
                            >
                                <div>
                                <i className={`${artikal.category.imagePath}`} style={{ fontSize: 40, color:"white" }}/>
                                </div>
                                <div>
                                    {
                                    Array.from(new Set(artikal.userArticles.map(s => s.articleId)))
                                    .sort()
                                    .map(articleId => {
                                        return (
                                            <>
                                            <div style={{ fontSize: 12, color: "white" }}>{artikal.name}</div>
                                            <div style={{ fontSize: 12, color: "white" }}>{artikal.userArticles.find(s => s.articleId === articleId)?.serialNumber}</div>
                                            </>
                                        )
                                    })
                                }
                                </div>
                        </Stack>
                    </div>
                </Col>
                </>
            )) 
            )
    }
}