import React, { useState, useEffect } from 'react';
import './style.css';
import { Container, Col, Card, Form, Button } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import api, { ApiResponse, saveRefreshToken, saveToken } from '../../../API/api';
import MuiAlert from '@mui/material/Alert';
import { Snackbar, Stack } from '@mui/material';


interface AdministratorData {
    id: number;
}

interface AdministratorLoginPageState {
    username: string;
    password: string;
    administratorID: AdministratorData[];
    isLoggedIn: boolean;
    error: {
        message?: string;
        visible: boolean;
    };
    isTyping: boolean;
    showAdminText: boolean;
}

export default function AdministratorLoginPage() {
    const [state, setState] = useState<AdministratorLoginPageState>({
        username: '',
        password: '',
        administratorID: [],
        isLoggedIn: false,
        error: {
            visible: false,
        },
        isTyping: true,
        showAdminText: false, // Dodajte ovu promjenljivu
    });

    useEffect(() => {
        const typingTimeout = setTimeout(() => {
            setState({ ...state, isTyping: false });
        }, 3500); // Promijenite trajanje na 3500ms (3.5s)

        return () => clearTimeout(typingTimeout);
    }, [state]);

    const formInputChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        setState({ ...state, [event.target.id]: event.target.value });
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            doLogin();
        }
    };

    const setLoggingState = (isLoggedIn: boolean) => {
        setState({ ...state, isLoggedIn });
    };

    const setAdminID = (administratorID: AdministratorData[]) => {
        setState({ ...state, administratorID });
    };

    const setErrorMessage = (message: string) => {
        setState({ ...state, error: { ...state.error, message } });
    };

    const showErrorMessage = () => {
        setErrorMessageVisible(true);
    };

    const setErrorMessageVisible = (newState: boolean) => {
        setState({ ...state, error: { ...state.error, visible: newState } });
    };

    const doLogin = () => {
        api('auth/administrator/login', 'post', {
            username: state.username,
            password: state.password,
        })
            .then((res: ApiResponse) => {
                if (res.status === 'error') {
                    setErrorMessage('Sistemski problem... Pokušajte ponovo!');
                    return;
                }

                if (res.status === 'ok') {
                    if (res.data.statusCode !== undefined) {
                        let message = '';

                        switch (res.data.statusCode) {
                            case -3001:
                                message = 'Neispravni korisnički podaci!';
                                break;
                            case -3002:
                                message = 'Neispravni korisnički podaci!';
                                break;
                            default:
                                message = 'Nepoznata greška prilikom prijave';
                        }

                        setErrorMessage(message);
                        showErrorMessage();
                        return;
                    }
                    setAdminID(res.data.id);
                    saveToken('administrator', res.data.token);
                    saveRefreshToken('administrator', res.data.refreshToken);

                    setLoggingState(true);
                }
            });
    };

    if (state.isLoggedIn === true) {
        return <Redirect to="/" />;
    }

    return (
        <Container>
            
            <Col md={{ span: 4, offset: 4 }}>
                <Card style={{ marginTop: '50%' }}>
                <div className="logo-container">
                        <div className="circle">
                            <i className="bi bi-incognito incognito-icon"></i>
                        </div>
                            <div className={`typing ${state.isTyping ? 'typing' : ''}`}>Inventory Database
                            </div>
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
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => formInputChanged(event)}
                                    onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => handleKeyPress(event)}
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
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => formInputChanged(event)}
                                    onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => handleKeyPress(event)}
                                />
                            </Form.Group>
                            <Form.Group>
                                <div className="block">
                                    <Button
                                        variant="success"
                                        className="btn-style"
                                        onClick={() => doLogin()}
                                    >
                                        Prijava
                                    </Button>
                                </div>
                            </Form.Group>
                        </Form>
                        <Stack spacing={2} sx={{ width: '100%' }}>
                            <Snackbar
                                open={state.error.visible}
                                autoHideDuration={6000}
                                onClose={() => setErrorMessageVisible(false)}
                                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                            >
                                <MuiAlert severity="error" sx={{ width: '100%' }}>
                                    {state.error.message}
                                </MuiAlert>
                            </Snackbar>
                        </Stack>
                    </Card.Body>
                </Card>
            </Col>
        </Container>
    );
}
