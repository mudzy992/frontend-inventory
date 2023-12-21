import React, { useEffect, useState } from 'react'
import api, { ApiResponse, saveRefreshToken, saveToken } from '../../../API/api';
import { useNavigate } from 'react-router-dom';
import { Alert } from '../../custom/Alert';
import { Button, Divider, Input } from '@nextui-org/react';
import {  saveIdentity, useUserContext } from '../../UserContext/UserContext';

interface UserLoginPageState {
    email: string;
    password: string;
    userID: number;
    errorMessage: string;
    isLoggedIn: boolean;
    isAlertClosed: boolean,
}

const UserLoginPage: React.FC = () => {

const [state, setState] = useState<UserLoginPageState>({
    email: '',
    password: '',
    userID: 0,
    errorMessage: '',
    isLoggedIn: false,
    isAlertClosed: false,
})

const navigate = useNavigate();
const [isVisible, setIsVisible] = React.useState(false);
const toggleVisibility = () => setIsVisible(!isVisible);
const { setUserId, setRole } = useUserContext();
const [userRole, setUserRole] = useState<string>('')

const formInputChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({...state, [event.target.id]: event.target.value})
}

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
};

const setUserID = (userID: number) => {
    setState({
      ...state,
      userID: userID,
    });
  };


const closeAlert = () => {
    setState((prev) => ({ ...prev, isAlertClosed: true }));
};

const openAlert = () => {
    setState((prev) => ({ ...prev, isAlertClosed: false }));
};

const setErrorMessage = (message: string) => {
    setState((prev) => ({ ...prev, errorMessage: message, isAlertClosed: false }));
};

const printErrorMessage = () => {
    if (!state.errorMessage || state.isAlertClosed) {
        return null;
    }
    return (
        <Alert 
        showCloseButton={true} 
        variant='danger' 
        title='Upozorenje!' 
        body={state.errorMessage}
        isOpen={!state.isAlertClosed}
        onClose={closeAlert} />
    );
};


const doLogin = async () => {
    api(
        'auth/login',
        'post',
        {
            email: state.email,
            password: state.password,
        }
    )
        .then(async (res: ApiResponse) => {
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
                    return;
                }
                if (res.status === 'ok') {
                    await setLogginState(true);
                    await saveIdentity(res.data.role, res.data.id, setRole, setUserId);
                    await setUserID(res.data.id);
                    await saveToken(res.data.token);
                    await saveRefreshToken(res.data.refreshToken);

                    if(res.data.role === 'user'){
                        navigate(`/user/profile/${res.data.id}`);
                    } else if(res.data.role === 'administrator') {
                        navigate(`/`);   
                    }
                }
            }
        });
}

useEffect(() => {
    if (state.errorMessage && !state.isAlertClosed) {
      openAlert();
    }
  }, [state.errorMessage, state.isAlertClosed]);

return (
    <div className='grid gap-3'>
        <div className='text-center text-3xl text-gray-400'>
            <p>
                Korisnička prijava
            </p>
        </div>
        <Input
            type='text'
            id='email'
            label='Email'
            placeholder="Unesite email"
            variant="flat"
            labelPlacement='outside'
            value={state.email}
            onChange={(event) => formInputChanged(event as any)}
            onKeyDown={(event) => handleKeyPress(event as any)} 
            startContent={
                <i className="bi bi-envelope-at-fill text-2xl text-default-400 pointer-events-none"></i>
            }
        />
        <Input
            id='password'
            label="Lozinka"
            variant="flat"
            labelPlacement='outside'
            placeholder="Unesite lozinku"
            endContent={<button className="focus:outline-none" type="button" onClick={toggleVisibility}>
                {isVisible ? (
                    <i className="bi bi-eye-fill text-2xl text-default-400 pointer-events-none" />
                ) : (
                    <i className="bi bi-eye-slash-fill text-2xl text-default-400 pointer-events-none" />
                )}
            </button>}
            type={isVisible ? "text" : "password"}
            value={state.password}
            onChange={(event) => formInputChanged(event as any)}
            onKeyDown={(event) => handleKeyPress(event as any)} 
            startContent={
                <i className="bi bi-key-fill text-2xl text-default-400 pointer-events-none"></i>
            }
        />
        <Divider className="my-4" />
        <Button size='lg' variant="solid" color='default' onClick={() => doLogin()}>
            Prijava
        </Button>
        <div>
            {printErrorMessage()}
        </div>
    </div>
                
)}

export default UserLoginPage;
