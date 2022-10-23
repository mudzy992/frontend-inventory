import React from 'react';
import { Container, Card, Row, Col, Form, FloatingLabel, Button, Alert,} from 'react-bootstrap';
import api, { ApiResponse } from '../../../API/api';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import AdminMenu from '../AdminMenu/AdminMenu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';


interface AddUserPageState{
    message: string;
    addUser: {
        surename: string;
        forname: string;
        email: string;
        job: string;
        department: string;
        location: string;
        password: string;
    };
    errorMessage: string;
}

export default class AddUserPage extends React.Component<{}>{
    state: AddUserPageState;
    constructor(props: Readonly<{}>) {
        super(props);
        this.state = {
            message: '',
            addUser: {
                surename: '',
                forname: '',
                email: '',
                job: '',
                department: '',
                location: '',
                password: '',
            },
            errorMessage: '',
        }
    }
    
    componentDidMount() {

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
    /* Kraj SET */
    /* GET */

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
            job: this.state.addUser.job,
            department: this.state.addUser.department,
            location: this.state.addUser.location,
            
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
                                <FloatingLabel controlId='surename' label="Ime" className="mb-3">
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
                                <FloatingLabel controlId='forname' label="Prezime" className="mb-3">
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
                                <FloatingLabel controlId='email' label="Email" className="mb-3">
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
                                <FloatingLabel controlId='password' label="Lozinka" className="mb-3">
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
                                <FloatingLabel controlId='job' label="Radno mjesto" className="mb-3">
                                <Form.Control 
                                id="job" 
                                type="text" 
                                placeholder="Radno mjesto"
                                value={ this.state.addUser.job }
                                onChange={ (e) => this.setAddUserStringFieldState('job', e.target.value) }
                                required />
                            </FloatingLabel>
                            </Col>
                            <Col lg="6" xs="12">
                                <FloatingLabel controlId='name' label="Sektor" className="mb-3">
                                <Form.Control 
                                id="department" 
                                type="text" 
                                placeholder="Sektor"
                                value={ this.state.addUser.department }
                                onChange={ (e) => this.setAddUserStringFieldState('department', e.target.value) }
                                required />
                            </FloatingLabel>
                            </Col>
                        </Row>
                        <FloatingLabel controlId='location' label="Lokacija" className="mb-3">
                            <Form.Select id="location" required
                                onChange={(e) => this.setAddUserStringFieldState('location', e.target.value)}>
                                <option value=''> izaberi lokaciju</option>
                                <option value='Direkcija Zenica'>
                                    Direkcija Zenica
                                </option>
                                <option value='PJ Zenica - Radakovo'>
                                    PJ Zenica - Radakovo
                                </option>
                                <option value='PJ Visoko'>
                                    PJ Visoko
                                </option>
                                <option value='PJ Breza'>
                                    PJ Breza
                                </option>
                                <option value='PJ Vareš'>
                                    PJ Vareš
                                </option>
                                <option value='PJ Olovo'>
                                    PJ Olovo
                                </option>
                                <option value='PJ Tešanj'>
                                    PJ Tešanj
                                </option>
                                <option value='PJ Matuzići'>
                                    PJ Matuzići
                                </option>
                                <option value='PJ Zavidovići'>
                                    PJ Zavidovići
                                </option>
                                <option value='PJ Maglaj'>
                                    PJ Maglaj
                                </option>
                                <option value='PJ Žepće'>
                                    PJ Žepće
                                </option>
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