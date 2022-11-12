import React from 'react';
import api, { ApiResponse } from '../../../API/api';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import { Button, Card, Col, Container, FloatingLabel, Form, Row } from 'react-bootstrap';
import AdminMenu from '../AdminMenu/AdminMenu';
import MuiAlert from '@mui/material/Alert';

interface DepartmentType {
    departmentId: number;
    title: string;
    description: string;
    departmentCode: string;
    parentDepartmentId: number;
}

interface JobType {
    jobId: number;
    title: string;
    description: string;
    jobCode: string;
}

interface LocationType {
    locationId: number;
    name: string;
    code: string;
    parentLocationId: number;
}
interface AddDepartmentAndJobState {
    message?: string;
    departmentBase: DepartmentType[];
    jobBase: JobType[];
    locationBase: LocationType[];
    add: {
        department: {
            title: string;
            description: string;
            departmentCode: string;
            parentDepartmentId?: number;
        },
        job: {
            title: string;
            description: string;
            jobCode: string;
        },
        location: {
            name: string;
            code: string;
            parentLocationId?: number;
        },
        departmentJobLocation: {
            departmentId: number;
            jobId: number;
            locationId: number;
        }
    }
}

export default class AddDepartmentAndJob extends React.Component<{}> {
    state: AddDepartmentAndJobState;
    constructor(props: Readonly<{}>) {
        super(props);
        this.state = {
            departmentBase:[],
            jobBase: [],
            locationBase: [],
            add: {
                department: {
                    title: '',
                    description: '',
                    departmentCode: '',
                },
                job: {
                    title: '',
                    description: '',
                    jobCode: ''
                },
                location: {
                    name: '',
                    code: '',
                },
                departmentJobLocation: {
                    departmentId: 0,
                    jobId: 0,
                    locationId: 0,
                }
            } 
        }
    }

    componentDidMount() {
        this.getDepartments()
    }

    /* SET */

    private setAddNewDepartmentStringState(fieldName: string, newValue: string) {
        this.setState(Object.assign(this.state,
            Object.assign(this.state.add.department, {
                [fieldName]: newValue,
            })))
    }

    private setAddNewJobStringState(fieldName: string, newValue: string) {
        this.setState(Object.assign(this.state,
            Object.assign(this.state.add.job, {
                [fieldName]: newValue,
            })))
    }

    private setAddNewLocationStringState(fieldName: string, newValue: string) {
        this.setState(Object.assign(this.state,
            Object.assign(this.state.add.location, {
                [fieldName]: newValue,
            })))
    }

    private setAddNewDepartmentJobLocationStringState(fieldName: string, newValue: string) {
        this.setState(Object.assign(this.state,
            Object.assign(this.state.add.departmentJobLocation, {
                [fieldName]: newValue,
            })))
    }

    private setErrorMessage(message: string) {
        this.setState(Object.assign(this.state, {
            message: message,
        }));
    }

    private setDepartmentData(departmentData: DepartmentType[]) {
        this.setState(Object.assign(this.state, {
            departmentBase: departmentData,
        }));
    }

    private setJobData(jobData: JobType[]) {
        this.setState(Object.assign(this.state, {
            jobBase: jobData,
        }));
    }

    private setLocationData(locationData: LocationType[]) {
        this.setState(Object.assign(this.state, {
            locationBase: locationData,
        }));
    }

    /* GET */

    private getDepartments() {
        api('api/department/', 'get', {}, 'administrator')
        .then((res: ApiResponse) => {
            if (res.status === "error" || res.status === "login") {
                this.setErrorMessage('Greška prilikom učitavanja sektora/službei/odjeljenja.');
                return;
            }   
            this.setDepartmentData(res.data);
        })

        api('api/job/', 'get', {}, 'administrator')
        .then((res: ApiResponse) => {
            if (res.status === "error" || res.status === "login") {
                this.setErrorMessage('Greška prilikom učitavanja radnih mjesta.');
                return;
            }   
            this.setJobData(res.data);
        })

        api('api/location/', 'get', {}, 'administrator')
        .then((res: ApiResponse) => {
            if (res.status === "error" || res.status === "login") {
                this.setErrorMessage('Greška prilikom učitavanja lokacija.');
                return;
            }   
            this.setLocationData(res.data);
        })
    }

    /* DODATNE FUNCKIJE */
    private printOptionalMessage() {
        if (this.state.message === '') {
            return;
        }

        return (
            <>
                {this.state.message}
            </>
        );
    }

    private doAddDepartment() {
        api('api/department/', 'post', this.state.add.department, 'administrator')
        .then((res: ApiResponse) => {
            if (res.status === "error" || res.status === "login") {
                this.setErrorMessage('Greška prilikom dodavanja sektora/službe/odjeljenja.');
                return;
            }
            this.setErrorMessage('Uspješno dodan sektor/služba/odjeljenje');
            this.getDepartments();
        })
    }

    private doAddJob() {
        api('api/job/', 'post', this.state.add.job, 'administrator')
        .then((res: ApiResponse) => {
            if (res.status === "error" || res.status === "login") {
                this.setErrorMessage('Greška prilikom dodavanja radnog mjesta.');
                return;
            }
            this.setErrorMessage('Uspješno dodano radno mjesto');
            this.getDepartments();
        })
    }

    private doAddLocation() {
        api('api/location/', 'post', this.state.add.location, 'administrator')
        .then((res: ApiResponse) => {
            if (res.status === "error" || res.status === "login") {
                this.setErrorMessage('Greška prilikom dodavanja lokacije.');
                return;
            }
            this.setErrorMessage('Uspješno dodana lokacija');
            this.getDepartments();
        })
    }

    private doAddDepartmentJobLocation() {
        api('api/departmentJob/', 'post', this.state.add.departmentJobLocation, 'administrator')
        .then((res: ApiResponse) => {
            if (res.status === "error" || res.status === "login") {
                this.setErrorMessage('Greška prilikom dodavanja sektora/službe/odjeljenja, pripadajućeg radnog mjesta te lokacije.');
                return;
            }
            this.setErrorMessage('Uspješno dodan sektor/služba/odjeljenje, pripadajuće radno mjesto te lokacija');
            this.getDepartments();
        })
    }

    addForm() {
        return(
            <><Card className="mb-3">
                <Card.Header>
                    <Card.Title>Detalji sektora/službe/odjeljenja</Card.Title>
                </Card.Header>
                <Card.Body>
                    <Form>
                        <Form.Group className="mb-3 ">
                            <FloatingLabel label="Naziv sektora/službe/odjeljenja" className="mb-3 was-validated">
                                <Form.Control
                                    id="departmentTitle"
                                    type="text"
                                    placeholder="Naziv sektora/službe/odjeljenja"
                                    value={this.state.add.department.title}
                                    onChange={(e) => this.setAddNewDepartmentStringState('title', e.target.value)}
                                    required />
                            </FloatingLabel>
                            <FloatingLabel label="Opis" className="mb-3 was-validated">
                                <Form.Control
                                    id="departmentDescription"
                                    as="textarea" 
                                    rows={5}
                                    style={{height:100}}
                                    placeholder="Neobavezno"
                                    value={this.state.add.department.description}
                                    onChange={(e) => this.setAddNewDepartmentStringState('description', e.target.value)}
                                    />
                            </FloatingLabel>
                            <FloatingLabel label="Šifra organizacione jedinice" className="mb-3">
                                <Form.Control
                                    id="departmentCode"
                                    type="number"
                                    placeholder="Šifra organizacione jedinice"
                                    value={this.state.add.department.departmentCode}
                                    onChange={(e) => this.setAddNewDepartmentStringState('departmentCode', e.target.value)}
                                    required />
                            </FloatingLabel>
                            <Form.Text>U slučaju da se kreira sektor nije potrebno popuniti polje ispod. Polje se popunjava
                                isključivo ako se dodaje služba/odjeljenje koje pripada nekom sektoru/službi.
                            </Form.Text>
                            <FloatingLabel style={{marginTop:8}} label="Pripada sektoru/službi" className="mb-3">
                                <Form.Select
                                    id='parentDepartmentId'
                                    value={this.state.add.department.parentDepartmentId?.toString()}
                                    onChange={(e) => this.setAddNewDepartmentStringState('parentDepartmentId', e.target.value)}
                                    >
                                    <option value='NULL'>izaberi sektor/službu/odjeljenje</option>
                                    {this.state.departmentBase.map(data => (
                                        <option value={data.departmentId?.toString()}>{data.title}</option>
                                    ))}
                                </Form.Select>
                            </FloatingLabel>
                            <MuiAlert elevation={6} variant="filled" severity="success" className={this.state.message ? '' : 'd-none'}>
                                {this.printOptionalMessage()}
                            </MuiAlert>
                                

                        </Form.Group>
                    </Form>
                </Card.Body>
                <Card.Footer className={this.state.add.department.title ? '' : 'd-none'}>
                        <Row style={{ alignItems: 'end' }}>
                            <Button onClick={() => this.doAddDepartment()} 
                                    variant="success">
                            <i className="bi bi-plus-circle" /> Dodaj sektor/službu/odjeljenje</Button>
                        </Row>
                </Card.Footer>
            </Card>
            <Card className="mb-3">
                <Card.Header>
                    <Card.Title>Detalji radnog mjesta</Card.Title>
                </Card.Header>
                <Card.Body>
                    <Form>
                        <Form.Group className="mb-3 ">
                            <FloatingLabel label="Naziv radnog mjesta" className={this.state.add.job.title ? 'false' : 'd-none'}>
                                <Form.Control
                                    id="jobTitle"
                                    type="text"
                                    placeholder="Naziv radnog mjesta"
                                    value={this.state.add.job.title}
                                    onChange={e => {this.setAddNewJobStringState('title', e.target.value)}}
                                    required />
                            </FloatingLabel>
                            <FloatingLabel label="Opis" className="mb-3 was-validated">
                                <Form.Control
                                    id="jobDescription"
                                    as="textarea" 
                                    rows={5}
                                    style={{height:100}}
                                    placeholder="Neobavezno"
                                    value={this.state.add.job.description}
                                    onChange={(e) => this.setAddNewJobStringState('description', e.target.value)}
                                    />
                            </FloatingLabel>
                            <FloatingLabel label="Šifra radnog mjesta" className="mb-3">
                                <Form.Control
                                    id="jobCode"
                                    type="text"
                                    placeholder="Šifra radnog mjesta"
                                    value={this.state.add.job.jobCode}
                                    onChange={(e) => this.setAddNewJobStringState('jobCode', e.target.value)}
                                    required />
                            </FloatingLabel>
                        </Form.Group>
                    </Form>
                </Card.Body>
                <Card.Footer className={this.state.add.job.title ? '' : 'd-none'}>
                        <Row style={{ alignItems: 'end' }}>
                            <Button onClick={() => this.doAddJob()} 
                                    variant="success">
                            <i className="bi bi-plus-circle" /> Dodaj radno mjesto</Button>
                        </Row>
                </Card.Footer>
            </Card>
            <Card className="mb-3">
                <Card.Header>
                    <Card.Title>Detalji lokacije</Card.Title>
                </Card.Header>
                <Card.Body>
                    <Form>
                        <Form.Group className="mb-3 ">
                            <FloatingLabel label="Naziv lokacije" className="mb-3 was-validated">
                                <Form.Control
                                    id="locationName"
                                    type="text"
                                    placeholder="Naziv lokacije"
                                    value={this.state.add.location.name}
                                    onChange={(e) => this.setAddNewLocationStringState('name', e.target.value)}
                                    required />
                            </FloatingLabel>
                            <FloatingLabel label="Šifra lokacije" className="mb-3">
                                <Form.Control
                                    id="locationCode"
                                    type="text"
                                    placeholder="Šifra lokacije"
                                    value={this.state.add.location.code}
                                    onChange={(e) => this.setAddNewLocationStringState('code', e.target.value)}
                                    required />
                            </FloatingLabel>

                            <Form.Text>Opciju koristiti u slučaju da lokacija ne postoji, pa se dodaje pod-lokacija
                            </Form.Text>
                            <FloatingLabel style={{marginTop:8}} label="Pripada lokaciji" className="mb-3">
                                <Form.Select
                                    id='parentLocationId'
                                    value={this.state.add.location.parentLocationId?.toString()}
                                    onChange={(e) => this.setAddNewLocationStringState('parentLocationId', e.target.value)}
                                    >
                                    <option value='NULL'>izaberi podlokaciju</option>
                                    {this.state.locationBase.map(locData => (
                                        <option value={locData.locationId?.toString()}>{locData.name}</option>
                                    ))}
                                </Form.Select>
                            </FloatingLabel>
                        </Form.Group>
                    </Form>
                </Card.Body>
                <Card.Footer className={this.state.add.location.name ? '' : 'd-none'}>
                        <Row style={{ alignItems: 'end' }}>
                            <Button onClick={() => this.doAddLocation()} 
                                    variant="success">
                            <i className="bi bi-plus-circle" /> Dodaj lokaciju</Button>
                        </Row>
                    </Card.Footer>
            </Card>

            <Card className="mb-3">
                <Card.Header>
                    <Card.Title>Povezivanje</Card.Title>
                    <Card.Subtitle>
                        <Form.Text>
                            U ovoj formi izvršavate povezivanje sektora/službe/odjeljenja sa pripadajućim radnim mjesto te lokacijom
                        </Form.Text>
                     </Card.Subtitle>
                </Card.Header>
               
                <Card.Body>
                    <Form>
                        <Form.Group className="mb-3 ">
                        <FloatingLabel style={{marginTop:8}} label="Sektor/služba/odjeljenje" className="mb-3">
                                <Form.Select
                                    id='departmentId'
                                    value={this.state.add.departmentJobLocation?.departmentId.toString()}
                                    onChange={(e) => this.setAddNewDepartmentJobLocationStringState('departmentId', e.target.value)}
                                    >
                                    <option value=''>izaberi sektor/službu/odjeljenje</option>
                                    {this.state.departmentBase.map(data => (
                                        <option value={data.departmentId?.toString()}>{data.title}</option>
                                    ))}
                                </Form.Select>
                            </FloatingLabel>

                            <FloatingLabel style={{marginTop:8}} label="Naziv radnog mjesta" className={this.state.add.departmentJobLocation?.departmentId ? '' : 'd-none'}>
                                <Form.Select
                                    id='jobTitleSelector'
                                    value={this.state.add.departmentJobLocation?.jobId.toString()}
                                    onChange={e => {this.setAddNewDepartmentJobLocationStringState('jobId', e.target.value)}}
                                    >
                                    <option value=''>izaberi radno mjesto</option>
                                    {this.state.jobBase.map(jobData => (
                                        <option value={jobData.jobId?.toString()}>{jobData.title}</option>
                                    ))}
                                </Form.Select>
                            </FloatingLabel>

                            <FloatingLabel style={{marginTop:8}} label="Lokacija" className={this.state.add.departmentJobLocation?.jobId ? '' : 'd-none'}>
                                <Form.Select
                                    id='location'
                                    value={this.state.add.departmentJobLocation?.locationId.toString()}
                                    onChange={(e) => this.setAddNewDepartmentJobLocationStringState('locationId', e.target.value)}
                                    >
                                    <option value='NULL'>izaberi lokaciju</option>
                                    {this.state.locationBase.map(locData => (
                                        <option value={locData.locationId?.toString()}>{locData.name}</option>
                                    ))}
                                </Form.Select>
                            </FloatingLabel>
                        </Form.Group>
                    </Form>
                </Card.Body>
                <Card.Footer className={this.state.add.departmentJobLocation?.locationId ? '' : 'd-none'}>
                        <Row style={{ alignItems: 'end' }}>
                            <Button onClick={() => this.doAddDepartmentJobLocation()} 
                                    variant="success">
                            <i className="bi bi-plus-circle" /> Poveži </Button>
                        </Row>
                    </Card.Footer>
            </Card>
            </>
        )
    }

    /* RENDERER */

    render() {
        return (
            <>
            <RoledMainMenu role="administrator" />
            <Container style={{ marginTop:15}}>
                {this.renderCategoryData()}
                
            </Container>
            </>
        )
    }

    renderCategoryData() {
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
}