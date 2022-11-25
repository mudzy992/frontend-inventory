import React from 'react';
import api, { ApiResponse } from '../../../API/api';
import { Button, Card, Container, FloatingLabel, Form, Modal, Row } from 'react-bootstrap';
import MuiAlert from '@mui/material/Alert';
import { Snackbar, Stack } from '@mui/material';
import LocationType from '../../../types/LocationType';
import DepartmentType from '../../../types/DepartmentType';
import JobType from '../../../types/JobType';
import { Redirect } from 'react-router-dom';

interface EditUserPageProperties {
    match: {
        params: {
            userId: number,
        }
    }
}

interface UserData {
    userId: number,
    forname: string,
    surname: string,
    localNumber: string,
    telephone: string,
    email: string,
    password: string,
    department?:{
        departmentId: number,
        title: string,
        departmendCode: string;
    },
    job?: {
        jobId: number,
        title: string,
        jobCode: string;
    },
    location?: {
        locationId: number,
        name: string,
        code: string
    }
}

interface EditUserType {
    sureName: string,
    foreName: string,
    localNumber: string,
    telephone: string,
    email: string,
    password: string,
    jobId: number,
    departmentId: number,
    locationId: number,
}

interface JobBaseType {
    jobId: number,
    title: string,
    jobCode: string,
}

interface EditUserState {
    error: {
        message?: string;
        visible: boolean;
    };
    user: UserData;
    editUser: EditUserType;
    job: JobType[];
    department: DepartmentType[];
    location: LocationType[];
    isLoggedIn: boolean;
}

export default class EditUser extends React.Component<EditUserPageProperties> {
    state: EditUserState;
    constructor(props: Readonly<EditUserPageProperties>) {
        super(props);
        this.state = {
            error: {
                visible: false,
            },
            user: {
                userId: Number(),
                forname: "",
                surname: "",
                localNumber: "",
                telephone: "",
                email: "",
                password: "",
            },
            editUser: {
                sureName: "",
                foreName: "",
                localNumber: "",
                telephone: "",
                email: "",
                password: "",
                jobId: Number(),
                departmentId: Number(),
                locationId: Number(),
            },
            job: [],
            department: [],
            location: [],
            isLoggedIn: true,
        }
    }

    componentDidMount() {
        this.getUserData()
    }

    /* SET */
    private setErrorMessage(message: string) {
        this.setState(Object.assign(this.state.error, {
            message: message
        }))
    }

    private setErrorMessageVisible(newState: boolean) { 
        this.setState(Object.assign(this.state.error, {
            visible: newState
        }))
    }

    private showErrorMessage(){
        this.setErrorMessageVisible(true)
    }

    private setUser(userData: UserData){
        this.setState(Object.assign(this.state, {
            user: userData
        }))
    }

    private setEditUserStringFieldState(fieldName: string, newValue: string) {
        this.setState(Object.assign(this.state.editUser, {
                [fieldName]: newValue,
            }))
    }

    private setEditUserNumberFieldState(fieldName: string, newValue: any) {
        this.setState(Object.assign(this.state.editUser,{
                [fieldName]: (newValue === 'null') ? null : Number(newValue),
            }))
    }

    private setDepartments(departmentData: DepartmentType[]){
        this.setState(Object.assign(this.state, {
            department: departmentData
        }))
    }

    private setJob(jobData: JobType[]){
        this.setState(Object.assign(this.state, {
            job: jobData
        }))
    }

    private setLocations(locationData: LocationType[]){
        this.setState(Object.assign(this.state, {
            location: locationData
        }))
    }

    private setLogginState(isLoggedIn: boolean) {
        const newState = Object.assign(this.state, {
            isLoggedIn: isLoggedIn,
        });
        this.setState(newState);
    }

    /* FUNCTIONS */
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

    private async putUserDetailsInState (user: UserData) {
        this.setEditUserStringFieldState('sureName', String(user.surname))
        this.setEditUserStringFieldState('foreName', String(user.forname))
        this.setEditUserStringFieldState('localNumber', String(user.localNumber))
        this.setEditUserStringFieldState('telephone', String(user.telephone))
        this.setEditUserStringFieldState('email', String(user.email))
        this.setEditUserStringFieldState('password', String(user.password))
        this.setEditUserNumberFieldState('departmentId', Number(user.department?.departmentId))
        this.setEditUserNumberFieldState('jobId', Number(user.job?.jobId))
        this.setEditUserNumberFieldState('locationId', Number(user.location?.locationId))
    }


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


    private doEditUser() {
        api('api/user/edit/' + this.props.match.params.userId, 'patch', {
            surename: this.state.editUser.sureName,
            forname: this.state.editUser.foreName,
            password: this.state.editUser.password,
            email: this.state.editUser.email,
            localNumber: this.state.editUser.localNumber,
            telephone: this.state.editUser.telephone,
            jobId: this.state.editUser.jobId,
            departmentId: this.state.editUser.departmentId,
            locationId: this.state.editUser.locationId,
            
        }, 'administrator')
        .then(async (res: ApiResponse) => {
            if (res.status === "error" || res.status === "login") {
                this.setErrorMessage('Greška prilikom dodavanja lokacije.');
                return;
            }
            this.setErrorMessage('Uspješno izmjenjeni podaci korisnika');
            this.showErrorMessage()
        });
    }

    editForm() {
        return (
        <>
        <Modal.Header closeButton>
                <Modal.Title>Izmjena korisničkih podataka</Modal.Title>
            </Modal.Header>
            <Modal.Body >
                <Form>
                    <Form.Group className="mb-3" controlId="formUserName">
                            <FloatingLabel label="Ime" className="mb-3">
                                <Form.Control 
                                type='text'
                                placeholder={this.state.user.surname}
                                value={this.state.editUser.sureName}
                                onChange={ (e) => this.setEditUserStringFieldState('sureName', e.target.value) }
                                required />
                            </FloatingLabel>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formUserForname">
                            <FloatingLabel label="Prezime" className="mb-3">
                                <Form.Control 
                                type='text'
                                placeholder={this.state.user.forname}
                                value={this.state.editUser.foreName}
                                onChange={ (e) => this.setEditUserStringFieldState('foreName', e.target.value) }
                                required />
                            </FloatingLabel>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formUserLocalNumber">
                            <FloatingLabel label="Broj lokala" className="mb-3">
                                <Form.Control 
                                type='number'
                                placeholder={this.state.user.localNumber}
                                value={this.state.editUser.localNumber}
                                onChange={ (e) => this.setEditUserStringFieldState('localNumber', e.target.value) }
                                required />
                            </FloatingLabel>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formUserPhone">
                            <FloatingLabel label="Telefon" className="mb-3">
                                <Form.Control 
                                type='text'
                                placeholder={this.state.user.telephone}
                                value={ this.state.editUser.telephone}
                                onChange={ (e) => this.setEditUserStringFieldState('telephone', e.target.value) }
                                required />
                            </FloatingLabel>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formUserEmail">
                            <FloatingLabel label="Email" className="mb-3">
                                <Form.Control 
                                type='email'
                                placeholder={this.state.editUser.email}
                                value={this.state.editUser.email}
                                onChange={ (e) => this.setEditUserStringFieldState('email', e.target.value) }
                                required />
                            </FloatingLabel>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formUserPassword">
                            <FloatingLabel label="Lozinka" className="mb-3">
                                <Form.Control 
                                type='password'
                                placeholder={this.state.user.password}
                                value={this.state.editUser.password}
                                onChange={ (e) => this.setEditUserStringFieldState('password', e.target.value) }
                                required />
                            </FloatingLabel>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formUserSector">
                            <FloatingLabel label="Sektor/služba/odjeljenje" className="mb-3">
                                <Form.Select
                                    value={this.state.editUser.departmentId.toString()}
                                    onChange={e => {this.addJobDepartmentChange(e as any); this.setEditUserNumberFieldState('departmentId', e.target.value) }}
                                    required >
                                    <option value=''>izaberi sektor</option>
                                    {this.state.department.map(deparments => (
                                        <option value={deparments.departmentId?.toString()}>{deparments.departmendCode} - {deparments.title} </option>
                                    ))}
                                </Form.Select>
                            </FloatingLabel>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formUserJob">
                            <FloatingLabel style={{marginTop:8}} label="Naziv radnog mjesta">
                                <Form.Select
                                    value={this.state.editUser.jobId.toString()}
                                    onChange={(e) => this.setEditUserNumberFieldState('jobId', e.target.value)}
                                    >
                                   <option value="">Izaberi radno mjesto</option>
                                    {this.state.job.map(jobs => (
                                        <option value={jobs.jobId?.toString()}>{jobs.jobCode} - {jobs.title}</option>
                                    ))}
                                </Form.Select>
                            </FloatingLabel>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formUserLocation">
                            <FloatingLabel style={{marginTop:8}} label="Lokacija">
                                <Form.Select
                                    value={this.state.editUser.locationId.toString()}
                                    onChange={(e) => this.setEditUserNumberFieldState('locationId', e.target.value)}
                                    >
                                   <option value="">Izaberi lokaciju</option>
                                    {this.state.location.map(locations => (
                                        <option value={locations.locationId?.toString()}>{locations.code} - {locations.name}</option>
                                    ))}
                                </Form.Select>
                            </FloatingLabel>
                        </Form.Group>
                        <Stack spacing={2} sx={{ width: '100%' }}>
                            <Snackbar open={this.state.error.visible} autoHideDuration={6000} onClose={()=> this.setErrorMessageVisible(false)}>
                                <MuiAlert severity="success" sx={{ width: '100%' }}>
                                    {this.printOptionalMessage()}
                                </MuiAlert>
                            </Snackbar>
                        </Stack>
                    </Form>
                    <Modal.Footer >
                    <Row style={{ alignItems: 'end' }}>
                            <Button onClick={() => this.doEditUser()} 
                                    variant="success"
                                    >
                            <i className="bi bi-pencil-square" /> Izmjeni </Button>
                        </Row>
                </Modal.Footer>
                </Modal.Body>
            </>)
        }
    /* GET */

    private getUserData(){
        api('api/user/' + this.props.match.params.userId, 'get', {}, 'administrator')
        .then((res: ApiResponse) => {
            if (res.status === 'login') {
                return this.setLogginState(false);
            }
            this.setUser(res.data)
            this.putUserDetailsInState(res.data)
        })

        api('api/department/', 'get', {}, 'administrator')
        .then((res: ApiResponse) => {
            if (res.status === 'login') {
                return this.setLogginState(false);
            }
            this.setDepartments(res.data)
        })

        api('api/job/', 'get', {}, 'administrator')
        .then((res: ApiResponse) => {
            if (res.status === 'login') {
                return this.setLogginState(false);
            }
            this.setJob(res.data)
        })

        api('api/location/', 'get', {}, 'administrator')
        .then((res: ApiResponse) => {
            if (res.status === 'login') {
                return this.setLogginState(false);
            }
            this.setLocations(res.data)
        })
    }

    private async getJobsByDepartmentId(departmentId: number): Promise<JobBaseType[]> {
        return new Promise(resolve => {
            api('api/job/?filter=departmentJobs.departmentId||$eq||' + departmentId + '/', 'get', {}, 'administrator')
            .then((res : ApiResponse) => {
            if(res.status === 'error') {
                this.setErrorMessage('Greška prilikom hvatanja radnih mjesta')
            }
            if (res.status === 'login') {
                return this.setLogginState(false);
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

    render() {
        if (this.state.isLoggedIn === false) {
            return (
                <Redirect to="/admin/login" />
            );
        }
        return (
            <>
            <Container>
                {this.editForm()}
            </Container>
            </>
        )
    }

}