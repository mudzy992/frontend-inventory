import React, { useEffect, useState } from "react";
import api, { ApiResponse } from '../../../API/api';
import { useNavigate, useParams } from 'react-router-dom';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import saveAs from "file-saver";
import { ApiConfig } from "../../../config/api.config";
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

interface AdminUserProfilePageState {
    editUser:{
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
    },
}

const AdminUserProfilePage: React.FC = () => {
    const { userID } = useParams();
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const toggleVisibility = () => setIsVisible(!isVisible);
    const [user, setUser] = useState<UserType>({})
    const [departmentData, setDepartmentData] = useState<DepartmentType[]>([])
    const [jobData, setJobData] = useState<JobType[]>([])
    const [selectedJobId, setSelectedJobId] = useState('');
    const [locationData, setLocationData] = useState<LocationType[]>([])
    const [selectedLocationId, setSelectedLocationId] = useState('');
    const [errorMessage, setErrorMessage] = useState<string>("")
    const [dataReady, setDataReady] = useState(false);

    const [state, setState] = React.useState<AdminUserProfilePageState>({
            editUser: {
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
            }
    });
    const navigate = useNavigate();
    
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

    /* GET funkcije */
    const getUserData = async () => {
        try {
          const res: ApiResponse = await api('api/user/' + userID, 'get', {}, 'administrator');
      
          if (res.status === 'error') {
            setErrorMessage('Greška prilikom učitavanja kategorije. Osvježite ili pokušajte ponovo kasnije');
            return navigate('/login');
          }
      
          if (res.status === 'login') {
            return navigate('/login');
          }
      
          const data: UserType = res.data;
          setUser(data);
          setErrorMessage('');
      
          return data; // Vraćanje podataka o korisniku
        } catch (error) {
          console.error('Greška prilikom dohvatanja korisničkih podataka:', error);
          // Možete dodati dodatnu logiku ili obradu grešaka prema potrebi
          throw error; // Bacanje greške kako bi je mogle uhvatiti komponente koje koriste ovu funkciju
        }
      };
      

    const getLocationData = async () => {
        try {
          const res: ApiResponse = await api('api/location?sort=name,ASC', 'get', {}, 'administrator');
      
          if (res.status === 'error') {
            setErrorMessage('Greška prilikom hvatanja lokacija');
            return navigate('/login');
          }
      
          if (res.status === 'login') {
            return navigate('/login');
          }
      
          setLocationData(res.data);
      
          return res.data; // Vraćanje podataka o lokacijama
        } catch (error) {
          console.error('Greška prilikom dohvatanja lokacija:', error);
          // Možete dodati dodatnu logiku ili obradu grešaka prema potrebi
          throw error; // Bacanje greške kako bi je mogle uhvatiti komponente koje koriste ovu funkciju
        }
      };
      

      const getDepartmentData = async () => {
        try {
          const res: ApiResponse = await api('api/department?sort=title,ASC', 'get', {}, 'administrator');
      
          if (res.status === 'error') {
            setErrorMessage('Greška prilikom hvatanja sektora i odjeljenja');
            return navigate('/login');
          }
      
          if (res.status === 'login') {
            return navigate('/login');
          }
      
          const data = res.data; // Ako želite koristiti ovu funkciju i u drugim kontekstima, možda će biti bolje da vratite samo data, a ne da pozivate setDepartmentData ovde
          setDepartmentData(data);
      
          return data; // Vraćanje podataka o sektoru i odjeljenju
        } catch (error) {
          console.error('Greška prilikom dohvatanja podataka o sektoru i odjeljenju:', error);
          // Možete dodati dodatnu logiku ili obradu grešaka prema potrebi
          throw error; // Bacanje greške kako bi je mogle uhvatiti komponente koje koriste ovu funkciju
        }
      };
      

    const getJobsByDepartmentId = async (departmentId: number): Promise<JobType[]> => {
        return new Promise(resolve => {
            api('api/job/?filter=departmentJobs.departmentId||$eq||' + departmentId + '/&sort=title,ASC', 'get', {}, 'administrator')
            .then((res : ApiResponse) => {
            if(res.status === 'error') {
                setErrorMessage('Greška prilikom hvatanja radnih mjesta')
                return navigate('/login');
            }
            if (res.status === 'login') {
                return navigate('/login')
            }

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
            setErrorMessage('Greška prilikom mapiranja radnik mjesta za traženi sektor/odjelnje. Greška: ' + error)
        }
    }

    const putUserDetailsInState = async (user: UserType) => {     
        setState((prev) => ({
          ...prev,
          editUser: {
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
          },
        }));
      };
      
      useEffect(() => {
        const fetchData = async () => {
          try {
            await getDepartmentData();
            const fetchedLocationData = await getLocationData();
            setLocationData(fetchedLocationData);
            await getUserData();
          } catch (error) {
            console.error('Greška prilikom dohvaćanja podataka:', error);
          } finally {
            // Postavite dataReady na true nakon što su svi podaci dohvaćeni
            setDataReady(true);
          }
        };
      
        fetchData();
      }, []);
      
      useEffect(() => {
        const fetchData = async () => {
          try {
            await putUserDetailsInState(user);
            await addJobDepartmentChange(state.editUser.departmentId);
          } catch (error) {
            console.error('Greška prilikom postavljanja detalja korisnika ili promjene sektora/odjeljenja:', error);
          }
        };
      
        if (dataReady) {
          fetchData();
        }
      }, [dataReady, state.editUser.departmentId]);
      
      useEffect(() => {
        // Postavite selectedLocationId nakon što su podaci o lokacijama dohvaćeni
        if (locationData.length > 0) {
          setSelectedLocationId(state.editUser.locationId ? `${state.editUser.locationId}` : '');
        }
      }, [locationData, state.editUser.locationId]);
    return (
        <>
            <RoledMainMenu/>
            <div className="container mx-auto mt-3 h-max">
                <Tabs id="left-tabs-example" aria-label="Options" className="mr-1 ml-1">
                    <Tab key='profile' title='Profil'>
                        <Card>
                            <CardBody>
                                {user ? (userData(user)) : ''}
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
            <div className="grid lg:grid-cols-6 grid-cols gap-2 md:mt-5">
                <div className="user-container col-span-2 md:mb-3 mb-5 lg:shadow-large border-3" >
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
                <div className="lg:col-span-4 col-span-2 md:col-span-2 lg:pl-4">
                        <div className="grid lg:grid-cols-3 grid-cols gap-3 mb-3">
                            <Input
                                value={user.surname}
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
                                value={state.editUser.code.toString()}
                                type='number'
                                label='Kadrovski broj'
                                variant='bordered'
                                onValueChange={(value: string) => setEditUserStringFieldState('code', value)}
                            />
                        </div>
                        <div className="grid lg:grid-cols-3 grid-cols gap-3 mb-3">
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

                    <div className="grid lg:grid-cols-2 grid-cols gap-3 mb-3">
                    <Select
                        id="departmentId"
                        label='Sektor/odjeljenje'
                        selectedKeys={state.editUser.departmentId ? [`${state.editUser.departmentId}`] : []}
                        onChange={(value: any) => {
                            setEditUserNumberFieldState('departmentId', value.target.value);
                            addJobDepartmentChange(value.target.value);
                        }}
                        >
                        {departmentData.map((department, index) => (
                            <SelectItem
                            key={department.departmentId ?? index}
                            textValue={department.title}
                            value={department.departmentId}
                            >
                            {department.departmentId} - {department.title}
                            </SelectItem>
                        ))}
                        </Select>
                            <Select
                                label='Radno mjesto'
                                selectedKeys={state.editUser.jobId ? [`${state.editUser.jobId}`] : []}
                                id="jobId"
                                onChange={(e:any) => {setEditUserNumberFieldState('jobId', e.target.value)}}
                                >
                                {jobData.map((job, index) => (
                                    <SelectItem key={job.jobId || index} textValue={job.title} value={job.jobId}>{job.title}</SelectItem>
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
                                selectedKeys={state.editUser.gender ? [`${state.editUser.gender}`] : []}
                                onChange={(e:any) => {setEditUserStringFieldState('gender', e.target.value)}}
                                >
                                <SelectItem key='muško' textValue="muško" value='muško'>muško</SelectItem>
                                <SelectItem key='žensko' textValue="žensko" value='žensko'>žensko</SelectItem>
                            </Select>
                            <Select
                                label='Status'
                                selectedKeys={state.editUser.status ? [`${state.editUser.status}`] : []}
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

                    <div className="grid lg:grid-cols-2 grid-cols gap-2 mb-3">
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
                    return navigate('/login')
                }
                getUserData();
            });
        } catch (error) {
            console.error('Greška prilikom izvršavanja API poziva:', error);
        }
    }

    function articles() {
        if (!state || !user || !user.articles) {
          return <div>Loading...</div>;
        }
        const uniqueCategories = Array.from(new Set(user.articles.map((article) => article.category?.name)));      
        return (
          <Accordion variant="splitted">
            {uniqueCategories.map((categoryName, index) => {
              const categoryArticles = user.articles?.filter((article:any) => article.category?.name === categoryName);
      
              return (
                <AccordionItem key={categoryName} aria-label={`Accordion ${index + 1}`} title={categoryName}>
                  <Table aria-label={`Tabela-artikala-${index}`} hideHeader removeWrapper isStriped>
                    <TableHeader>
                      <TableColumn>Naziv</TableColumn>
                      <TableColumn>Serijski broj</TableColumn>
                      <TableColumn>Inventurni broj</TableColumn>
                      <TableColumn>Dokument</TableColumn>
                    </TableHeader>
                    <TableBody>
                    {categoryArticles?.map((article: ArticleType) => (
                            <TableRow key={article.articleId}>
                                <TableCell>{article.stock?.name || 'N/A'}</TableCell>
                                <TableCell>
                                    <Link href={`#/admin/article/${article.serialNumber}`}>{article.serialNumber}</Link>
                                </TableCell>
                                <TableCell>{article.invNumber || 'N/A'}</TableCell>
                                <TableCell>{saveFile(article.documents ? article.documents[0]?.path : 'N/A')}</TableCell>
                            </TableRow>
                        )) || []}
                    </TableBody>
                  </Table>
                </AccordionItem>
              );
            })}
          </Accordion>
        );
      }
      
}
export default AdminUserProfilePage;