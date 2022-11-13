import React from 'react';
import api, { ApiResponse } from '../../../API/api';
import { Button, Col, Container, FloatingLabel, Form, Modal, Row } from 'react-bootstrap';
import MuiAlert from '@mui/material/Alert';
import { Snackbar, Stack } from '@mui/material';


interface LocationType {
    locationId: number;
    name: string;
    code: string;
    parentLocationId: number;
}
interface AddLocationState {
    error: {
        message?: string;
        visible: boolean;
    };
    locationBase: LocationType[];
    add: {
        location: {
            name: string;
            code: string;
            parentLocationId?: number;
        },
    }
}

export default class AddLocation extends React.Component<{}> {
    state: AddLocationState;
    constructor(props: Readonly<{}>) {
        super(props);
        this.state = {
            error: {
                visible: false,
            },
            locationBase: [],
            add: {
                location: {
                    name: '',
                    code: '',
                },
            } 
        }
    }

    componentDidMount() {
        this.getLocations()
    }

    /* SET */


    private setAddNewLocationStringState(fieldName: string, newValue: string) {
        this.setState(Object.assign(this.state,
            Object.assign(this.state.add.location, {
                [fieldName]: newValue,
            })))
    }

    private setErrorMessage(message: string) {
        this.setState(Object.assign(this.state.error, {
            message: message,
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

    private getLocations() {
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
            <>
                {this.state.error.message}
            </>
        );
    }

    private doAddLocation() {
        api('api/location/', 'post', this.state.add.location, 'administrator')
        .then((res: ApiResponse) => {
            if (res.status === "error" || res.status === "login") {
                this.setErrorMessage('Greška prilikom dodavanja lokacije.');
                return;
            }
            this.setErrorMessage('Uspješno dodana lokacija');
            this.showErrorMessage()
            this.getLocations();
        })
    }

    addForm() {
        return(
            <>
            <Modal.Header closeButton>
                    <Modal.Title>Detalji sektora/službe/odjeljenja</Modal.Title>
                </Modal.Header>
                <Modal.Body >
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
                            <Stack spacing={2} sx={{ width: '100%' }}>
                                <Snackbar open={this.state.error.visible} autoHideDuration={6000} onClose={()=> this.setErrorMessageVisible(false)}>
                                    <MuiAlert severity="success" sx={{ width: '100%' }}>
                                        {this.printOptionalMessage()}
                                    </MuiAlert>
                                </Snackbar>
                            </Stack>
                        </Form.Group>
                    </Form>
                    <Modal.Footer className={this.state.add.location.name ? '' : 'd-none'}>
                    <Row style={{ alignItems: 'end' }}>
                            <Button onClick={() => this.doAddLocation()} 
                                    variant="success">
                            <i className="bi bi-plus-circle" /> Dodaj lokaciju</Button>
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