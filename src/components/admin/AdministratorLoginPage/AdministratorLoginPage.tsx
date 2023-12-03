import React, { useState, useEffect } from 'react';
import { Container, Col, Card, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api, { ApiResponse, saveRefreshToken, saveToken } from '../../../API/api';

interface AdministratorLoginPageProps {}

interface AdministratorLoginPageState {
    username: string;
    password: string;
    administratorID: number[];
    isLoggedIn: boolean;
    isTyping: boolean;
    error: {
        message?: string;
        visible: boolean;
    };
}

const AdministratorLoginPage: React.FC<AdministratorLoginPageProps> = () => {
    const [state, setState] = useState<AdministratorLoginPageState>({
        username: '',
        password: '',
        administratorID: [],
        isLoggedIn: false,
        isTyping: true,
        error: {
            visible: false,
        },
    });

    const navigate = useNavigate();

    useEffect(() => {
        const typingTimeout = setTimeout(() => {
            setState({ ...state, isTyping: false });
        }, 3500);

        return () => clearTimeout(typingTimeout);
    }, []);

    const formInputChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        setState({
            ...state,
            [event.target.id]: event.target.value,
        });
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            doLogin();
        }
    };

    const setLogginState = (isLoggedIn: boolean) => {
        setState({
            ...state,
            isLoggedIn: isLoggedIn,
        });

        if (isLoggedIn) {
            navigate('/');
        }
    };

    const setAdministratorID = (administratorID: number[]) => {
        setState({
            ...state,
            administratorID: administratorID,
        });
    };

    const setErrorMessage = (message: string) => {
        setState({
            ...state,
            error: {
                ...state.error,
                message: message,
            },
        });
    };

    const showErrorMessage = () => {
        setErrorMessageVisible(true);
    };

    const setErrorMessageVisible = (newState: boolean) => {
        setState({
            ...state,
            error: {
                ...state.error,
                visible: newState,
            },
        });
    };

    const doLogin = () => {
        api('auth/administrator/login', 'post', {
            username: state.username,
            password: state.password,
        }).then((res: ApiResponse) => {
            if (res.status === 'error') {
                setErrorMessage('System error... Try again!');
                return;
            }

            if (res.status === 'ok') {
                if (res.data.statusCode !== undefined) {
                    let message = '';

                    switch (res.data.statusCode) {
                        case -3001:
                        case -3002:
                            message = 'Neispravni korisnički podaci!';
                            break;
                    }

                    setErrorMessage(message);
                    showErrorMessage();
                    return;
                }

                setAdministratorID(res.data.id);
                saveToken('administrator', res.data.token);
                saveRefreshToken('administrator', res.data.refreshToken);

                setLogginState(true);
            }
        });
    };

    return (
        <Container>
            <Col md={{ span: 4, offset: 4 }}>
                <Card style={{ marginTop: '50%' }}>
                    <div className="logo-container">
                        <div className="circle">
                            <i className="bi bi-incognito incognito-icon"></i>
                        </div>
                        <div className={`typing ${state.isTyping ? 'typing' : ''}`}>Inventory Database</div>
                    </div>
                    <Card.Body>
                        <Card.Title>
                            <i className="bi bi-box-arrow-in-right" /> Administrator Login
                        </Card.Title>
                        <Form>
                            <Form.Group>
                                <Form.Label className="login-form-label" htmlFor="username">
                                    Korisničko ime:
                                </Form.Label>
                                <Form.Control
                                    className="login-form-control"
                                    type="text"
                                    id="username"
                                    value={state.username}
                                    onChange={(event) => formInputChanged(event as any)}
                                    onKeyDown={(event) => handleKeyPress(event as any)}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label className="login-form-label" htmlFor="password">
                                    Lozinka:
                                </Form.Label>
                                <Form.Control
                                    className="login-form-control"
                                    type="password"
                                    id="password"
                                    value={state.password}
                                    onChange={(event) => formInputChanged(event as any)}
                                    onKeyDown={(event) => handleKeyPress(event as any)}
                                />
                            </Form.Group>
                            <Form.Group>
                                <div className="block">
                                    <Button variant="success" className="btn-style" onClick={() => doLogin()}>
                                        Prijava
                                    </Button>
                                </div>
                            </Form.Group>
                        </Form>
                    </Card.Body>
                </Card>
            </Col>
        </Container>
    );
};

export default AdministratorLoginPage;
