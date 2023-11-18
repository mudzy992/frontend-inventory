import React from "react";
import { Card, Col, Container, Row, Button, OverlayTrigger, Tooltip, ThemeProvider, Tab, Nav, Form } from 'react-bootstrap';
import api, { ApiResponse } from '../../../API/api';
import { Table, TableContainer, TableHead, TableBody, TableCell, List, ListSubheader, ListItemButton, ListItemIcon, ListItemText, 
            Collapse, Avatar, FormControl, InputLabel, TextField, Box, InputAdornment, IconButton, Select, MenuItem, OutlinedInput } from "@mui/material";
import Paper from '@mui/material/Paper';
import FeaturesType from "../../../types/FeaturesType";
import { Link, Redirect } from 'react-router-dom';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import saveAs from "file-saver";
import { ApiConfig } from "../../../config/api.config";
import DepartmentByIdType from "../../../types/DepartmentByIdType";
import ArticleType from "../../../types/ArticleType";
import UserType from "../../../types/UserType";
import { ExpandLess, ExpandMore, Visibility, VisibilityOff } from "@mui/icons-material";
import "./style.css";
import LocationType from "../../../types/LocationType";
import DepartmentType from "../../../types/DepartmentType";
import JobType from "../../../types/JobType";

/* Obavezni dio komponente je state (properties nije), u kome definišemo konačno stanje komponente */
interface AdminUserProfilePageProperties {
    match: {
        params: {
            userID: number;
        }
    }
}

interface LocationDto {
    locationId: number;
    name: string;
    code: string;
    parentLocationId: number;
}

interface JobBaseType {
    jobId: number;
    title: string;
    jobCode: string;
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
        localNumber: string;
        telephone: string;
        jobId: number;
        departmentId: number;
        locationId: number;
        status: string;
        passwordHash: string;
    },
    location: LocationType[];
    department: DepartmentType[];
    job: JobType[];
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
                localNumber:"",
                telephone: "",
                jobId: Number(),
                departmentId: Number(),
                locationId: Number(),
                status: "",
                passwordHash: "", 
            },
            location: [],
            department: [],
            job: [],
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

    private setLocation(location: LocationDto[]) {
        const locData: LocationType[] = location.map(details => {
            return {
                locationId: details.locationId,
                code: details.code,
                name: details.name,
                parentLocationId: details.parentLocationId,
            }
        })
        this.setState(Object.assign(this.state, {
            location: locData,
        }))
    }

    private setDepartment(department: DepartmentType) {
        this.setState(Object.assign(this.state, {
            department: department,
        }))
    }

    private setJob(job: JobType) {
        this.setState(Object.assign(this.state, {
            job: job,
        }))
    }

    private async addJobDepartmentChange(event: React.ChangeEvent<HTMLSelectElement>) {
        this.setEditUserNumberFieldState('departmentId', event.target.value);

        const jobs = await this.getJobsByDepartmentId(this.state.editUser.departmentId);
        const stateJobs = jobs.map(job => ({
            jobId: job.jobId,
            title: job.title,
            jobCode: job.jobCode
        }));

        this.setState(Object.assign(this.state,
            Object.assign(this.state, {
                job: stateJobs,
            }),
        ));
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
            .then(() => {
                // Nakon što se getUserData završi, možete sigurno pristupiti this.state.users
                this.getData();
                this.getArticleData()
                this.getJobsByDepartmentId(this.state.users?.departmentId ?? 0)
                    .then(jobs => {
                        this.setState({ job: jobs });
    
                        // Ako je trenutni department isti kao početni, ažurirajte state još jednom
                        if (this.state.users?.departmentId === this.state.editUser.departmentId) {
                            this.setState({ job: jobs });
                        }
                    })
                    .catch(error => {
                        console.error('Greška prilikom dohvaćanja radnih mesta:', error);
                    });
            });
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
        return new Promise<void>((resolve) => {
            api('api/user/' + this.props.match.params.userID, 'get', {}, 'administrator')
                .then((res: ApiResponse) => {
                    if (res.status === 'error') {
                        this.setUsers(undefined);
                        this.setErrorMessage('Greška prilikom učitavanja kategorije. Osvježite ili pokušajte ponovo kasnije')
                        resolve();
                        return;
                    }
                    if (res.status === 'login') {
                        this.setLogginState(false);
                        resolve();
                        return;
                    }
    
                    const data: UserType = res.data;
                    this.setErrorMessage('');
                    this.setUsers(data);
                    this.putUserDetailsInState(res.data);
                    resolve();
                });
        });
        
    }

    private getArticleData(){
            api('api/article/?filter=user.userId||$eq||'
            + this.props.match.params.userID
            , 'get', {}, 'administrator')
            .then((res: ApiResponse) => {
                if (res.status === 'login') {
                    return this.setLogginState(false);
                }

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

    private getData(){
        api('api/location?sort=name,ASC', 'get', {}, 'administrator')
        .then(async (res: ApiResponse) => {
            if(res.status === 'error') {
                this.setErrorMessage('Greška prilikom hvatanja lokacija')
            }
            if(res.status === 'login') {
                return this.setLogginState(false)
            }
            this.setLocation(res.data)
        })

        api('api/department?sort=title,ASC', 'get', {}, 'administrator')
        .then(async (res: ApiResponse) => {
            if(res.status === 'error') {
                this.setErrorMessage('Greška prilikom hvatanja sektora i odjeljenja')
            }
            if (res.status === 'login') {
                return this.setLogginState(false);
            }
            this.setDepartment(res.data)
        })
    }

    private async getJobsByDepartmentId(departmentId: number): Promise<JobBaseType[]> {
        return new Promise(resolve => {
            api('api/job/?filter=departmentJobs.departmentId||$eq||' + departmentId + '/&sort=title,ASC', 'get', {}, 'administrator')
            .then((res : ApiResponse) => {
            if(res.status === 'error') {
                this.setErrorMessage('Greška prilikom hvatanja radnih mjesta')
            }
            if (res.status === 'login') {
                return this.setLogginState(false);
            }

            /* this.setJob(res.data) */

            const jobs: JobBaseType[] = res.data.map((item: any) => ({
                jobId: item.jobId,
                title: item.title,
                jobCode: item.jobCode
            }))
            resolve(jobs)
        })
    })      
    }


    private async putUserDetailsInState(user: UserType){
        this.setEditUserStringFieldState('forname', String(user.forname))
        this.setEditUserStringFieldState('surname', String(user.surname))
        this.setEditUserStringFieldState('email', String(user.email))
        this.setEditUserStringFieldState('passwordHash', String(user.passwordHash))
        this.setEditUserStringFieldState('localNumber', String(user.localNumber))
        this.setEditUserStringFieldState('telephone', String(user.telephone))
        this.setEditUserNumberFieldState('jobId', Number(user.jobId))
        this.setEditUserNumberFieldState('departmentId', Number(user.departmentId))
        this.setEditUserNumberFieldState('locationId', Number(user.locationId))
        this.setEditUserStringFieldState('status', String(user.status))
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

        let lastActivityText;
        if(user.lastLoginDate){
            const currentDateTime = new Date();
            const lastLoginDateTime = new Date(user.lastLoginDate);
            if (!isNaN(currentDateTime.getTime()) && !isNaN(lastLoginDateTime.getTime())) {
                const timeDifference = currentDateTime.getTime() - lastLoginDateTime.getTime();
                const minutesDifference = Math.floor(timeDifference / (1000*60));
                const hoursDifference = Math.floor(timeDifference / (1000*60*60));
                const dayDifference = Math.floor(timeDifference / (1000*60*60*24));
                if (minutesDifference < 1) {
                    lastActivityText = `Posljednja aktivnost: prije manje od minut!`
                }else if(minutesDifference < 60) {
                    lastActivityText = `Posljednja aktivnost: prije ${minutesDifference} minuta`
                } else if (hoursDifference < 60) {
                    lastActivityText = `Posljednja aktivnot: prije ${hoursDifference} sati i ${minutesDifference % 60} minuta`
                } else {
                    lastActivityText = `Posljednja aktivnost: prije ${dayDifference} dana i ${hoursDifference % 24} sati`
                }
            } else {
                lastActivityText = 'Neispravan datum i vrijeme!'
            }
        } else {
            lastActivityText = 'Nema prijava!'
        }
        
        return (
            <Container fluid>
            <Row>
                <Col className="user-container" lg={3} xs={3}>
                    <div className="mb-3 user-container details">
                        <Avatar className="avatar">{inicijali}</Avatar>
                        <div style={{fontSize:"25px", fontWeight:"bold", marginTop:"5px"}}>{user.fullname}</div>
                        <div style={{fontSize:"14px"}}>{user.email}</div>
                        <div style={{fontSize:"14px"}}>{user.job?.title}</div>
                        <div className="activity-status">
                            <div>
                                <i className="bi bi-calendar3" /> {lastActivityText}
                            </div>
                            <div style={{marginBottom:"5px"}}>
                                <i className="bi bi-award" /> Status: {user.status}
                            </div>
                        </div>
                    </div>
                </Col>
                <Col lg={9} xs={9} className="text-dark bg-white card-radius-container">
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
                                    <TextField fullWidth  id="form-ime" label="Ime" variant="outlined" value={this.state.editUser.surname} onChange={(e) => this.setEditUserStringFieldState('surname', e.target.value)}/>
                                </Col>
                                <Col lg={6} xs={12} className="mb-3">
                                    <TextField fullWidth  id="form-prezime" label="Prezime" variant="outlined" value={this.state.editUser.forname} onChange={(e) => this.setEditUserStringFieldState('forname', e.target.value)}/>
                                </Col>
                            </Row>
                            <Row>
                                <Col lg={4} xs={12} className="mb-3">
                                    <TextField fullWidth  id="form-email" label="Email" variant="outlined" value={this.state.editUser.email} onChange={(e) => this.setEditUserStringFieldState('email', e.target.value)}/>
                                </Col>
                                <Col lg={4} xs={12} className="mb-3">
                                    <TextField fullWidth  id="form-telephone" label="Telefon" variant="outlined" value={this.state.editUser.telephone} onChange={(e) => this.setEditUserStringFieldState('telephone', e.target.value)}/>
                                </Col>
                                <Col lg={4} xs={12} className="mb-3">
                                    <TextField fullWidth  id="form-localnumber" label="Telefon/lokal" variant="outlined" value={this.state.editUser.localNumber} onChange={(e) => this.setEditUserStringFieldState('localNumber', e.target.value)}/>
                                </Col>
                            </Row>

                            <Row>
                                <Col lg={6} xs={12} className="mb-3">
                                    <FormControl fullWidth>
                                        <InputLabel id="form-select-department-label">Sektor/odjeljenje</InputLabel>
                                        <Select
                                            labelId="form-select-department-label"
                                            id="form-select-department"
                                            value={this.state.editUser.departmentId.toString()}
                                            label="Sektor/odjeljenje"
                                            onChange={e => {this.setEditUserNumberFieldState('departmentId', e.target.value); this.addJobDepartmentChange(e as any)}}>
                                                {this.state.department.map((department, index) => (
                                                    <MenuItem key={index} value={department.departmentId?.toString()}>{department.title}</MenuItem>
                                                ))}
                                        </Select>
                                    </FormControl>
                                </Col>
                                <Col lg={6} xs={12} className="mb-3">
                                    <FormControl fullWidth>
                                        <InputLabel id="form-select-job-label">Radno mjesto</InputLabel>
                                        <Select
                                            labelId="form-select-job-label"
                                            id="form-select-job"
                                            value={this.state.editUser.jobId.toString()}
                                            label="Radno mjesto"
                                            onChange={e => {this.setEditUserNumberFieldState('jobId', e.target.value)}}>
                                                {this.state.job.map((job, index) => (
                                                    <MenuItem key={index} value={job.jobId?.toString()}>{job.title}</MenuItem>
                                                ))}
                                        </Select>
                                    </FormControl>
                                </Col>
                            </Row>

                            <Row>
                                <Col lg={4} xs={12} className="mb-3">
                                    <FormControl fullWidth>
                                        <InputLabel id="form-select-location-label">Lokacija</InputLabel>
                                        <Select
                                            labelId="form-select-location-label"
                                            id="form-select-location"
                                            value={this.state.editUser.locationId.toString()}
                                            label="Lokacija"
                                            onChange={e => {this.setEditUserNumberFieldState('locationId', e.target.value)}}>
                                                {this.state.location.map((location, index) => (
                                                    <MenuItem key={index} value={location.locationId?.toString()}>{location.name}</MenuItem>
                                                ))}
                                        </Select>
                                    </FormControl>
                                </Col>
                                <Col lg={4} xs={12} className="mb-3">
                                    <FormControl fullWidth>
                                        <InputLabel id="form-select-status-label">Status</InputLabel>
                                        <Select
                                            labelId="form-select-status-label"
                                            id="form-select-status"
                                            value={this.state.editUser.status.toString()}
                                            label="Status"
                                            onChange={e => {this.setEditUserStringFieldState('status', e.target.value)}}>
                                                    <MenuItem key="aktivan" value="aktivan">Aktivan</MenuItem>
                                                    <MenuItem key="neaktivan" value="neaktivan">Neaktivan</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Col>
                                <Col lg={4} xs={12} className="mb-3">
                                    <FormControl fullWidth variant="outlined">
                                        <InputLabel htmlFor="outlined-adornment-password-label">Lozinka</InputLabel>
                                        <OutlinedInput
                                            onChange={(e) => this.setEditUserStringFieldState('passwordHash', e.target.value)}
                                            label="outlined-adornment-password-label"
                                            id="outlined-adornment-password"
                                            type={this.state.showPassword ? 'text' : 'password'}
                                            value={this.state.editUser.passwordHash}
                                            endAdornment={
                                            <InputAdornment position="end">
                                                <IconButton
                                                aria-label="prikaži lozinku"
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

    private doEditUser() {
        try {
            api('api/user/edit/' + this.props.match.params.userID, 'patch', {
                forname: this.state.editUser.forname,
                surename: this.state.editUser.surname,
                email: this.state.editUser.email,
                password: this.state.editUser.passwordHash,
                localNumber: this.state.editUser.localNumber,
                telephone: this.state.editUser.telephone,
                jobId: this.state.editUser.jobId,
                departmentId: this.state.editUser.departmentId,
                locationId: this.state.editUser.locationId,
                status: this.state.editUser.status,
            }, 'administrator')
            .then((res: ApiResponse) => {
                if (res.status === 'login') {
                    this.setLogginState(false);
                    return;
                }
                this.getUserData();
            });
        } catch (error) {
            // Ovde možete obraditi grešku kako želite, npr. ispisivanjem u konzoli ili prikazivanjem korisniku
            console.error('Greška prilikom izvršavanja API poziva:', error);
        }
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
                                                            <Link to={`/admin/user/${artikal.serialNumber}`}>{artikal.serialNumber}</Link>
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