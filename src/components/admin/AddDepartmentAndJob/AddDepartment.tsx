import React, { useEffect, useState } from 'react';
import api, { ApiResponse } from '../../../API/api';
import { Button, Input, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, Spinner, Textarea } from '@nextui-org/react';
import { Alert } from '../../custom/Alert';

/* import { Redirect } from 'react-router-dom'; */

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
    isLoggedIn: boolean;
    add: {
        department: {
            title: string;
            description: string;
            departmentCode: string;
            parentDepartmentId?: number;
        },
    }
}

const AddDepartment:React.FC = () => {
    const [state, setState] = useState<AddDepartmentState>({
        error: {
            visible: false,
        },
        departmentBase:[],
        isLoggedIn: true,
        add: {
            department: {
                title: '',
                description: '',
                departmentCode: '',
            }
        }
    })

    const [loading, setLoading] = useState<boolean>(false)

    useEffect(() => {
        getDepartments()
    }, [])

    /* SET */

    const setAddNewDepartmentStringState = (fieldName:string, newValue:string) => {
        setState((prevState) => ({
          ...prevState,
          add: {
            ...prevState.add,
            department: {
              ...prevState.add.department,
              [fieldName]: newValue,
            },
          },
        }));
    };

    const setErrorMessage = (message: string) => {
        setState(prev => ({...prev, message: message}))
    }

    const setIsLoggedInStatus = (isLoggedIn: boolean) => {
        setState(prev => ({...prev, isLoggedIn: isLoggedIn}))
    }

    const setDepartmentData = (departmentData: DepartmentType[]) => {
        setState(Object.assign(state, {
            departmentBase: departmentData,
        }));
    }

    const showErrorMessage = async () => {
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

    const getDepartments = async () => {
        try{
            setLoading(true)
            await api('api/department?sort=title,ASC', 'get', {}, 'administrator')
            .then((res: ApiResponse) => {
                if(res.status === 'login') {
                    setIsLoggedInStatus(false);
                    return;
                }
                if (res.status === "error") {
                    setErrorMessage('Greška prilikom učitavanja sektora/službei/odjeljenja.');
                    return;
                }   
                setDepartmentData(res.data);
                setLoading(false)
            })
        }catch(error){
            setErrorMessage('Greška prilikom učitavanja sektora/službei/odjeljenja.');
            setLoading(false)
        }
        
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

    const doAddDepartment = () => {
        api('api/department/', 'post', state.add.department, 'administrator')
        .then((res: ApiResponse) => {
            if(res.status === 'login') {
                setIsLoggedInStatus(false);
                return;
            }
            if (res.status === "error" ) {
                setErrorMessage('Greška prilikom dodavanja sektora/službe/odjeljenja.');
                return;
            }
            setErrorMessage('Uspješno dodan sektor/služba/odjeljenje');
            showErrorMessage()
            getDepartments();
        })
    }

    const addForm = () => {
        return(
            <ModalContent>
            <ModalHeader>
                   Detalji sektora/službe/odjeljenja
                </ModalHeader>
                <ModalBody >
                <div className="flex flex-col">
                    {loading ? (
                        <div className='flex justify-center items-center'>
                            <Spinner color='success' label='Učitavanje...' labelColor='success' />
                        </div>
                    ):(
                        <div>
                            <div className='w-full mb-3 mr-3'>
                                <Input
                                id="departmentTitle" 
                                type="text" 
                                label="Naziv sektora/službe/odjeljenja"
                                labelPlacement='inside'
                                value={state.add.department.title}
                                onChange={(e) => setAddNewDepartmentStringState('title', e.target.value)}
                                >
                                </Input>
                            </div>
                            <div className='w-full mb-3 mr-3'>
                            <Textarea
                                id="departmentDescription"
                                label="Opis"
                                placeholder="Opišite radno mjesto"
                                value={state.add.department.description}
                                onChange={(e) => setAddNewDepartmentStringState('description', e.target.value)}
                            />
                            </div>
                            <div className='w-full mb-3 mr-3'>
                            <Input
                                id="departmentCode" 
                                type="number" 
                                label="Šifra organizacione jedinice"
                                labelPlacement='inside'
                                value={state.add.department.departmentCode}
                                        onChange={(e) => setAddNewDepartmentStringState('departmentCode', e.target.value)}
                                >
                                </Input>
                            </div>
                            <div className='lg:flex w-full'> 
                                <Select
                                    description='U slučaju da se kreira sektor nije potrebno popuniti polje ispod. Polje se popunjava
                                    isključivo ako se dodaje služba/odjeljenje koje pripada nekom sektoru/službi.'
                                    id='parentDepartmentId'
                                    label='Pripada sektoru/službi'
                                    placeholder='Odaberite glavna službu/odjeljenje'
                                    onChange={(e) => setAddNewDepartmentStringState('parentDepartmentId', e.target.value)}
                                >
                                    {state.departmentBase.map((departmentData, index) => (
                                        <SelectItem key={departmentData.departmentId || index} 
                                        textValue={`${departmentData.departmentId} - ${departmentData.title}`} 
                                        value={Number(departmentData.departmentId)}>
                                            {departmentData.departmentId} - {departmentData.title}
                                        </SelectItem>
                                    ))}
                                </Select>
                            </div>
                        </div>
                    )}    
                    </div>
                <ModalFooter className={state.add.department.title ? '' : 'hidden'}>
                    <div style={{ alignItems: 'end' }}>
                        <Button onClick={() => doAddDepartment()} 
                                color="success">
                        <i className="bi bi-plus-circle" /> Dodaj sektor/službu/odjeljenje
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
export default AddDepartment;