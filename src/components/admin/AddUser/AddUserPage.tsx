import React, { useEffect, useState } from 'react';
import api, { ApiResponse } from '../../../API/api';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import AdminMenu from '../AdminMenu/AdminMenu';
import LocationType from '../../../types/LocationType';
import DepartmentType from '../../../types/DepartmentType';
import JobType from '../../../types/JobType';
import AddDepartment from '../AddDepartment/AddDepartment';
import AddJob from '../AddJob/AddJob';
import AddLocation from '../AddLocation/AddLocation';
import AddDepartmentJobLocation from './AddDepartmentJobLocation';
import { Alert } from '../../custom/Alert';
import { Button, Card, CardBody, CardFooter, CardHeader, Input, Link, Modal, Select, SelectItem } from '@nextui-org/react';
import { useNavigate } from 'react-router-dom';


interface LocationDto {
    locationId: number;
    name: string;
    code: string;
    parentLocationId: number;
}

interface JobBaseType {
    jobId: number;
    title: string;
    jobCode: string;
}
interface AddUserPageState{
    message: string;
    isLoggedIn: boolean;
    addUser: {
        surname: string;
        forname: string;
        email: string;
        localNumber: string;
        telephone: string;
        jobId: number;
        departmentId: number;
        locationId: number;
        password: string;
        status: string;
        code: number;
        gender: string;
    };
    modal: {
        department:{
            visible: boolean; 
        },
        job:{
            visible: boolean; 
        },
        location:{
            visible: boolean; 
        },
        departmentJobLocation: {
            visible: boolean;
        }
        
    },
    location: LocationType[];
    department: DepartmentType[];
    job: JobType[];
    errorMessage: string;
}
const AddUserPage: React.FC = () => {
    const [state, setState] = useState<AddUserPageState>({
        message: '',
            isLoggedIn: true,
            addUser: {
                surname: '',
                forname: '',
                email: '',
                localNumber: '',
                telephone: '',
                jobId: Number(),
                departmentId: Number(),
                locationId: Number(),
                password: '',
                status: '',
                code: Number(),
                gender: 'muško' || 'žensko'
            },
            modal: {
                department: { 
                    visible: false, 
                },
                job: { 
                    visible: false, 
                },
                location: { 
                    visible: false, 
                },
                departmentJobLocation: {
                    visible: false,
                }             
            },
            location: [],
            department: [],
            job: [],
            errorMessage: '',
    })

    const navigate = useNavigate()
    const [isVisible, setIsVisible] = React.useState(false);
    const toggleVisibility = () => setIsVisible(!isVisible);
    
    /* SET */
    const setErrorMessage = (message: string) => {
        setState((prev) => ({...prev, message: message}))
    }

    const setAddUserStringFieldState = (fieldName: string, newValue: string) => {
        setState((prev) => ({
            ...prev, addUser: {...prev.addUser, [fieldName]: newValue}
        }))
    }

    const setAddUserNumberFieldState = (fieldName: string, newValue: any) => {
        setState((prev) => ({
            ...prev, addUser: {...prev.addUser, [fieldName]: newValue === 'null' ? null : Number(newValue)}
        }))
    }

    const setLocation = (location: LocationDto[]) => {
        const locData: LocationType[] = location.map(details => {
            return {
                locationId: details.locationId,
                code: details.code,
                name: details.name,
                parentLocationId: details.parentLocationId,
            }
        })
        setState((prev) => ({ ...prev, location: locData}))
    }

    const setDepartment = (department: DepartmentType[]) => {
        setState((prev) => ({...prev, department: department}))
    }

    const addJobDepartmentChange = async (selectedValue: any) => {
        setAddUserNumberFieldState('departmentId', selectedValue);

        const jobs = await getJobsByDepartmentId(selectedValue);
        const stateJobs = jobs.map(job => ({
            jobId: job.jobId,
            title: job.title,
            jobCode: job.jobCode
        }));

        setState((prev) => ({...prev, job: stateJobs}))
    }

    const showDepartmentModal = async () => {
        setDepartmentModalVisibleState(true)
    }

    const setDepartmentModalVisibleState = (newState: boolean) => {
        setState((prev) => ({...prev, modal: {...prev.modal, department: {...prev.modal.department, visible: newState}}}))
        getData();
    }

    const showJobModal = async () => {
        setJobModalVisibleState(true)
    }

    const setJobModalVisibleState = (newState: boolean) => {
        setState((prev) => ({...prev, modal: {...prev.modal, job: {...prev.modal.job, visible: newState}}}))
        getData();
    }

    const showLocationModal = async () => {
        setLocationModalVisibleState(true)
    }

    const setLocationModalVisibleState = (newState: boolean) => {
        setState((prev) => ({...prev, modal: {...prev.modal, location: {...prev.modal.location, visible: newState}}}))
        getData();
    }

    const showDepartmentJobLocationModal = async () => {
        setDepartmentJobLocationModalVisibleState(true)
    }

    const setDepartmentJobLocationModalVisibleState = (newState: boolean) => {
        setState((prev) => ({...prev, modal: {...prev.modal, departmentJobLocation: {...prev.modal.departmentJobLocation, visible: newState}}}))
        getJobsByDepartmentId(state.addUser.departmentId); // Ovo ne radi kako je zamišljeno
    }

    const setLogginState = (isLoggedIn: boolean) => {
        setState((prev) => ({...prev, isLoggedIn:isLoggedIn}))

        if(isLoggedIn === false) {
            navigate('/login/')
        }
    }

    /* Kraj SET */
    /* GET */
    const getData = () =>{
        api('api/location?sort=name,ASC', 'get', {}, 'administrator')
        .then(async (res: ApiResponse) => {
            if(res.status === 'error') {
                setErrorMessage('Greška prilikom hvatanja lokacija')
            }
            if(res.status === 'login') {
                return setLogginState(false)
            }
            setLocation(res.data)
        })

        api('api/department?sort=title,ASC', 'get', {}, 'administrator')
        .then(async (res: ApiResponse) => {
            if(res.status === 'error') {
                setErrorMessage('Greška prilikom hvatanja sektora i odjeljenja')
            }
            setDepartment(res.data)
        })
    }

    useEffect(() => {
        getData()
    }, [])

    const getJobsByDepartmentId = async (departmentId: number): Promise<JobBaseType[]> => {
        return new Promise(resolve => {
            api('api/job/?filter=departmentJobs.departmentId||$eq||' + departmentId + '/&sort=title,ASC', 'get', {}, 'administrator')
            .then((res : ApiResponse) => {
                if(res.status === 'login') {
                    return setLogginState(false)
                }
                if(res.status === 'error') {
                    setErrorMessage('Greška prilikom hvatanja radnih mjesta')
                }

                const jobs: JobBaseType[] = res.data.map((item: any) => ({
                    jobId: item.jobId,
                    title: item.title,
                    jobCode: item.jobCode
                }))
            resolve(jobs)
        })
    })      
    }

    /* Kraj GET */
    /* Dodatne funkcije */
    const printOptionalMessage = () => {
        if (state.message === '') {
            return;
        }

        return (
            <Alert title='info' variant='info' body={state.message} />
        );
    }

    const doAddUser = () => {
        api('api/user/add/', 'post', {
            surname: state.addUser.surname,
            forname: state.addUser.forname,
            password: state.addUser.password,
            email: state.addUser.email,
            localNumber: state.addUser.localNumber,
            telephone: state.addUser.telephone,
            jobId: state.addUser.jobId,
            departmentId: state.addUser.departmentId,
            locationId: state.addUser.locationId,
            status: state.addUser.status,
            code: state.addUser.code,
            gender: state.addUser.gender,            
        }, 'administrator')
        .then(async (res: ApiResponse) => {
            if(res.status === 'login') {
                return setLogginState(false)
            }
            
            if(res.status === 'ok') {
                setErrorMessage('Korisnik dodan')
                setState((prev) => ({
                    ...prev, addUser: {
                        surname: '',
                        forname: '',
                        email: '',
                        localNumber: '',
                        telephone: '',
                        jobId: Number(),
                        departmentId: Number(),
                        locationId: Number(),
                        password: '',
                        status: '',
                        code: Number(),
                        gender: ''
                    }
                }) )
            }
        });
    }
    const addForm = () => {
        return (
            <div> 
            <Card className="mb-3">
                <CardHeader><i className="bi bi-person-lines-fill"/> Informacije o korisniku</CardHeader>
                <CardBody className=''>
                    <div className="flex flex-col lg:flex-row">
                        <div className='lg:flex w-full'>
                            <div className='w-full mb-3 mr-3'>
                                <Input
                                id="surname" 
                                type="text" 
                                label="Ime"
                                labelPlacement='inside'
                                value={ state.addUser.surname }
                                onChange={ (e) => setAddUserStringFieldState('surname', e.target.value) }
                                >
                                </Input>
                            </div>
                            <div className='w-full mb-3'>
                                <Input 
                                id="forname" 
                                type="text" 
                                label="Prezime"
                                labelPlacement='inside'
                                value={ state.addUser.forname }
                                onChange={ (e) => setAddUserStringFieldState('forname', e.target.value) }
                                >
                                </Input>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col lg:flex-row">
                        <div className='lg:flex w-full'>
                            <div className='w-full mb-3 mr-3'>
                                <Input
                                id="email" 
                                type="text" 
                                label="Email"
                                labelPlacement='inside'
                                value={ state.addUser.email }
                                onChange={ (e) => setAddUserStringFieldState('email', e.target.value) }
                                >
                                </Input>
                            </div>
                            <div className='w-full mb-3'>
                                <Input 
                                id="password" 
                                endContent={<button className="focus:outline-none" type="button" onClick={toggleVisibility}>
                                    {isVisible ? (
                                        <i className="bi bi-eye-fill text-2xl text-default-400 pointer-events-none" />
                                    ) : (
                                        <i className="bi bi-eye-slash-fill text-2xl text-default-400 pointer-events-none" />
                                    )}
                                </button>}
                                type={isVisible ? "text" : "password"} 
                                label="Lozinka"
                                labelPlacement='inside'
                                value={ state.addUser.password }
                                onChange={ (e) => setAddUserStringFieldState('password', e.target.value) }
                                >
                                </Input>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col lg:flex-row">
                        <div className='lg:flex w-full'>
                            <div className='w-full mb-3 mr-3'>
                                <Input
                                id="telephone" 
                                type="text" 
                                label="Telefon"
                                labelPlacement='inside'
                                value={ state.addUser.telephone}
                                onChange={ (e) => setAddUserStringFieldState('telephone', e.target.value) }
                                >
                                </Input>
                            </div>
                            <div className='w-full mb-3'>
                                <Input 
                                id="local" 
                                type="number" 
                                label="Broj u lokalu"
                                labelPlacement='inside'
                                value={ state.addUser.localNumber }
                                onChange={ (e) => setAddUserStringFieldState('localNumber', e.target.value) }
                                >
                                </Input>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row">
                        <div className='lg:flex w-full'>
                            <div className='w-full mb-3 mr-3'>
                                <Input
                                id="code" 
                                type="number" 
                                label="Kadrovski broj"
                                labelPlacement='inside'
                                value={state.addUser.code.toString()}
                                onChange={ (e) => setAddUserStringFieldState('code', e.target.value) }
                                >
                                </Input>
                            </div>
                            <div className='w-full mb-3 mr-3'>
                                <Select
                                id='gender'
                                label='Spol'
                                placeholder='Odaberite spol'
                                value={state.addUser.gender}
                                onChange={ (e) => setAddUserStringFieldState('gender', e.target.value) }
                                >
                                    <SelectItem key={'muško'} value={'muško'}>
                                        muško
                                    </SelectItem>
                                    <SelectItem key={'žensko'} value={'žensko'}>
                                        žensko
                                    </SelectItem>
                                </Select>
                            </div>
                            <div className='w-full mb-3'>
                            <Select
                                id='status'
                                label='Status'
                                placeholder='Odaberite status'
                                value={state.addUser.status}
                                onChange={(e) => setAddUserStringFieldState('status', e.target.value)}
                                >
                                    <SelectItem key={'aktivan'} value={'aktivan'}>
                                        aktivan
                                    </SelectItem>
                                    <SelectItem key={'neaktivan'} value={'neaktivan'}>
                                        neaktivan
                                    </SelectItem>
                                </Select>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-row">
                        <div className='flex w-full'>
                            <div className='w-full mb-3 mr-3'>
                                <Select
                                id='departmentId'
                                label='Sektor ili odjeljenje'
                                placeholder='Odaberite sektor ili odjeljenje'
                                onChange={(e) => {setAddUserNumberFieldState('departmentId', e.target.value); addJobDepartmentChange(e.target.value)}}
                                >
                                {state.department.map((dep, index) => (
                                    <SelectItem key={dep.departmentId || index} textValue={dep.title} value={Number(dep.departmentId)}> {dep.title} - {dep.departmendCode} </SelectItem>
                                ))}
                                </Select>
                            </div>
                            <div className='flex justify-center items-center mb-3'>
                                <Button color='warning' variant='flat' size='lg' onClick={() => showDepartmentModal()}><i className="bi bi-plus-circle-fill" /></Button>
                                <Modal backdrop='blur' size="lg" isOpen={state.modal.department.visible} onClose={() => setDepartmentModalVisibleState(false)}>
                                    <AddDepartment />
                                </Modal>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row">
                        <div className='flex w-full'>
                            <div className='w-full mb-3 mr-3'>
                                <Select
                                id='jobId'
                                label='Radno mjesto'
                                placeholder='Odaberite radno mjesto'
                                onChange={(e) => setAddUserNumberFieldState('jobId', e.target.value)}
                                >
                                    {state.job.map((jo, index) => (
                                        <SelectItem key={jo.jobId || index} textValue={jo.title} value={jo.jobId}>{jo.jobCode} - {jo.title}</SelectItem>
                                    ))}
                                </Select>
                            </div>
                            <div className='flex justify-center items-center mb-3'>
                                <Button color='warning' variant='flat' size='lg' onClick={() => showJobModal()}><i className="bi bi-plus-circle-fill" /></Button>
                                <Modal backdrop='blur' size="lg" isOpen={state.modal.job.visible} onClose={() => setJobModalVisibleState(false)}>
                                    <AddJob />
                                </Modal>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col lg:flex-row pl-3 text-sm text-default-500 mb-3">
                        Ukoliko je lista radnih mjesta prazna ili radno mjesto ne postoji u istoj, potrebno je izvršiti povezivanje radnog mjesta sa lokacijom i sektorom. To možete učiniti klikom
                            <Link className='text-sm pl-1 cursor-pointer' color='danger' showAnchorIcon onClick={() => showDepartmentJobLocationModal()}> ovdje</Link>
                            <Modal backdrop='blur' size="lg" isOpen={state.modal.departmentJobLocation.visible} onClose={() => setDepartmentJobLocationModalVisibleState(false)}>
                                <AddDepartmentJobLocation />
                            </Modal>
                    </div>

                    <div className="flex flex-col lg:flex-row">
                        <div className='flex w-full'>
                            <div className='w-full mb-3 mr-3'>
                                <Select
                                id='locationId'
                                label='Lokacija'
                                placeholder='Odaberite lokaciju'
                                onChange={(e) => setAddUserNumberFieldState('locationId', e.target.value)}
                                >
                                    {state.location.map((loc, index) => (
                                        <SelectItem key={loc.locationId || index} textValue={loc.name} value={loc.locationId}>{loc.code} - {loc.name} </SelectItem>
                                    ))}
                                </Select>
                            </div>
                            <div className='flex justify-center items-center mb-3'>
                                <Button color='warning' variant='flat' size='lg' onClick={() => showLocationModal()}><i className="bi bi-plus-circle-fill" /></Button>
                                <Modal backdrop='blur' size="lg" isOpen={state.modal.location.visible} onClose={() => setLocationModalVisibleState(false)}>
                                    <AddLocation />
                                </Modal>
                            </div>
                        </div>
                    </div>
                </CardBody>
                <CardFooter className='gap-3'>
                    <div>
                        <Button onClick={() => doAddUser()} color="success"> <i className="bi bi-person-check-fill"/>Dodaj korisnika</Button>
                    </div>

                        <div style={{ marginTop: 15 }} className={state.errorMessage ? '' : 'hidden'}> 
                            <Alert title='Info' body={state.errorMessage} variant='success'  />
                        </div>
                </CardFooter>
            </Card>  
            </div>
        )
    }   
    /* Kraj dodatnih funkcija */
    return(
        <div>
            <RoledMainMenu/>
            
            <div className="container mx-auto lg:px-4 mt-3 h-max">
                {printOptionalMessage()}
                {addForm()}
                <AdminMenu />
            </div>
        </div>
    )
}

export default AddUserPage