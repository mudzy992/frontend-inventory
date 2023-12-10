import React, { useEffect } from "react";
import api, { ApiResponse } from '../../../API/api';
import FeaturesType from "../../../types/FeaturesType";
import { useNavigate, useParams } from 'react-router-dom';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import saveAs from "file-saver";
import { ApiConfig } from "../../../config/api.config";
import DepartmentByIdType from "../../../types/DepartmentByIdType";
import ArticleType from "../../../types/ArticleType";
import UserType from "../../../types/UserType";
import LocationType from "../../../types/LocationType";
import DepartmentType from "../../../types/DepartmentType";
import JobType from "../../../types/JobType";
import { Avatar, Button, Card, CardBody, Input, Accordion, AccordionItem, 
    Popover, PopoverContent, PopoverTrigger, Select, SelectItem, Tab, Tabs, 
    Link, Table, TableHeader, TableCell, TableBody, TableRow, TableColumn } from "@nextui-org/react";
import { EyeSlashFilledIcon } from "../../../Icons/EyeSlashFilledIcon";
import { EyeFilledIcon } from "../../../Icons/EyeFilledIcon";


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

interface AdminUserProfilePageState {
    /* u ovom dijelu upisuje type npr. ako je kategorija je nekog tipa
    ako u nazivu tog typa stavimo upitnik, time kažemo da nije obavezno polje dolje ispod u konstruktoru */
    user?: UserType;
    users?: UserType;
    message: string;
    article: ArticleType[];
    features: FeaturesType[];
    isLoggedIn: boolean;
    departmentJobs: DepartmentByIdType[];
    open: string | null;
    showPassword: boolean;
    editUser:{
        forname: string;
        surname: string;
        email: string;
        password: string;
        localNumber: string;
        telephone: string;
        jobId: number;
        departmentId: number;
        locationId: number;
        status: string;
        passwordHash: string;
        code:string;
        gender: string;
    },
    location: LocationType[];
    department: DepartmentType[];
    job: JobType[];
}

export default function AdminUserProfilePage() {
    const { userID } = useParams();
    const [isVisible, setIsVisible] = React.useState<boolean>(false);
    const toggleVisibility = () => setIsVisible(!isVisible);

    const [state, setState] = React.useState<AdminUserProfilePageState>({
        message: "",
            article: [],
            features: [],
            isLoggedIn: true,
            departmentJobs: [],
            open: null,
            showPassword: false,
            editUser: {
                forname: "",
                surname: "",
                email: "",
                password: "",
                localNumber:"",
                telephone: "",
                jobId: Number(),
                departmentId: Number(),
                locationId: Number(),
                status: "",
                passwordHash: "", 
                code: "",
                gender:"",
            },
            location: [],
            department: [],
            job: [],
    });

    const setFeaturesData = (featuresData: FeaturesType[]) => {
        setState((prev) => ({ ...prev, features: featuresData}));
    }

    const setUsers = (userProfileData: UserType | undefined) => {
        setState((prev) => ({ ...prev, users: userProfileData}));
    }

    const setArticleByUser = (articleData: ArticleType[]) => {
        setState((prev) => ({ ...prev, article: articleData}));
    }

    const setErrorMessage = (message: string) => {
        setState((prev) => ({ ...prev, message: message}));
    }

    const navigate = useNavigate();

    const setLogginState = (isLoggedIn: boolean) => {
        setState({ ...state, isLoggedIn: isLoggedIn });
        if(isLoggedIn === false) {
            navigate('admin/login')
        }
    }

    const setLocation = (location: LocationDto[]) => {
        const locData: LocationType[] = location.map(details => {
            return{
                locationId: details.locationId,
                code: details.code,
                name: details.name,
                parentLocationId: details.parentLocationId
            }
        })
        setState((prev) => ({...prev, location:locData}))
    }

    const setDepartment = (department: DepartmentType[]) => {
        setState((prev) => ({...prev, department: department}));
    }

    const setJob = (job: JobType[]) => {
        setState((prev) => ({...prev, job: job}));
    }

    const setEditUserNumberFieldState = (fieldName: string, newValue: any) => {
        setState((prev) => ({
          ...prev,
          editUser: {
            ...prev.editUser,
            [fieldName]: (newValue === 'null') ? null : Number(newValue),
          },
        }));
      };

    const setEditUserStringFieldState = (fieldName: string, newValue: string) => {
        setState((prev) => ({
          ...prev,
          editUser: {
            ...prev.editUser,
            [fieldName]: newValue,
          },
        }));
    };

    const addJobDepartmentChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
        setEditUserNumberFieldState('departmentId', event.target.value)
        try {
            const jobs = await getJobsByDepartmentId(state.editUser.departmentId)
            const stateJobs:any = jobs.map(job => ({
                jobId: job.jobId,
                title: job.title,
                jobCode: job.jobCode,
            }))

            setState((prev) => ({...prev, job: stateJobs}))
        } catch (error) {
            setErrorMessage('Greška prilikom mapiranja radnik mjesta za traženi sektor/odjelnje. Greška: ' + error)
        }
    }



    /* GET funkcije */
    const getUserData = () => {
        api('api/user/' + userID, 'get', {}, 'administrator')
                .then((res: ApiResponse) => {
                    if (res.status === 'error') {
                        setUsers(undefined);
                        setErrorMessage('Greška prilikom učitavanja kategorije. Osvježite ili pokušajte ponovo kasnije')
                        return;
                    }
                    if (res.status === 'login') {
                        setLogginState(false);
                        return;
                    }
    
                    const data: UserType = res.data;
                    setErrorMessage('');
                    setUsers(data);
                    putUserDetailsInState(res.data);
                });
    }

    const getArticleData = () => {
        api('api/article/?filter=user.userId||$eq||'
            + userID
            , 'get', {}, 'administrator')
            .then((res: ApiResponse) => {
                if (res.status === 'login') {
                    return setLogginState(false);
                }

                const articleByUser: ArticleType[] = res.data;
                setArticleByUser(articleByUser)
                const features: FeaturesType[] = [];

                for (const start of articleByUser) {
                    for (const articleFeature of start.stock?.stockFeatures || []) {
                        const value = articleFeature.value;
                        const articleId = articleFeature.feature?.articleId;
                        const name = articleFeature.feature?.name;

                        features.push({ articleId, name, value });
                    }
                }
                setFeaturesData(features);
            }
        )
    }

    const getDepartmentAndLocationData = () => {
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
            if (res.status === 'login') {
                return setLogginState(false);
            }
            setDepartment(res.data)
        })
    }

    const getJobsByDepartmentId = async (departmentId: number): Promise<JobType[]> => {
        return new Promise(resolve => {
            api('api/job/?filter=departmentJobs.departmentId||$eq||' + departmentId + '/&sort=title,ASC', 'get', {}, 'administrator')
            .then((res : ApiResponse) => {
            if(res.status === 'error') {
                setErrorMessage('Greška prilikom hvatanja radnih mjesta')
            }
            if (res.status === 'login') {
                return setLogginState(false);
            }

            const jobs: JobBaseType[] = res.data.map((item: any) => ({
                jobId: item.jobId,
                title: item.title,
                jobCode: item.jobCode
            }))
            resolve(jobs)
        })}) 
    }

    useEffect(() => {
        const fetchData = async () => {
          try {
            await getUserData();
    
            // Nakon što se getUserData završi, možete sigurno pristupiti state.users
            await getDepartmentAndLocationData();
            await getArticleData();
    
            const jobs = await getJobsByDepartmentId(state.users?.departmentId ?? 0);
            
            // Ažuriranje stanja za radna mesta
            setState((prev) => ({
              ...prev,
              job: jobs,
            }));
    
            // Ako je trenutni department isti kao početni, ažurirajte stanje još jednom
            if (state.users?.departmentId === state.editUser.departmentId) {
              setState((prev) => ({
                ...prev,
                job: jobs,
              }));
            }
          } catch (error) {
            console.error('Greška prilikom dohvaćanja podataka:', error);
          }
        };
    
        fetchData();
      }, []);

    /* HANDLE FUNKCIJE */

    const handleClickShowPassword = () => {
        setState((prev) => ({...prev, showPassword: !prev.showPassword}))
    };

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleClick = (categoryName: string) => {
        setState((prev) => ({...prev, open: prev.open === categoryName ? null : categoryName}));
    };

    const printOptionalMessage = () => {
        if (state.message === '') {
            return;
        }
        return (
            <Card>
                {state.message}
            </Card>
        );
    }

    const putUserDetailsInState = async (user: UserType) =>{
        setEditUserStringFieldState('forname', String(user.forname))
        setEditUserStringFieldState('surname', String(user.surname))
        setEditUserStringFieldState('email', String(user.email))
        setEditUserStringFieldState('passwordHash', String(user.passwordHash))
        setEditUserStringFieldState('localNumber', String(user.localNumber))
        setEditUserStringFieldState('telephone', String(user.telephone))
        setEditUserNumberFieldState('jobId', Number(user.jobId))
        setEditUserNumberFieldState('departmentId', Number(user.departmentId))
        setEditUserNumberFieldState('locationId', Number(user.locationId))
        setEditUserStringFieldState('status', String(user.status))
        setEditUserNumberFieldState('code', Number(user.code))
        setEditUserStringFieldState('gender', String(user.gender))
    }
 
    return (
            <>
            <RoledMainMenu role='administrator' />
            <div className="container mx-auto  mt-3 h-max">
                <Tabs id="left-tabs-example" aria-label="Options">
                    <Tab key='profile' title='Profil'>
                        <Card>
                            <CardBody>
                                {state.users ? (userData(state.users)) : ''}
                            </CardBody>
                        </Card>
                    </Tab>
                    <Tab key='zaduzeni-artikli' title='Zaduženi artikli'>

                                {articles()}

                    </Tab>
                </Tabs>
          
        </div></>
    )

    function saveFile (docPath: any) {
        if(!docPath) {
            return (
                <div>
                    <Popover placement='right' showArrow backdrop="blur">
                    <PopoverTrigger>
                        <Button size='sm' style={{ backgroundColor: "#9D5353" }}>
                            <i className="bi bi-file-earmark-text" style={{ fontSize: 20, color: "white" }} />
                    </Button>
                </PopoverTrigger>
                <PopoverContent>
                        Prenosnica nije generisana
                    </PopoverContent>
                </Popover>
                </div>
                )
        }
        if (docPath) {
            const savedFile = (docPath:any) => {
                saveAs(
                    ApiConfig.TEMPLATE_PATH + docPath,
                    docPath
                );
            }
            return (
                <Button size='sm' style={{backgroundColor:"#3A6351"}} onClick={() => savedFile(docPath)}>
                <i className="bi bi-file-earmark-text" style={{ fontSize: 20, color:"white" }}/></Button>
            )
        }
    }

    function userData(user: UserType){
        let gender = '';
        let genderColor = '';
        if(user.gender === 'muško') {
            gender = 'bi bi-gender-male'
            genderColor = 'lightblue'
        } else {
            gender = 'bi bi-gender-female'
            genderColor = 'lightpink'
        }

        let lastActivityText;
        if(user.lastLoginDate){
            const currentDateTime = new Date();
            const lastLoginDateTime = new Date(user.lastLoginDate);
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
            <div className="container mx-auto">
            <div className="grid lg:grid-cols-6 xs:grid-cols gap-2 md:mt-5">
                <div className="user-container col-span-2 md:mb-3 xs:mb-5 lg:shadow-large border-3" >
                    <div className="user-container details">
                        <Avatar className="ikonica " style={{border: `10px solid ${genderColor}`}}> <i className={gender}/></Avatar>
                        <div style={{fontSize:"25px", fontWeight:"bold", marginTop:"5px"}}>{user.fullname}</div>
                        <div style={{fontSize:"14px"}}>{user.email}</div>
                        <div style={{fontSize:"14px"}}>{user.job?.title}</div>
                        <div className="activity-status">
                            <div>
                                <i className="bi bi-calendar3" /> {lastActivityText}
                            </div>
                            <div style={{marginBottom:"5px"}}>
                                <i className="bi bi-award" /> Status: {user.status}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-4 xs:col-span-2 md:col-span-2 lg:pl-4">
                        <div className="grid lg:grid-cols-3 xs:grid-cols gap-3 mb-3">
                            <Input
                                value={state.editUser.surname}
                                type='text'
                                label='Ime'
                                variant='bordered'
                                onValueChange={(value: string) => setEditUserStringFieldState('surname', value)}
                            />
                        
                            <Input
                                value={state.editUser.forname}
                                type='text'
                               
                                label='Prezime'
                                variant='bordered'
                                onValueChange={(value: string) => setEditUserStringFieldState('forname', value)}
                            />
                        
                            <Input
                                value={state.editUser.code !== '0' ? state.editUser.code : ''}
                                type='number'
                                label='Kadrovski broj'
                                variant='bordered'
                                onValueChange={(value: string) => setEditUserStringFieldState('code', value)}
                            />
                        </div>
                        <div className="grid lg:grid-cols-3 xs:grid-cols gap-3 mb-3">
                            <Input
                                value={state.editUser.email}
                                type='email'
                                
                                label='Email'
                                variant='bordered'
                                onValueChange={(value: string) => setEditUserStringFieldState('email', value)}
                            />
                            <Input
                                value={state.editUser.telephone}
                                type='text'
                                
                                label='Telefon'
                                variant='bordered'
                                onValueChange={(value: string) => setEditUserStringFieldState('telephone', value)}
                            />
                            <Input
                                value={state.editUser.localNumber}
                                
                                type='number'
                                label='Telefon/lokal'
                                variant='bordered'
                                onValueChange={(value: string) => setEditUserStringFieldState('localNumber', value)}
                            />
                        </div>

                    <div className="grid lg:grid-cols-2 xs:grid-cols gap-3 mb-3">
                            <Select
                                label='Sektor/odjeljenje'
                                value={state.editUser.departmentId.toString()}
                                
                                onChange={(e:any) => {setEditUserNumberFieldState('departmentId', e.target.value); addJobDepartmentChange(e as any)}}
                                >
                                {state.department.map((department, index) => (
                                    <SelectItem key={index} value={department.departmentId?.toString()}>{department.title}</SelectItem>
                                ))}
                            </Select>
                            <Select
                                label='Radno mjesto'
                                value={state.editUser.jobId.toString()}
                                
                                onChange={(e:any) => {setEditUserNumberFieldState('jobId', e.target.value)}}
                                >
                                {state.job.map((job, index) => (
                                    <SelectItem key={index} value={job.jobId?.toString()}>{job.title}</SelectItem>
                                ))}
                            </Select>
                    </div>

                    <div className="grid lg:grid-cols-3 xs:grid-cols gap-3 mb-3">
                            <Select
                                label='Lokacija'
                                value={state.editUser.locationId.toString()}
                               
                                onChange={(e:any) => {setEditUserNumberFieldState('locationId', e.target.value)}}
                                >
                                {state.location.map((location, index) => (
                                    <SelectItem key={index} value={location.locationId?.toString()}>{location.name}</SelectItem>
                                ))}
                            </Select>
                            <Select
                                label='Spol'
                                value={state.editUser.gender.toString()}
                                
                                onChange={(e:any) => {setEditUserStringFieldState('gender', e.target.value)}}
                                >
                                <SelectItem key='musko' value='muško'>muško</SelectItem>
                                <SelectItem key='zensko' value='žensko'>žensko</SelectItem>
                            </Select>
                            <Select
                                label='Status'
                                value={state.editUser.status.toString()}
                                
                                onChange={(e:any) => {setEditUserStringFieldState('status', e.target.value)}}
                                >
                                <SelectItem key='aktivan' value='aktivan'>aktivan</SelectItem>
                                <SelectItem key='neaktivan' value='neaktivan'>neaktivan</SelectItem>
                            </Select>
                        <div className="grid grid-cols gap-2 mb-3">
                            <Input
                                label="Lozinka"
                                variant="bordered"
                                placeholder="Ukucajte lozinku"
                                value={state.editUser.passwordHash}
                                onChange={(e) => setEditUserStringFieldState('passwordHash', e.target.value)}
                                endContent={
                                    <button className="focus:outline-none" type="button" onClick={toggleVisibility}>
                                    {isVisible ? (
                                        <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                                    ) : (
                                        <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                                    )}
                                    </button>
                                }
                                type={isVisible ? "text" : "password"}
                                
                                />          
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 xs:grid-cols gap-2 mb-3">
                        <Button className="col-end-7" onClick={() => doEditUser()}>Snimi izmjene</Button>
                    </div>
                </div>
            </div>
         </div>
        )
    }

    function doEditUser() {
        try {
            api('api/user/edit/' + userID, 'patch', {
                forname: state.editUser.forname,
                surename: state.editUser.surname,
                email: state.editUser.email,
                password: state.editUser.passwordHash,
                localNumber: state.editUser.localNumber,
                telephone: state.editUser.telephone,
                jobId: state.editUser.jobId,
                departmentId: state.editUser.departmentId,
                locationId: state.editUser.locationId,
                status: state.editUser.status,
                code: state.editUser.code,
                gender: state.editUser.gender,
            }, 'administrator')
            .then((res: ApiResponse) => {
                if (res.status === 'login') {
                    setLogginState(false);
                    return;
                }
                getUserData();
            });
        } catch (error) {
            console.error('Greška prilikom izvršavanja API poziva:', error);
        }
    }

    function articles() {
        if (!state || !state.article) {
            return <div>Loading...</div>; 
        }
        const uniqueCategories = Array.from(new Set(state.article.map(artikal => artikal.category?.name)));
        return(
            <Accordion variant="splitted">
                {uniqueCategories.map((categoryName, index) => {
                    const categoryArticles = state.article.filter((artikal) => artikal.category?.name === categoryName)
                    return(
                        <AccordionItem key={categoryName} aria-label="Accordion 1" title={categoryName}>
                            <Table>
                                <TableHeader>
                                    <TableColumn>Naziv</TableColumn>
                                    <TableColumn>Serijski broj</TableColumn>
                                    <TableColumn>Inventurni broj</TableColumn>
                                    <TableColumn>Dokument</TableColumn>
                                </TableHeader>
                                <TableBody>
                                {categoryArticles.map((article) => (
                                <TableRow key={article.articleId}>
                                    <TableCell>{article.stock?.name || 'N/A'}</TableCell>
                                    <TableCell>
                                        <Link href={`#/admin/user/${article.serialNumber}`}>{article.serialNumber}</Link>
                                    </TableCell>
                                    <TableCell>{article.invNumber || 'N/A'}</TableCell>
                                    <TableCell>{saveFile(article.documents ? article.documents[0]?.path : 'N/A')}</TableCell>
                                </TableRow>
                            ))}
                                </TableBody>
                            </Table>
                        </AccordionItem>
                    )
                })}
        </Accordion>)
        
    }
}