import React from 'react';
import api, { ApiResponse } from '../../../API/api';
import { Button, Col, Container, FloatingLabel, Form, Modal, Row } from 'react-bootstrap';
import MuiAlert from '@mui/material/Alert';


interface JobType {
    jobId: number;
    title: string;
    description: string;
    jobCode: string;
}

interface AddJobState {
    message?: string;
    jobBase: JobType[];
    add: {
        job: {
            title: string;
            description: string;
            jobCode: string;
        },
    }
}

export default class AddJob extends React.Component<{}> {
    state: AddJobState;
    constructor(props: Readonly<{}>) {
        super(props);
        this.state = {
            jobBase: [],
            add: {
                job: {
                    title: '',
                    description: '',
                    jobCode: ''
                },
            } 
        }
    }

    componentDidMount() {
        this.getJobs()
    }

    /* SET */
    private setAddNewJobStringState(fieldName: string, newValue: string) {
        this.setState(Object.assign(this.state,
            Object.assign(this.state.add.job, {
                [fieldName]: newValue,
            })))
    }

    private setErrorMessage(message: string) {
        this.setState(Object.assign(this.state, {
            message: message,
        }));
    }

    private setJobData(jobData: JobType[]) {
        this.setState(Object.assign(this.state, {
            jobBase: jobData,
        }));
    }

    /* GET */

    private getJobs() {
        api('api/job/', 'get', {}, 'administrator')
        .then((res: ApiResponse) => {
            if (res.status === "error" || res.status === "login") {
                this.setErrorMessage('Greška prilikom učitavanja radnih mjesta.');
                return;
            }   
            this.setJobData(res.data);
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

    private doAddJob() {
        api('api/job/', 'post', this.state.add.job, 'administrator')
        .then((res: ApiResponse) => {
            if (res.status === "error" || res.status === "login") {
                this.setErrorMessage('Greška prilikom dodavanja radnog mjesta.');
                return;
            }
            this.setErrorMessage('Uspješno dodano radno mjesto');
            this.getJobs();
        })
    }

    addForm() {
        return(
            <><Modal.Header closeButton>
                    <Modal.Title>Detalji radnog mjesta</Modal.Title>
                </Modal.Header>
                <Modal.Body >
                    <Form>
                        <Form.Group className="mb-3 ">
                            <FloatingLabel label="Naziv radnog mjesta" className="mb-3 was-validated" /* className={this.state.add.job.title ? 'false' : 'd-none'} */>
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
                            <MuiAlert elevation={6} variant="filled" severity="success" className={this.state.message ? '' : 'd-none'}>
                                {this.printOptionalMessage()}
                            </MuiAlert>
                        </Form.Group>
                    </Form>
                    <Modal.Footer className={this.state.add.job.title ? '' : 'd-none'}>
                    <Row style={{ alignItems: 'end' }}>
                            <Button onClick={() => this.doAddJob()} 
                                    variant="success">
                            <i className="bi bi-plus-circle" /> Dodaj radno mjesto</Button>
                        </Row>
                </Modal.Footer>
                </Modal.Body>
            </>
        )
    }

    /* RENDERER */

    render() {
        return (
            <>
            <Container style={{ marginTop:15}}>
                {this.renderData()}
            </Container>
            </>
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