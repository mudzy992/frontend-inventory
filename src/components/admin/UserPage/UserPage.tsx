import React from "react";
import { Card } from 'react-bootstrap';
import api, { ApiResponse } from '../../../API/api';
import { Redirect } from 'react-router-dom';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import UserType from "../../../types/UserType";
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import DepartmentJobLocationType from "../../../types/Department.Job.Location.Type";
import DepartmentJobLocationDto from "../../../dtos/Department.Job.Location.Dto";
import { Button } from "@mui/material";


/* Obavezni dio komponente je state (properties nije), u kome definišemo konačno stanje komponente */
interface UserPageState {
    /* u ovom dijelu upisuje type npr. ako je kategorija je nekog tipa
    ako u nazivu tog typa stavimo upitnik, time kažemo da nije obavezno polje dolje ispod u konstruktoru */
    users: UserType[];
    departmentJobLocation: DepartmentJobLocationType[];
    message: string;
    isLoggedIn: boolean;
}

    
function UserTable(row:DepartmentJobLocationType[]){
    const kolone: GridColDef[] = [
        {
        field: 'userId', 
        headerName: 'Profil',
        sortable: false,
        disableColumnMenu: true,
        headerAlign: 'center',
        renderCell: (params: GridRenderCellParams<String>) => (
              <Button
                size="small"
                style={{ marginLeft: 5 }}
                href={`#/admin/userProfile/${params.row.userId}`} 
                tabIndex={params.hasFocus ? 0 : -1}
              >
                <i className="bi bi-person-fill" style={{fontSize:25}}/>
              </Button>
          ),
    },
        {field: 'userFullname', headerName: 'Ime i prezime', width: 200},
        {field: 'departmentTitle', headerName: 'Sektor/Odjeljenje', width: 200},
        {field: 'jobTitle', headerName: 'Radno mjesto', width: 200},
        {field: 'locationName', headerName: 'Lokacija', width: 150},
        {field: 'userEmail', headerName: 'Email', width: 200},
        {field: 'userLocalnumber', headerName: 'Lokal'},
        {field: 'userTelephone', headerName: 'Tel'},
        ];
    return(
        <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid
                rows={row}
                getRowId={(row) => row.departmentJobId}
                columns={kolone}
                pageSize={5}
                rowsPerPageOptions={[5]}
            />
        </Box>
    )
}

/* Ova komponenta je proširena da se prikazuje na osnovu parametara koje smo definisali iznad */
export default class UserPage extends React.Component {
    state: UserPageState;

    constructor(props: Readonly<{}>) {
        super(props);
        this.state = {
            users: [],
            departmentJobLocation: [],
            message: "",
            isLoggedIn: true,
        }
    }

    /* SET FUNKCIJE ĆEMO DEFINISATI PRIJE RENDERA */

    private setUsers(userData: UserType[] | undefined) {
        this.setState(Object.assign(this.state, {
            users: userData
        }))
    }

    

    private setErrorMessage(message: string) {
        this.setState(Object.assign(this.state, {
            message: message,
        }));
    }

    private setLogginState(isLoggedIn: boolean) {
        const newState = Object.assign(this.state, {
            isLoggedIn: isLoggedIn,
        });

        this.setState(newState);
    }

    /* KRAJ SET FUNCKIJA */

    /* GET I MOUNT FUNKCIJE ĆEMO DEFINISATI ISPOD RENDERA */
    componentDidMount() {
        /* Upisujemo funkcije koje se izvršavaju prilikom učitavanja stranice */
        this.getUserData()
        this.getDepartmentJobLocation()
    }

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

    /* Funkcija za dopremanje podataka, veza sa api-jem  
    api u većini slučajeva traži povratnu informaciju 3 parametra
    api('1', '2', '3'){} 
    1. ruta (provjeriti u backend), 
    2. method (onaj koji definišemo u api da koristimo get, post, patch, delete, update..) 
    3. body (ako je get tj. prazan body stavljamo {} a ako nije unutar {definišemo body})
    4. administrator ili user rola */
    private getUserData() {
        api('api/user/', 'get', {}, 'administrator')
            .then((res: ApiResponse) => {
                if (res.status === 'error') {
                    this.setErrorMessage('Greška prilikom učitavanja korisnika');
                }
                if (res.status === 'login') {
                    return this.setLogginState(false);
                }
                const data: UserType[] = res.data;
                this.setUsers(data)
            })
    }

    private getDepartmentJobLocation() {
        api('api/departmentJob/', 'get', {}, 'administrator')
            .then((res: ApiResponse) => {
                if (res.status === 'error' || res.status === "login") {
                    this.setErrorMessage('Greška prilikom učitavanja korisnika');
                    this.setLogginState(false)
                    return
                }
                this.setDepartmentJobLocation(res.data)
            })
    }

    private setDepartmentJobLocation(data: DepartmentJobLocationDto[]) {
        const info: DepartmentJobLocationType[] = data.map(details => {
            return {
                departmentJobId: details.departmentJobId,
                departmentId: details.departmentId,
                jobId: details.jobId,
                locationId: details.locationId,
                departmentTitle: details.department.title,
                depatmentDescription: details.department.description,
                departmentCode: details.department.departmendCode,
                jobTitle: details.job.title,
                jobDescription: details.job.description,
                jobCode: details.job.jobCode,
                locationName: details.location.name,
                locationCode: details.location.code,
                userFullname: details.users.map(user => user.fullname).toString(),
                userSurname: details.users.map(sur => sur.surname).toString(),
                userForname: details.users.map(frName => frName.forname).toString(),
                userLocalnumber: details.users.map(ln => ln.localNumber).toString(),
                userTelephone: details.users.map(tel => tel.telephone).toString(),
                userEmail: details.users.map(em => em.email).toString(),
                userId: Number(details.users.map(uID => uID.userId))
                
            }
        })
        this.setState(Object.assign(this.state, {
            departmentJobLocation: info,
        }))
    }

    /* KRAJ GET I MOUNT FUNKCIJA */
    render() {
        /* Prije povratne izvršenja returna možemo izvršiti neke provjere */
        /* kraj provjera */
        if (this.state.isLoggedIn === false) {
            return (
                <Redirect to="/user/login" />
            );
        }
        return (
            <>
                <Card className="mb-3 text-dark bg-light">
                    <Card.Header>
                        <Card.Title>
                        <i className="bi bi-people-fill"/> Spisak korisnika
                        </Card.Title>
                    </Card.Header>
                    <Card.Body>
                        {UserTable(this.state.departmentJobLocation)}
                    </Card.Body>
                </Card>
            </>
        )
    }
}


