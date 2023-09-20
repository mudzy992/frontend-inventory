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

interface AddDepartmentState {
    error: {
        message?: string;
        visible: boolean;
    };
    departmentBase: DepartmentType[];
    add: {
        department: {
            title: string;
            description: string;
            departmentCode: string;
            parentDepartmentId?: number;
        },
    }
}

export default class AddDepartment extends React.Component<{}> {
    state: AddDepartmentState;
    constructor(props: Readonly<{}>) {
        super(props);
        this.state = {
            error: {
                visible: false,
            },
            departmentBase:[],
            add: {
                department: {
                    title: '',
                    description: '',
                    departmentCode: '',
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

    private async showErrorMessage() {
        this.setErrorMessageVisible(true)
    }

    private setErrorMessageVisible(newState: boolean) {
        this.setState(Object.assign(this.state.error,{
            visible: newState,
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

    private doAddDepartment() {
        api('api/department/', 'post', this.state.add.department, 'administrator')
        .then((res: ApiResponse) => {
            if (res.status === "error" || res.status === "login") {
                this.setErrorMessage('Greška prilikom dodavanja sektora/službe/odjeljenja.');
                return;
            }
            this.setErrorMessage('Uspješno dodan sektor/služba/odjeljenje');
            this.showErrorMessage()
            this.getDepartments();
        })
    }

    addForm() {
        return(
            <div>
            <Modal.Header closeButton>
                    <Modal.Title>Detalji sektora/službe/odjeljenja</Modal.Title>
                </Modal.Header>
                <Modal.Body >
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
                            <Stack spacing={2} sx={{ width: '100%' }}>
                                <Snackbar open={this.state.error.visible} autoHideDuration={6000} onClose={()=> this.setErrorMessageVisible(false)}>
                                    <MuiAlert severity="success" sx={{ width: '100%' }}>
                                        {this.printOptionalMessage()}
                                    </MuiAlert>
                                </Snackbar>
                            </Stack>
                        </Form.Group>
                    </Form>
                <Modal.Footer className={this.state.add.department.title ? '' : 'd-none'}>
                    <Row style={{ alignItems: 'end' }}>
                        <Button onClick={() => this.doAddDepartment()} 
                                variant="success">
                        <i className="bi bi-plus-circle" /> Dodaj sektor/službu/odjeljenje
                        </Button>
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