import React, { useEffect, useState } from 'react'
import UserType from '../../../../types/UserType'
import { Avatar, Button, Input, Select, SelectItem, Spinner } from '@nextui-org/react'
import DepartmentType from '../../../../types/DepartmentType'
import JobType from '../../../../types/JobType'
import LocationType from '../../../../types/LocationType'
import { useNavigate } from 'react-router-dom'
import api, { ApiResponse } from '../../../../API/api'
import { UserRole } from '../../../../types/UserRoleType'
import { useUserContext } from '../../../UserContext/UserContext'

type UserProps = {
    data: UserType
}

interface EdistUserStateProps {
    forname: string;
    surname: string;
    email: string;
    localNumber: string;
    telephone: string;
    departmentId: number;
    jobId: number;
    locationId: number;
    status: string;
    passwordHash: string;
    code:number;
    gender: string;
}

const UserDetails: React.FC<UserProps> = ({data}) => {
    const { role } = useUserContext()
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const toggleVisibility = () => setIsVisible(!isVisible);
    const [departmentData, setDepartmentData] = useState<DepartmentType[]>([])
    const [jobData, setJobData] = useState<JobType[]>([])
    const [locationData, setLocationData] = useState<LocationType[]>([])
    const [selectedLocationId, setSelectedLocationId] = useState('');
    const [dataReady, setDataReady] = useState(false);
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate();
    const [editUserState, setEditUserState] = React.useState<EdistUserStateProps>({
        forname: "",
        surname: "",
        email: "",
        localNumber:"",
        telephone: "",
        departmentId: Number(),
        jobId: Number(),
        locationId: Number(),
        status: "",
        passwordHash: "", 
        code: Number(),
        gender:"",
    });
    
    const setEditUserNumberFieldState = (fieldName: string, newValue: any) => {
    setEditUserState((prev) => ({
        ...prev,
        [fieldName]: (newValue === 'null' || newValue === '') ? null : Number(newValue),
        }));
    };
      

    const setEditUserStringFieldState = (fieldName: string, newValue: string) => {
        setEditUserState((prev) => ({
          ...prev,
            [fieldName]: newValue,
        }));
    };

    const getLocationData = async () => {
        try {
          const res: ApiResponse = await api('api/location?sort=name,ASC', 'get', {}, role as UserRole);
          setLocationData(res.data);
          return res.data;
        } catch (error) {
          throw error;
        }
      };

      const getDepartmentData = async () => {
        try {
          const res: ApiResponse = await api('api/department?sort=title,ASC', 'get', {}, role as UserRole);
          const data = res.data;
          setDepartmentData(data);
          return data;
        } catch (error) {
          throw error;
        }
      };

      const getJobsByDepartmentId = async (departmentId: number): Promise<JobType[]> => {
        return new Promise(resolve => {
            api(`api/job/department/${departmentId}`, 'get', {}, role as UserRole)
            .then((res : ApiResponse) => {

            const jobs: JobType[] = res.data.map((item: any) => ({
                jobId: item.jobId,
                title: item.title,
                jobCode: item.jobCode
            }))
            resolve(jobs)
        })}) 
    }

    const addJobDepartmentChange = async (selectedValue:any) => {
        try {
            const jobs = await getJobsByDepartmentId(selectedValue)
            const stateJobs:any = jobs.map(job => ({
                jobId: job.jobId,
                title: job.title,
                jobCode: job.jobCode,
            }))
            setJobData(stateJobs)
        } catch (error) {
            console.log('Greška prilikom mapiranja radnik mjesta za traženi sektor/odjelnje. Greška: ' + error)
        }
    }

    const putUserDetailsInState = async (user: UserType) => {     
        setEditUserState((prev) => ({
            ...prev,
            forname: user.forname || '',
            surname: user.surname || '',
            email: user.email || '',
            passwordHash: user.passwordHash || '',
            localNumber: user.localNumber || '',
            telephone: user.telephone || '',
            departmentId: user.departmentId || 0,
            jobId: user.jobId || 0,  
            locationId: user.locationId || 0, 
            status: user.status || '',
            code: user.code || 0, 
            gender: user.gender || '',
        }));
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                await getDepartmentData();
                const fetchedLocationData = await getLocationData();
                setLocationData(fetchedLocationData);
            } catch (error) {
                console.error('Greška prilikom dohvaćanja podataka:', error);
            } finally {
                setDataReady(true);
                setLoading(false)
            }
        };
        fetchData();
    }, []);
      
    useEffect(() => {
        const fetchData = async () => {
            try {
            await putUserDetailsInState(data);
            } catch (error) {
            console.error('Greška prilikom postavljanja detalja korisnika ili promjene sektora/odjeljenja:', error);
            }
        };
    
        if (dataReady) {
            fetchData();
        }
    }, [dataReady]);

    useEffect(() => {
        addJobDepartmentChange(editUserState.departmentId);
    }, [editUserState.departmentId]);
    
    useEffect(() => {
        if (locationData.length > 0) {
            setSelectedLocationId(editUserState.locationId ? `${editUserState.locationId}` : '');
        }
    }, [locationData, editUserState.locationId]);

    let gender = '';
    let genderColor = '';
    if(data.gender === 'muško') {
        gender = 'bi bi-gender-male'
        genderColor = 'lightblue'
    } else {
        gender = 'bi bi-gender-female'
        genderColor = 'lightpink'
    }

    let lastActivityText;
    if(data.lastLoginDate){
        const currentDateTime = new Date();
        const lastLoginDateTime = new Date(data.lastLoginDate);
        if (!isNaN(currentDateTime.getTime()) && !isNaN(lastLoginDateTime.getTime())) {
            const timeDifference = currentDateTime.getTime() - lastLoginDateTime.getTime();
            const minutesDifference = Math.floor(timeDifference / (1000*60));
            const hoursDifference = Math.floor(timeDifference / (1000*60*60));
            const dayDifference = Math.floor(timeDifference / (1000*60*60*24));
            if (minutesDifference < 1) {
                lastActivityText = `Posljednja aktivnost: prije manje od minut!`
            }else if(minutesDifference < 60) {
                lastActivityText = `Posljednja aktivnost: prije ${minutesDifference} minuta`
            } else if (hoursDifference < 60) {
                lastActivityText = `Posljednja aktivnot: prije ${hoursDifference} sati i ${minutesDifference % 60} minuta`
            } else {
                lastActivityText = `Posljednja aktivnost: prije ${dayDifference} dana i ${hoursDifference % 24} sati`
            }
        } else {
            lastActivityText = 'Neispravan datum i vrijeme!'
        }
    } else {
        lastActivityText = 'Nema prijava!'
    }

    return (
        loading ? (
            <div className="container mx-auto flex justify-center items-center">
              <Spinner label="Učitavanje..." labelColor="warning" color='warning' />
            </div>
        ):(       
        <div className="container mx-auto">
            <div className="grid lg:grid-cols-6 grid-cols lg:p-2 gap-3">
                <div className="user-container col-span-2 border-3" >
                    <div className="user-container details">
                        <Avatar className="ikonica" style={{border: `10px solid ${genderColor}`}}> </Avatar>
                        <div style={{fontSize:"25px", fontWeight:"bold", marginTop:"5px"}}>{data.fullname}</div>
                        <div style={{fontSize:"14px"}}>{data.email}</div>
                        <div style={{fontSize:"14px"}}>{data.job?.title}</div>
                        <div className="activity-status">
                            <div>
                                <i className="bi bi-calendar3" /> {lastActivityText}
                            </div>
                            <div style={{marginBottom:"5px"}}>
                                <i className="bi bi-award" /> Status: {data.status}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-4 col-span-2 md:col-span-2 lg:pl-4">
                        <div className="grid lg:grid-cols-3 grid-cols gap-3 mb-3">
                            <Input
                                value={editUserState.surname}
                                type='text'
                                label='Ime'
                                variant='bordered'
                                onValueChange={(value: string) => setEditUserStringFieldState('surname', value)}
                            />
                        
                            <Input
                                value={editUserState.forname}
                                type='text'
                                label='Prezime'
                                variant='bordered'
                                onValueChange={(value: string) => setEditUserStringFieldState('forname', value)}
                            />
                        
                            <Input
                                value={editUserState.code.toString()}
                                type='number'
                                label='Kadrovski broj'
                                variant='bordered'
                                onValueChange={(value: string) => setEditUserStringFieldState('code', value)}
                            />
                        </div>
                        <div className="grid lg:grid-cols-3 grid-cols gap-3 mb-3">
                            <Input
                                value={editUserState.email}
                                type='email'
                                label='Email'
                                variant='bordered'
                                onValueChange={(value: string) => setEditUserStringFieldState('email', value)}
                            />
                            <Input
                                value={editUserState.telephone}
                                type='text'
                                label='Telefon'
                                variant='bordered'
                                onValueChange={(value: string) => setEditUserStringFieldState('telephone', value)}
                            />
                            <Input
                                value={editUserState.localNumber}
                                type='number'
                                label='Telefon/lokal'
                                variant='bordered'
                                onValueChange={(value: string) => setEditUserStringFieldState('localNumber', value)}
                            />
                        </div>

                    <div className="grid lg:grid-cols-2 grid-cols gap-3 mb-3">
                    <Select
                        id="departmentId"
                        label='Sektor/odjeljenje'
                        selectedKeys={editUserState.departmentId ? [`${editUserState.departmentId}`] : []}
                        onChange={(value: any) => {
                            setEditUserNumberFieldState('departmentId', value.target.value)
                        }}
                        >
                        {departmentData.map((department, index) => (
                            <SelectItem
                            key={Number(department.departmentId)}
                            textValue={department.title}
                            value={department.departmentId}
                            >
                            {department.departmentId} - {department.title}
                            </SelectItem>
                        ))}
                        </Select>
                        <Select
                            label='Radno mjesto'
                            selectedKeys={jobData.some((job) => job.jobId === editUserState.jobId) ? [`${editUserState.jobId}`] : []}
                            id="jobId"
                            onChange={(e: any) => { setEditUserNumberFieldState('jobId', e.target.value) }}
                            >
                            {jobData.map((job, index) => (
                                <SelectItem key={Number(job.jobId)} textValue={job.title} value={job.jobId}>{job.title}</SelectItem>
                            ))}
                        </Select>

                    </div>

                    <div className="grid lg:grid-cols-3 grid-cols gap-3 mb-3">
                    <Select
                    label='Lokacija'
                    selectedKeys={selectedLocationId ? [selectedLocationId] : []}
                    onChange={(e) => setEditUserNumberFieldState('locationId', e.target.value)}
                    >
                    {locationData.map((location, index) => (
                        <SelectItem key={location.locationId || index} textValue={location.name} value={location.locationId}>
                        {location.name}
                        </SelectItem>
                    ))}
                    </Select>
                            <Select
                                label='Spol'
                                selectedKeys={editUserState.gender ? [`${editUserState.gender}`] : []}
                                onChange={(e:any) => {setEditUserStringFieldState('gender', e.target.value)}}
                                >
                                <SelectItem key='muško' textValue="muško" value='muško'>muško</SelectItem>
                                <SelectItem key='žensko' textValue="žensko" value='žensko'>žensko</SelectItem>
                            </Select>
                            <Select
                                label='Status'
                                selectedKeys={editUserState.status ? [`${editUserState.status}`] : []}
                                onChange={(e:any) => {setEditUserStringFieldState('status', e.target.value)}}
                                >
                                <SelectItem key='aktivan' textValue="aktivan" value='aktivan'>aktivan</SelectItem>
                                <SelectItem key='neaktivan' textValue="neaktivan" value='neaktivan'>neaktivan</SelectItem>
                            </Select>
                        <div className="grid grid-cols gap-2 mb-3">
                            <Input
                                label="Lozinka"
                                variant="bordered"
                                placeholder="Ukucajte lozinku"
                                value={editUserState.passwordHash}
                                onChange={(e) => setEditUserStringFieldState('passwordHash', e.target.value)}
                                endContent={
                                    <button className="focus:outline-none" type="button" onClick={toggleVisibility}>
                                    {isVisible ? (
                                        <i className="bi bi-eye-fill text-2xl text-default-400 pointer-events-none" />
                                    ) : (
                                        <i className="bi bi-eye-slash-fill text-2xl text-default-400 pointer-events-none" />
                                    )}
                                    </button>
                                }
                                type={isVisible ? "text" : "password"}
                                
                                />          
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 grid-cols gap-2 mb-3">
                        <Button className="col-end-7" onClick={() => doEditUser()}>Snimi izmjene</Button>
                    </div>
                </div>
            </div>
         </div>
        )
    )

    function doEditUser() {
        try {
            api('api/user/edit/' + data.userId, 'patch', {
                forname: editUserState.forname,
                surename: editUserState.surname,
                email: editUserState.email,
                password: editUserState.passwordHash,
                localNumber: editUserState.localNumber,
                telephone: editUserState.telephone,
                jobId: editUserState.jobId,
                departmentId: editUserState.departmentId,
                locationId: editUserState.locationId,
                status: editUserState.status,
                code: editUserState.code,
                gender: editUserState.gender,
            }, role as UserRole)
            .then((res: ApiResponse) => {
                if (res.status === 'login') {
                    return navigate('/login')
                }
            });
        } catch (error) {
            console.error('Greška prilikom izvršavanja API poziva:', error);
        }
    }
}

export default UserDetails