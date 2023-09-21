import React from 'react';
import api, { ApiResponse } from '../../../API/api';
import { Button, Col, Container, FloatingLabel, Form, Modal, Row } from 'react-bootstrap';
import MuiAlert from '@mui/material/Alert';
import { Snackbar, Stack } from '@mui/material';

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
interface AddDepartmentJobLocationState {
    error: {
        message?: string;
        visible: boolean;
    };
    departmentBase: DepartmentType[];
    jobBase: JobType[];
    locationBase: LocationType[];
    add: {
        departmentJobLocation: {
            departmentId: number;
            jobId: number;
            locationId: number;
        }
    }
}

export default class AddDepartmentJobLocation extends React.Component<{}> {
    state: AddDepartmentJobLocationState;
    constructor(props: Readonly<{}>) {
        super(props);
        this.state = {
            error: {
                visible: false,
            },
            departmentBase:[],
            jobBase: [],
            locationBase: [],
            add: {
                departmentJobLocation: {
                    departmentId: 0,
                    jobId: 0,
                    locationId: 0,
                }
            } 
        }
    }

    componentDidMount() {
        this.getData()
    }

    /* SET */

    private setAddNewDepartmentJobLocationStringState(fieldName: string, newValue: string) {
        this.setState(Object.assign(this.state,
            Object.assign(this.state.add.departmentJobLocation, {
                [fieldName]: newValue,
            })))
    }

    private setErrorMessage(message: string) {
        this.setState(Object.assign(this.state.error, {
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

    private async showErrorMessage() {
        this.setErrorMessageVisible(true)
    }

    private setErrorMessageVisible(newState: boolean) {
        this.setState(Object.assign(this.state,
            Object.assign(this.state.error, {
                visible: newState,
            })
        ));
    }

    /* GET */

    private getData() {
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
        if (this.state.error.message === '') {
            return;
        }

        return (
            <div>
                {this.state.error.message}
            </div>
        );
    }
    private doAddDepartmentJobLocation() {
        api('api/departmentJob/', 'post', this.state.add.departmentJobLocation, 'administrator')
        .then((res: ApiResponse) => {
            if (res.status === "error" || res.status === "login") {
                this.setErrorMessage('Greška prilikom dodavanja sektora/službe/odjeljenja, pripadajućeg radnog mjesta te lokacije.');
                return;
            }
            this.setErrorMessage('Uspješno dodan sektor/služba/odjeljenje, pripadajuće radno mjesto te lokacija');
            this.showErrorMessage()
            this.getData();
        })
    }

    addForm() {
        return(
            <div><Modal.Header closeButton>
                <Modal.Title>Modul povezivanja radnog mjesta sa sektorom i lokacijom</Modal.Title>
            </Modal.Header>
            <Modal.Body >
                    <Form>
                        <Form.Group className="mb-3 ">
                        <FloatingLabel style={{marginTop:8}} label="Sektor/služba/odjeljenje" className="mb-3">
                                <Form.Select
                                    id='departmentId'
                                    value={this.state.add.departmentJobLocation?.departmentId.toString()}
                                    onChange={(e) => this.setAddNewDepartmentJobLocationStringState('departmentId', e.target.value)}
                                    >
                                    <option value=''>izaberi sektor/službu/odjeljenje</option>
                                    {this.state.departmentBase.map((data, index) => (
                                        <option key={index} value={data.departmentId?.toString()}>{data.title}</option>
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
                                    {this.state.jobBase.map((jobData, index) => (
                                        <option key={index} value={jobData.jobId?.toString()}>{jobData.title}</option>
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
                                    {this.state.locationBase.map((locData, index) => (
                                        <option key={index} value={locData.locationId?.toString()}>{locData.name}</option>
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
                    <Modal.Footer className={this.state.add.departmentJobLocation?.locationId ? '' : 'd-none'}>
                    <Row style={{ alignItems: 'end' }}>
                            <Button onClick={() => this.doAddDepartmentJobLocation()} 
                                    variant="success"
                                    style={{background:"#70A9A1", color:"#1F363D", border:0, fontSize:18}}>
                            <i className="bi bi-node-plus" /> Poveži </Button>
                        </Row>
                </Modal.Footer>
                </Modal.Body>
            </div>
        )
    }

    /* RENDERER */

    render() {
        return (
            <div>
                <Container style={{ marginTop:15}}>
                    {this.renderData()}
                    
                </Container>
            </div>
        )
    }

    renderData() {
        return(
            <Row>
            <Col xs ="12" lg="12">
                <Row>
                    <Col style={{marginTop:5}} xs="12" lg="12" sm="12">
                            {this.addForm()}
                    </Col>
                </Row>
            </Col>
        </Row>
        )
    }
}