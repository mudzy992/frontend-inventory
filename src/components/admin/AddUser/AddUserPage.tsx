import React from 'react';
import { Container, Card, Row, Col, Form, FloatingLabel, Button, Modal} from 'react-bootstrap';
import api, { ApiResponse } from '../../../API/api';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import AdminMenu from '../AdminMenu/AdminMenu';
import LocationType from '../../../types/LocationType';
import DepartmentType from '../../../types/DepartmentType';
import JobType from '../../../types/JobType';
import AddDepartment from '../AddDepartmentAndJob/AddDepartment';
import AddJob from '../AddDepartmentAndJob/AddJob';
import AddLocation from '../AddDepartmentAndJob/AddLocation';
import AddDepartmentJobLocation from '../AddDepartmentAndJob/AddDepartmentJobLocation';
import { Redirect } from 'react-router-dom';
import MuiAlert from '@mui/material/Alert';
import { Snackbar, Stack } from '@mui/material';


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
interface AddUserPageState{
    error: {
        message?: string;
        visible: boolean;
    };
    isLoggedIn: boolean;
    addUser: {
        surename: string;
        forname: string;
        email: string;
        localNumber: string;
        telephone: string;
        jobId: number;
        departmentId: number;
        locationId: number;
        password: string;
    };
    modal: {
        department:{
            visible: boolean; 
        },
        job:{
            visible: boolean; 
        },
        location:{
            visible: boolean; 
        },
        departmentJobLocation: {
            visible: boolean;
        }
        
    },
    location: LocationType[];
    department: DepartmentType[];
    job: JobType[];
    errorMessage: string;
}

export default class AddUserPage extends React.Component<{}>{
    state: AddUserPageState;
    constructor(props: Readonly<{}>) {
        super(props);
        this.state = {
            error: {
                visible: false,
            },
            isLoggedIn: true,
            addUser: {
                surename: '',
                forname: '',
                email: '',
                localNumber: '',
                telephone: '',
                jobId: Number(),
                departmentId: Number(),
                locationId: Number(),
                password: '',
            },
            modal: {
                department: { 
                    visible: false, 
                },
                job: { 
                    visible: false, 
                },
                location: { 
                    visible: false, 
                },
                departmentJobLocation: {
                    visible: false,
                }             
            },
            location: [],
            department: [],
            job: [],
            errorMessage: '',
        }
    }
    
    componentDidMount() {
        this.getData()
    }
    /* SET */
    private setErrorMessage(message: string) {
        this.setState(Object.assign(this.state.error, {
            message: message,
        }));
    }
    
    private setErrorMessageVisible(newState: boolean) {
        this.setState(Object.assign(this.state.error, {
                visible: newState,
        }));
    }

    private async showErrorMessage() {
        this.setErrorMessageVisible(true)
    }

    private setAddUserStringFieldState(fieldName: string, newValue: string) {
        this.setState(Object.assign(this.state.addUser, {
                [fieldName]: newValue,
            }))
    }
    private setAddUserNumberFieldState(fieldName: string, newValue: any) {
        this.setState(Object.assign(this.state.addUser,{
                [fieldName]: (newValue === 'null') ? null : Number(newValue),
            }))
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

    private async addJobDepartmentChange(event: React.ChangeEvent<HTMLSelectElement>) {
        this.setAddUserNumberFieldState('departmentId', event.target.value);

        const jobs = await this.getJobsByDepartmentId(this.state.addUser.departmentId);
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

    private async showDepartmentModal() {
        this.setDepartmentModalVisibleState(true)
    }

    private setDepartmentModalVisibleState(newState: boolean) {
        this.setState(Object.assign(this.state.modal.department, {
                visible: newState,
            }));
        this.getData();
    }

    private async showJobModal() {
        this.setJobModalVisibleState(true)
    }

    private setJobModalVisibleState(newState: boolean) {
        this.setState(Object.assign(this.state.modal.job, {
                visible: newState,
            }));
        this.getData();
    }

    private async showLocationModal() {
        this.setLocationModalVisibleState(true)
    }

    private setLocationModalVisibleState(newState: boolean) {
        this.setState(Object.assign(this.state.modal.location, {
                visible: newState,
            }));
        this.getData();
    }

    private async showDepartmentJobLocationModal() {
        this.setDepartmentJobLocationModalVisibleState(true)
    }

    private setDepartmentJobLocationModalVisibleState(newState: boolean) {
        this.setState(Object.assign(this.state.modal.departmentJobLocation, {
                visible: newState,
            }));
        this.getJobsByDepartmentId(this.state.addUser.departmentId); // Ovo ne radi kako je zamišljeno
    }

    private setLogginState(isLoggedIn: boolean) {
        const newState = Object.assign(this.state, {
            isLoggedIn: isLoggedIn,
        });

        this.setState(newState);
    }
    /* Kraj SET */
    /* GET */
    private getData(){
        api('api/location/', 'get', {}, 'administrator')
        .then(async (res: ApiResponse) => {
            if(res.status === 'error') {
                this.setErrorMessage('Greška prilikom hvatanja lokacija')
            }
            if(res.status === 'login') {
                return this.setLogginState(false)
            }
            this.setLocation(res.data)
        })

        api('api/department/', 'get', {}, 'administrator')
        .then(async (res: ApiResponse) => {
            if(res.status === 'error') {
                this.setErrorMessage('Greška prilikom hvatanja sektora i odjeljenja')
            }
            this.setDepartment(res.data)
        })
    }

    private async getJobsByDepartmentId(departmentId: number): Promise<JobBaseType[]> {
        return new Promise(resolve => {
            api('api/job/?filter=departmentJobs.departmentId||$eq||' + departmentId + '/', 'get', {}, 'administrator')
            .then((res : ApiResponse) => {
            if(res.status === 'error') {
                this.setErrorMessage('Greška prilikom hvatanja radnih mjesta')
            }

            const jobs: JobBaseType[] = res.data.map((item: any) => ({
                jobId: item.jobId,
                title: item.title,
                jobCode: item.jobCode
            }))
            resolve(jobs)
        })
    })      
    }

    /* Kraj GET */
    /* Dodatne funkcije */
    private printOptionalMessage() {
        if (this.state.error.message === '') {
            return;
        }

        return (
            <Card.Text>
                {this.state.error.message}
            </Card.Text>
        );
    }

    private doAddUser() {
        api('api/user/add/', 'post', {
            surename: this.state.addUser.surename,
            forname: this.state.addUser.forname,
            password: this.state.addUser.password,
            email: this.state.addUser.email,
            localNumber: this.state.addUser.localNumber,
            telephone: this.state.addUser.telephone,
            jobId: this.state.addUser.jobId,
            departmentId: this.state.addUser.departmentId,
            locationId: this.state.addUser.locationId,
            
        }, 'administrator')
        .then(async (res: ApiResponse) => {
            if (res.status === "error" || res.status === "login") {
                this.setErrorMessage('Greška prilikom dodavanja lokacije.');
                return;
            }
            this.setErrorMessage('Uspješno dodan novi korisnik');
            this.showErrorMessage()
        });
    }
    /* Kraj dodatnih funkcija */
    render() {
         if (this.state.isLoggedIn === false) {
            return (
                <Redirect to="/admin/login" />
            );
        } 
        return(
            <>
            <RoledMainMenu role='administrator'/>
            
            <Container style={{ marginTop:15}}>
                {this.printOptionalMessage()}
                {this.addForm()}
                <AdminMenu />
            </Container>
            </>
        )
    }

    private addForm() {
        return (
            <> 
            <Card className="mb-3">
                <Card.Header><i className="bi bi-person-lines-fill"/> Informacije o korisniku</Card.Header>
                <Card.Body>
                    <Form>
                        <Form.Group className="mb-3 was-validated">
                            
                        <Row>
                            <Col lg="6" xs="12">
                                <FloatingLabel label="Ime" className="mb-3">
                                <Form.Control 
                                    id="surename" 
                                    type="text" 
                                    placeholder="Ime"
                                    value={ this.state.addUser.surename }
                                    onChange={ (e) => this.setAddUserStringFieldState('surename', e.target.value) }
                                    required />
                                </FloatingLabel>
                            </Col>
                            <Col lg="6" xs="12">
                                <FloatingLabel label="Prezime" className="mb-3">
                                <Form.Control 
                                    id="forname" 
                                    type="text" 
                                    placeholder="Naziv"
                                    value={ this.state.addUser.forname }
                                    onChange={ (e) => this.setAddUserStringFieldState('forname', e.target.value) }
                                    required />
                                </FloatingLabel>
                            </Col>
                        </Row>

                        <Row>
                            <Col lg="6" xs="12">
                                <FloatingLabel label="Email" className="mb-3">
                                <Form.Control 
                                id="email" 
                                type="email" 
                                placeholder="Email"
                                value={ this.state.addUser.email }
                                onChange={ (e) => this.setAddUserStringFieldState('email', e.target.value) }
                                required />
                            </FloatingLabel>
                            </Col>
                            <Col lg="6" xs="12">
                                <FloatingLabel label="Lozinka" className="mb-3">
                                <Form.Control 
                                id="password" 
                                type="password" 
                                placeholder="Lozinka"
                                value={ this.state.addUser.password }
                                onChange={ (e) => this.setAddUserStringFieldState('password', e.target.value) }
                                required />
                            </FloatingLabel>
                            </Col>
                        </Row>

                        <Row>
                            <Col lg="6" xs="12">
                            <FloatingLabel label="Telefon" className="mb-3">
                                <Form.Control 
                                id="telephone" 
                                type='telephone'
                                placeholder="Telefon"
                                value={ this.state.addUser.telephone}
                                onChange={ (e) => this.setAddUserStringFieldState('telephone', e.target.value) }
                                required />
                            </FloatingLabel>
                            </Col>
                            <Col lg="6" xs="12">
                                <FloatingLabel label="Lokalni broj telefona" className="mb-3">
                                <Form.Control 
                                    id="local"
                                    type='number'
                                    placeholder="Lokal"
                                    value={ this.state.addUser.localNumber }
                                    onChange={ (e) => this.setAddUserStringFieldState('localNumber', e.target.value) }
                                    required />
                            </FloatingLabel>
                            </Col>
                        </Row>
                        
                        <Row>
                        <Col lg="11" xs="11" style={{marginRight:-12}}>
                            <FloatingLabel label="Sektor" className="mb-3">
                                <Form.Select
                                    id='departmentId'
                                    value={this.state.addUser.departmentId.toString()}
                                    onChange={e => {this.setAddUserNumberFieldState('departmentId', e.target.value); this.addJobDepartmentChange(e as any)}}
                                    required >
                                    <option value=''>izaberi sektor</option>
                                    {this.state.department.map(dep => (
                                        <option value={dep.departmentId?.toString()}>{dep.departmendCode} - {dep.title} </option>
                                    ))}
                                </Form.Select>
                            </FloatingLabel>
                            </Col>
                            <Col lg="1" xs="1" style={{marginRight:12, paddingBottom:10, justifyContent:"center", display:"flex"}}>
                                <Button size='sm' style={{background:"none", color:"#70A9A1", border:0, fontSize:20}} onClick={() => this.showDepartmentModal()}><i className="bi bi-plus-circle-fill" /></Button>
                                <Modal size="lg" centered show={this.state.modal.department.visible} onHide={() => this.setDepartmentModalVisibleState(false)}>
                                    <AddDepartment />
                                </Modal>
                            </Col>
                            
                            <Col lg="11" xs="11" style={{marginRight:-12}}>
                                <FloatingLabel label="Radno mjesto" className="mb-3">
                                    <Form.Select
                                        id='jobId'
                                        value={this.state.addUser.jobId.toString()}
                                        onChange={(e) => this.setAddUserNumberFieldState('jobId', e.target.value)}
                                        required >
                                        <option value=''>izaberi radno mjesto</option>
                                        {this.state.job.map(jo => (
                                            <option value={jo.jobId?.toString()}>{jo.jobCode} - {jo.title} </option>
                                        ))}
                                    </Form.Select>
                                </FloatingLabel>
                            </Col>
                            <Col lg="1" xs="1" style={{marginRight:12, paddingBottom:10, justifyContent:"center", display:"flex"}}>
                            <Button size='sm' style={{background:"none", color:"#70A9A1", border:0, fontSize:20}} onClick={() => this.showJobModal()}><i className="bi bi-plus-circle-fill" /></Button>
                            <Modal size="lg" centered show={this.state.modal.job.visible} onHide={() => this.setJobModalVisibleState(false)}>
                                <AddJob />
                            </Modal>
                            </Col>
                        </Row>
                        <Row>
                        <Col lg="11" xs="11">
                        <Form.Text>
                            Ukoliko je lista radnih mjesta prazna ili radno mjesto ne postoji u istoj, potrebno je izvršiti povezivanje radnog mjesta sa lokacijom i sektorom. To možete učiniti klikom
                            <Button style={{background:"none", color:"#40798C", border:0, fontSize:15, marginBottom:4, paddingLeft:3}} onClick={() => this.showDepartmentJobLocationModal()}> <b>ovdje.</b></Button>
                            <Modal size="lg" centered show={this.state.modal.departmentJobLocation.visible} onHide={() => this.setDepartmentJobLocationModalVisibleState(false)}>
                                <AddDepartmentJobLocation />
                            </Modal>
                        </Form.Text>
                        </Col>
                        </Row>
                        <Row>
                            <Col lg="11" xs="11" style={{marginRight:-12}}>
                                <FloatingLabel label="Lokacija" className="mb-3">
                                    <Form.Select
                                        id='locationId'
                                        value={this.state.addUser.locationId.toString()}
                                        onChange={(e) => this.setAddUserNumberFieldState('locationId', e.target.value)}
                                        required >
                                        <option value=''>izaberi lokaciju</option>
                                        {this.state.location.map(loc => (
                                            <option value={loc.locationId?.toString()}>{loc.code} - {loc.name} </option>
                                        ))}
                                    </Form.Select>
                                </FloatingLabel>
                            </Col>
                            <Col lg="1" xs="1" style={{marginRight:12, paddingBottom:10, justifyContent:"center", display:"flex"}}>
                                <Button size='sm' style={{background:"none", color:"#70A9A1", border:0, fontSize:20}} onClick={() => this.showLocationModal()}><i className="bi bi-plus-circle-fill" /></Button>
                                    <Modal size="lg" centered show={this.state.modal.location.visible} onHide={() => this.setLocationModalVisibleState(false)}>
                                        <AddLocation />
                                    </Modal>
                            </Col>
                        </Row>
                    </Form.Group>
                    </Form>
                </Card.Body>
                <Card.Footer>
                    <Row style={{ alignItems: 'end' }}>
                        <Button style={{background:"#70A9A1", color:"#1F363D", border:0}} onClick={() => this.doAddUser()} variant="success"> <i className="bi bi-person-check-fill"/> Dodaj korisnika</Button>
                    </Row>
                    <Row>
                    <Stack spacing={2} sx={{ width: '100%' }}>
                        <Snackbar open={this.state.error.visible} autoHideDuration={6000} onClose={()=> this.setErrorMessageVisible(false)}>
                            <MuiAlert severity="success" sx={{ width: '100%' }}>
                                {this.printOptionalMessage()}
                            </MuiAlert>
                        </Snackbar>
                    </Stack>
                    </Row>
                </Card.Footer>
            </Card>  
            </>
        )
    }

    
}