import React, { useEffect, useState } from 'react';
import api, { ApiResponse } from '../../../API/api';
import { Button, Input, ModalBody, ModalContent, ModalFooter, ModalHeader, Textarea } from '@nextui-org/react';
import { Alert } from '../../custom/Alert';
/* import { Redirect } from 'react-router-dom'; */


interface JobType {
    jobId: number;
    title: string;
    description: string;
    jobCode: string;
}

interface AddJobState {
    error: {
        message?: string;
        visible: boolean;
    };
    jobBase: JobType[];
    isLoggedIn: boolean;
    add: {
        job: {
            title: string;
            description: string;
            jobCode: string;
        },
    }
}

const AddJob: React.FC = () => {
    const [state, setState] = useState<AddJobState>({
        error: {
                visible: false,
            },
            isLoggedIn: true,
            jobBase: [],
            add: {
                job: {
                    title: '',
                    description: '',
                    jobCode: ''
                },
            }
    })

    useEffect(() => {
        getJobs()
    }, [])

    /* SET */
    const setAddNewJobStringState = (fieldName:string, newValue:string) => {
        setState((prevState) => ({
          ...prevState,
          add: {
            ...prevState.add,
            job: {
              ...prevState.add.job,
              [fieldName]: newValue,
            },
          },
        }));
    };

    const setErrorMessage = (message: string) => {
        setState(prev => ({...prev, message: message}))
    }

    const setLoggedInStatus = (isLoggedIn: boolean) => {
        setState(prev => ({...prev, isLoggedIn: isLoggedIn}))
    }

    const setJobData = (jobData: JobType[]) => {
        setState(Object.assign(state, {
            jobBase: jobData,
        }));
    }

    const showErrorMessage = async() => {
        setErrorMessageVisible(true)
    }

    const setErrorMessageVisible = (newState: boolean) => {
        setState(Object.assign(state,
            Object.assign(state.error, {
                visible: newState,
            })
        ));
    }

    /* GET */

    const getJobs = () => {
        api('api/job?sort=title,ASC', 'get', {}, 'administrator')
        .then((res: ApiResponse) => {
            if(res.status === 'login') {
                setLoggedInStatus(false);
                return
            }
            if (res.status === "error") {
                setErrorMessage('Greška prilikom učitavanja radnih mjesta.');
                return;
            }   
            setJobData(res.data);
        })

    }

    /* DODATNE FUNCKIJE */
    const printOptionalMessage = () => {
        if (state.error.message === '') {
            return;
        }

        return (
            <Alert title='info' variant='info' body={state.error.message!} />
        );
    }

    const doAddJob = () => {
        api('api/job/', 'post', state.add.job, 'administrator')
        .then((res: ApiResponse) => {
            if(res.status === 'login') {
                setLoggedInStatus(false);
                return
            }
            if (res.status === "error") {
                setErrorMessage('Greška prilikom dodavanja radnog mjesta.');
                return;
            }
            setErrorMessage('Uspješno dodano radno mjesto');
            showErrorMessage()
            getJobs();
        })
    }

    const addForm = () => {
        return(
            <ModalContent>
                <ModalHeader>
                    Detalji radnog mjesta
                </ModalHeader>
                <ModalBody >
                    <div className="flex flex-col">
                        <div className='w-full mb-3 mr-3'>
                            <Input
                            id="jobTitle" 
                            type="text" 
                            label="Naziv radnog mjesta"
                            labelPlacement='inside'
                            value={state.add.job.title}
                            onChange={e => {setAddNewJobStringState('title', e.target.value)}}
                            >
                            </Input>
                        </div>
                        <div className='w-full mb-3 mr-3'>
                            <Textarea
                                id="jobDescription"
                                label="Opis"
                                placeholder="Opišite radno mjesto"
                                value={state.add.job.description}
                                onChange={(e) => setAddNewJobStringState('description', e.target.value)}
                            />
                        </div>
                        <div className='lg:flex w-full'>
                            <Input
                            id="jobCode" 
                            type="text" 
                            label="Šifra radnog mjesta"
                            labelPlacement='inside'
                            value={state.add.job.jobCode}
                            onChange={(e) => setAddNewJobStringState('jobCode', e.target.value)}
                            >
                            </Input> 
                        </div>
                    </div>
                    <ModalFooter className={state.add.job.title ? '' : 'hidden'}>
                    <div style={{ alignItems: 'end' }}>
                        <Button 
                            onClick={() => doAddJob()} 
                            color="success">
                                <i className="bi bi-plus-circle" /> 
                                Dodaj radno mjesto
                        </Button>
                    </div>
                </ModalFooter>
                </ModalBody>
            </ModalContent>
        )
    }
    return (
        <div>
            <div>
                {addForm()}
            </div>
        </div>
    )
}
export default AddJob;