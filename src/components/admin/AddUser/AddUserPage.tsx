import React from 'react';
import { Container, Card, Row, Col, Form, FloatingLabel, Button, Alert,} from 'react-bootstrap';
import api, { ApiResponse } from '../../../API/api';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import AdminMenu from '../AdminMenu/AdminMenu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { Redirect } from 'react-router-dom';
import LocationType from '../../../types/LocationType';
import DepartmentType from '../../../types/DepartmentType';
import JobType from '../../../types/JobType';


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
    message: string;
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
            message: '',
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
        const newState = Object.assign(this.state, {
            errorMessage: message,
        });
        this.setState(newState);
    }

    private setAddUserStringFieldState(fieldName: string, newValue: string) {
        this.setState(Object.assign(this.state,
            Object.assign(this.state.addUser, {
                [fieldName]: newValue,
            })))
    }
    private setAddUserNumberFieldState(fieldName: string, newValue: any) {
        this.setState(Object.assign(this.state,
            Object.assign(this.state.addUser, {
                [fieldName]: (newValue === 'null') ? null : Number(newValue),
            })))
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
        if (this.state.message === '') {
            return;
        }

        return (
            <Card.Text>
                {this.state.message}
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
            if(res.data.statusCode === 201) {
                this.setErrorMessage('Korisnik dodan')
            }
            
            if(res.status === 'ok') {
                
            }

/*             if (res.status === "login") {
                this.setLogginState(false);
                return;
            }

            if (res.status === "error") {
                this.setAddModalStringFieldState('message', JSON.stringify(res.data));
                return;
            } */
        });
    }
    /* Kraj dodatnih funkcija */
    render() {
        /* if (this.state.isLoggedIn === false) {
            return (
                <Redirect to="/admin/login" />
            );
        } */
        return(
            <>
            <RoledMainMenu role='administrator'/>
            <Container style={{ marginTop:15}}> 
                {this.printOptionalMessage()}
                {this.renderArticleData()}
            </Container>
            </>
        )
    }

    renderArticleData() {
        return(
            <Row>
            <Col xs ="12" lg="12">
                <Row>
                <AdminMenu />
                    <Col style={{marginTop:5}} xs="12" lg="9" sm="12">
                            {this.addForm()}
                    </Col>
                </Row>
            </Col>
        </Row>
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
                                placeholder="Lokal"
                                value={ this.state.addUser.localNumber }
                                onChange={ (e) => this.setAddUserStringFieldState('localNumber', e.target.value) }
                                required />
                            </FloatingLabel>
                            </Col>
                        </Row>

                        <Row>
                            <Col lg="6" xs="12">
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
                            <Col lg="6" xs="12">

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
                        </Row>

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
                    </Form.Group>
                    </Form>
                </Card.Body>
                <Card.Footer>
                    <Row style={{ alignItems: 'end' }}>
                        <Button onClick={() => this.doAddUser()} variant="success"> <i className="bi bi-person-check-fill"/> Dodaj korisnika</Button>
                    </Row>
                    <Row>
                    <Alert variant="danger"
                        style={{ marginTop: 15 }}
                        className={this.state.errorMessage ? '' : 'd-none'}>
                        <FontAwesomeIcon icon={faExclamationTriangle} />  {this.state.errorMessage}
                    </Alert>
                    </Row>
                </Card.Footer>
            </Card>    
            </>
        )
    }

    
}