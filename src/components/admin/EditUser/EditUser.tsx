import React from 'react';
import api, { ApiResponse } from '../../../API/api';
import { Button, Card, Col, Container, FloatingLabel, Form, Modal, Row } from 'react-bootstrap';
import MuiAlert from '@mui/material/Alert';
import { Snackbar, Stack } from '@mui/material';
import LocationType from '../../../types/LocationType';
import DepartmentType from '../../../types/DepartmentType';
import JobType from '../../../types/JobType';

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
        title: string,
        departmendCode: string;
    },
    job?: {
        title: string,
        jobCode: string;
    },
    location?: {
        name: string,
        code: string
    }
    jobId: number,
    departmentId: number,
    locationId: number,
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
                jobId: Number(),
                departmentId: Number(),
                locationId: Number(),
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
            location: []
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
                        <Form.Group className="mb-3 ">
                        <FloatingLabel label="Ime" className="mb-3">
                            <Form.Control 
                            id="name" 
                            type='text'
                            placeholder={this.state.user.surname}
                            value={this.state.editUser.sureName}
                            onChange={ (e) => this.setEditUserStringFieldState('sureName', e.target.value) }
                            required />
                        </FloatingLabel>
                        <FloatingLabel label="Prezime" className="mb-3">
                            <Form.Control 
                            id="forname" 
                            type='text'
                            placeholder={this.state.user.forname}
                            value={this.state.editUser.foreName}
                            onChange={ (e) => this.setEditUserStringFieldState('foreName', e.target.value) }
                            required />
                        </FloatingLabel>
                        <FloatingLabel label="Broj lokala" className="mb-3">
                            <Form.Control 
                            id="localNumber" 
                            type='number'
                            placeholder={this.state.user.localNumber}
                            value={this.state.editUser.localNumber}
                            onChange={ (e) => this.setEditUserStringFieldState('localNumber', e.target.value) }
                            required />
                        </FloatingLabel>
                        <FloatingLabel label="Telefon" className="mb-3">
                            <Form.Control 
                            id="telephone" 
                            type='text'
                            placeholder={this.state.user.telephone}
                            value={ this.state.editUser.telephone}
                            onChange={ (e) => this.setEditUserStringFieldState('telephone', e.target.value) }
                            required />
                        </FloatingLabel>
                        <FloatingLabel label="Email" className="mb-3">
                            <Form.Control 
                            id="email" 
                            type='email'
                            placeholder={this.state.editUser.email}
                            value={this.state.editUser.email}
                            onChange={ (e) => this.setEditUserStringFieldState('email', e.target.value) }
                            required />
                        </FloatingLabel>
                        <FloatingLabel label="Lozinka" className="mb-3">
                            <Form.Control 
                            id="lozinka" 
                            type='password'
                            placeholder={this.state.user.password}
                            value={this.state.editUser.password}
                            onChange={ (e) => this.setEditUserStringFieldState('password', e.target.value) }
                            required />
                        </FloatingLabel>
                        <FloatingLabel style={{marginTop:8}} label="Sektor/služba/odjeljenje" className="mb-3">
                        <Form.Select
                                    id='departmentId'
                                    value={this.state.editUser.departmentId.toString()}
                                    onChange={e => {this.setEditUserStringFieldState('departmentId', e.target.value); this.addJobDepartmentChange(e as any)}}
                                    required >
                                    <option value={this.state.user.departmentId}>{this.state.user.department?.departmendCode} - {this.state.user.department?.title}</option>
                                    {this.state.department.map(dep => (
                                        <option value={dep.departmentId?.toString()}>{dep.departmendCode} - {dep.title} </option>
                                    ))}
                                </Form.Select>
                            </FloatingLabel>

                            <FloatingLabel style={{marginTop:8}} label="Naziv radnog mjesta" className={this.state.user.departmentId ? '' : 'd-none'}>
                                <Form.Select
                                    id='jobTitleSelector'
                                    value={this.state.editUser.jobId.toString()}
                                    onChange={e => {this.setEditUserStringFieldState('jobId', e.target.value)}}
                                    >
                                   <option value={this.state.user.jobId}>{this.state.user.job?.jobCode} - {this.state.user.job?.title}</option>
                                    {this.state.job.map(jobData => (
                                        <option value={jobData.jobId?.toString()}>{jobData.title}</option>
                                    ))}
                                </Form.Select>
                            </FloatingLabel>

                            <FloatingLabel style={{marginTop:8}} label="Lokacija" className={this.state.user.jobId ? '' : 'd-none'}>
                                <Form.Select
                                    id='location'
                                    value={this.state.editUser.locationId.toString()}
                                    onChange={(e) => this.setEditUserStringFieldState('locationId', e.target.value)}
                                    >
                                   <option value={this.state.user.locationId}>{this.state.user.location?.code} - {this.state.user.location?.name}</option>
                                    {this.state.location.map(locData => (
                                        <option value={locData.locationId?.toString()}>{locData.name}</option>
                                    ))}
                                </Form.Select>
                            </FloatingLabel>
                            <Stack spacing={2} sx={{ width: '100%' }}>
                                <Snackbar open={this.state.error.visible} autoHideDuration={6000} onClose={()=> this.setErrorMessageVisible(false)}>
                                    <MuiAlert severity="success" sx={{ width: '100%' }}>
                                        {this.printOptionalMessage()}
                                    </MuiAlert>
                                </Snackbar>
                            </Stack>
                        </Form.Group>
                    </Form>
                    <Modal.Footer className={this.state.user.departmentId ? '' : 'd-none'}>
                    <Row style={{ alignItems: 'end' }}>
                            <Button onClick={() => this.doEditUser()} 
                                    variant="success"
                                    style={{background:"#70A9A1", color:"#1F363D", border:0, fontSize:18}}>
                            <i className="bi bi-node-plus" /> Izmjeni </Button>
                        </Row>
                </Modal.Footer>
                </Modal.Body>
            </>)
        }
    /* GET */

    private getUserData(){
        api('api/user/' + this.props.match.params.userId, 'get', {}, 'administrator')
        .then((res: ApiResponse) => {
            this.setUser(res.data)
        })

        api('api/department/', 'get', {}, 'administrator')
        .then((res: ApiResponse) => {
            this.setDepartments(res.data)
        })

        api('api/location/', 'get', {}, 'administrator')
        .then((res: ApiResponse) => {
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
        return (
            <>
            <Container style={{ marginTop:15}}>
                {this.editForm()}
            </Container>
            </>
        )
    }

}