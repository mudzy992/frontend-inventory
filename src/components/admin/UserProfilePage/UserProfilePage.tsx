import React from "react";
import { Card, Col, Container, Row, Button, OverlayTrigger, Tooltip, ThemeProvider, Tab, Nav, Form } from 'react-bootstrap';
import api, { ApiResponse } from '../../../API/api';
import Moment from 'moment';
import { Alert, Table, TableContainer, TableHead, TableRow, TableBody, TableCell, Link, List, ListSubheader, ListItemButton, ListItemIcon, ListItemText, Collapse, Avatar, FormControl, InputLabel, Input, TextField, Box, colors, Badge, InputAdornment, IconButton, FormHelperText } from "@mui/material";
import Paper from '@mui/material/Paper';
import FeaturesType from "../../../types/FeaturesType";
import { Redirect } from 'react-router-dom';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import saveAs from "file-saver";
import { ApiConfig } from "../../../config/api.config";
import DepartmentByIdType from "../../../types/DepartmentByIdType";
import ArticleType from "../../../types/ArticleType";
import UserType from "../../../types/UserType";
import { ColorLensOutlined, ExpandLess, ExpandMore, StarBorder, Visibility, VisibilityOff } from "@mui/icons-material";
import "./style.css";

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
    showPassword: boolean;
    editUser:{
        forname: string;
        surname: string;
        email: string;
        password: string;
        localNumber: number;
        telephone: string;
        jobId: number;
        departmentId: number;
        locationId: number;
        status: string;
        passwordHash: string;
        
    }
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
            showPassword: false,
            editUser: {
                forname: "",
                surname: "",
                email: "",
                password: "",
                localNumber: Number(),
                telephone: "",
                jobId: Number(),
                departmentId: Number(),
                locationId: Number(),
                status: "",
                passwordHash: "",
                
            }
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

    private setEditUserStringFieldState(fieldName: string, newValue: string) {
        this.setState(Object.assign(this.state,
            Object.assign(this.state.editUser, {
                [fieldName]: newValue,
            })))
    }

    private setEditUserNumberFieldState(fieldName: string, newValue: any) {
        this.setState(Object.assign(this.state,
            Object.assign(this.state.editUser, {
                [fieldName]: (newValue === 'null') ? null : Number(newValue),
            })))
    }

    /* HANDLE FUNKCIJE */

    handleClickShowPassword = () => {
        this.setState((prevState: AdminUserProfilePageState) => ({
          showPassword: !prevState.showPassword,
        }));
      };
    
      handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
      };

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
            <ThemeProvider
            fluid
                breakpoints={['xxxl', 'xxl', 'xl', 'lg', 'md', 'sm', 'xs', 'xxs']}
                minBreakpoint="xxs">
            <div>
                <RoledMainMenu role='administrator' />
                <Container style={{ marginTop: 15 }}>
                    <Card className="text-white bg-dark" >
                        
                            <Tab.Container id="left-tabs-example" defaultActiveKey="profile">
                                <Row>
                                    <Col lg={2} xs={2}>
                                    <Card.Body>
                                        <Nav variant='pills' className="nav-pills">
                                            <Nav.Item >
                                                <Nav.Link eventKey="profile"> <i className="bi bi-person-fill" /> Profile</Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item >
                                                <Nav.Link eventKey="articles"> <i className="bi bi-box-fill" /> Zaduženi artikli</Nav.Link>
                                            </Nav.Item>
                                        </Nav>
                                        </Card.Body>
                                    </Col>
                                    <Col lg={10} xs={10}>
                                        <Tab.Content>
                                        {this.printOptionalMessage()}
                                            <Tab.Pane eventKey="profile">{this.state.users ? (this.userData(this.state.users)): ''}</Tab.Pane>
                                            <Tab.Pane eventKey="articles">{this.articles()}</Tab.Pane>
                                        </Tab.Content>
                                    </Col>
                                </Row>
                            </Tab.Container>
                        
                    </Card>
                </Container>
            </div></ThemeProvider>
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

    private userData(user: UserType){
        const inicijali = `${user.surname?.charAt(0)}${user.forname?.charAt(0)}`;
        return (
            <Container fluid style={{borderRadius:"2px"}}>
            <Row>
                <Col className="mb" style={{display:"flex", flexDirection:"column", alignItems:"center",backgroundColor:"#3B5360", color:'white'}} lg={3} xs={3}>
                    <Avatar style={{fontSize:"80px", height:"150px", width:"150px", marginTop:"10px"}}>{inicijali}</Avatar>
                    <div style={{fontSize:"25px", fontWeight:"bold", marginTop:"5px"}}>{user.fullname}</div>
                    <div style={{fontSize:"14px"}}>{user.email}</div>
                    <div style={{fontSize:"14px"}}>{user.job?.title}</div>
                    <div style={{fontSize:"12px", marginTop:"20px", display:"flex", flexWrap:"wrap", flexDirection:"column", width:"100%"}}>
                        <div>
                        <i className="bi bi-calendar3" /> Posljednja prijava: {Moment(user.registrationDate).format('DD.MM.YYYY. - HH:mm')}
                        </div>
                        <div style={{marginBottom:"5px"}}>
                        <i className="bi bi-award" /> Status: {user.status}
                        </div>
                    </div>
                </Col>
                <Col lg={9} xs={9} className="text-dark bg-white" style={{borderTopRightRadius:"5px", borderBottomRightRadius:"5px"}}>
                    <Form style={{marginTop:'45px'}}>
                    <Box
                        component="form"
                        sx={{
                            '& > :not(style)': { m: 1 },
                        }}
                        noValidate
                        autoComplete="off"
                        >
                             <Row>
                                <Col lg={6} xs={12} className="mb-3">
                                    <TextField fullWidth  id="form-ime" label="Ime" variant="outlined" value={user.surname} onChange={(e) => this.setEditUserStringFieldState('surname', e.target.value)}/>
                                </Col>
                                <Col lg={6} xs={12} className="mb-3">
                                    <TextField fullWidth  id="form-prezime" label="Prezime" variant="outlined" value={user.forname} onChange={(e) => this.setEditUserStringFieldState('forname', e.target.value)}/>
                                </Col>
                            </Row>
                            <Row>
                                <Col lg={4} xs={12} className="mb-3">
                                    <TextField fullWidth  id="form-email" label="Email" variant="outlined" value={user.email} onChange={(e) => this.setEditUserStringFieldState('email', e.target.value)}/>
                                </Col>
                                <Col lg={4} xs={12} className="mb-3">
                                    <TextField fullWidth  id="form-telephone" label="Telefon" variant="outlined" value={user.telephone} onChange={(e) => this.setEditUserStringFieldState('telephone', e.target.value)}/>
                                </Col>
                                <Col lg={4} xs={12} className="mb-3">
                                    <TextField fullWidth  id="form-localnumber" label="Telefon/lokal" variant="outlined" value={user.localNumber} onChange={(e) => this.setEditUserNumberFieldState('localNumber', e.target.value)}/>
                                </Col>
                            </Row>

                            <Row>
                                <Col lg={4} xs={12} className="mb-3">
                                    <TextField fullWidth  id="form-email" label="Sektor/odjeljenje" variant="outlined" value={user.department?.title} onChange={(e) => this.setEditUserNumberFieldState('departmentId', e.target.value)}/>
                                </Col>
                                <Col lg={4} xs={12} className="mb-3">
                                    <TextField fullWidth  id="form-telephone" label="Radno mjesto" variant="outlined" value={user.job?.title} onChange={(e) => this.setEditUserNumberFieldState('jobId', e.target.value)}/>
                                </Col>
                                <Col lg={4} xs={12} className="mb-3">
                                    <TextField fullWidth  id="form-localnumber" label="Lokacija" variant="outlined" value={user.location?.name} onChange={(e) => this.setEditUserNumberFieldState('locationId', e.target.value)}/>
                                </Col>
                            </Row>

                            <Row>
                                <Col lg={4} xs={12} className="mb-3">
                                    <TextField fullWidth  id="form-email" label="Status" variant="outlined" value={user.status} onChange={(e) => this.setEditUserStringFieldState('status', e.target.value)}/>
                                </Col>
                                <Col lg={4} xs={12} className="mb-3">
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel htmlFor="outlined-adornment-password">Lozinka</InputLabel>
                                    <Input
                                        onChange={(e) => this.setEditUserStringFieldState('passwordHash', e.target.value)}
                                        id="outlined-adornment-password"
                                        type={this.state.showPassword ? 'text' : 'password'}
                                        endAdornment={
                                        <InputAdornment position="end">
                                            <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={this.handleClickShowPassword}
                                            onMouseDown={this.handleMouseDownPassword}
                                            edge="end"
                                            >
                                            {this.state.showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                        }
                                    />
                                    </FormControl>
                                   {/*  <TextField fullWidth  id="form-passwordHash" label="Status"  /> */}
                                </Col>
                                <Col lg={4} xs={12} className="mb-3">
                                    
                                </Col>
                            </Row>

                            <Row>
                                <Col lg={12} xs={12} style={{display:"flex", justifyContent:'flex-end'}} className="mb-3">
                                 <Button onClick={() => this.doEditUser()}>Snimi izmjene</Button>
                                </Col>
                            </Row>
                        </Box>
                    </Form>
                </Col>
            </Row>
         </Container>
        )
    }

    private doEditUser(){
        api('api/user/edit/' + this.props.match.params.userID, 'patch', {
            forname: this.state.editUser.forname,
            surname: this.state.editUser.surname,
            email: this.state.editUser.email,
            passwordHash: this.state.editUser.passwordHash,
            localNumber: this.state.editUser.localNumber,
            telephone: this.state.editUser.telephone,
            jobId: this.state.editUser.jobId,
            departmentId: this.state.editUser.departmentId,
            locationId: this.state.editUser.locationId,
            status: this.state.editUser.status,
        }, 'administrator')
            .then((res: ApiResponse) => {
                if (res.status === 'login') {
                    this.setLogginState(false)
                    return
                }
                this.getUserData()
            })
    }


    private articles() {
        const uniqueCategories = Array.from(new Set(this.state.article.map(artikal => artikal.category?.name)));
        return(
            <List
                sx={{
                    bgcolor: 'background.paper',
                    color:"black"
                }}
                component="nav"
                aria-labelledby="nested-list-subheader"
                subheader={
                <ListSubheader component="div" id="nested-list-subheader">
                    Zadužena oprema
                </ListSubheader>
            }>
                {uniqueCategories.map(categoryName => {
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
                                    <ListItemText>
                                        <TableContainer component={Paper}> 
                                            <Table>
                                                <TableHead>
                                                    <TableCell>Naziv</TableCell>
                                                    <TableCell>Serijski broj</TableCell>
                                                    <TableCell>Inventurni broj</TableCell>
                                                    <TableCell>Dokument</TableCell>
                                                </TableHead>
                                                {categoryArticles.map(artikal => (
                                                    <TableBody>
                                                        <TableCell>
                                                            {artikal.stock?.name}
                                                        </TableCell>
                                                        <TableCell>
                                                            {artikal.serialNumber}
                                                        </TableCell>
                                                        <TableCell>
                                                            {artikal.invNumber}
                                                        </TableCell>
                                                        <TableCell>
                                                            {this.saveFile(artikal.documents ? artikal.documents[0]?.path : 'N/A')}
                                                        </TableCell>
                                                    </TableBody>
                                                ))}
                                            </Table>
                                        </TableContainer>
                                    </ListItemText>
                                </List>
                            </Collapse></>
                        );
                    })
                }
            </List>
        )
    }
}