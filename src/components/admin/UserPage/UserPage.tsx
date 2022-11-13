import React from "react";
import { Card } from 'react-bootstrap';
import api, { ApiResponse } from '../../../API/api';
import { Redirect } from 'react-router-dom';
import UserType from "../../../types/UserType";
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import { Button } from "@mui/material";
import ApiUserDto from "../../../dtos/ApiUserDto";


/* Obavezni dio komponente je state (properties nije), u kome definišemo konačno stanje komponente */
interface UserPageState {
    /* u ovom dijelu upisuje type npr. ako je kategorija je nekog tipa
    ako u nazivu tog typa stavimo upitnik, time kažemo da nije obavezno polje dolje ispod u konstruktoru */
    users: UserType[];
    message: string;
    isLoggedIn: boolean;
}

    
function UserTable(row:UserType[]){
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
        {field: 'fullname', headerName: 'Ime i prezime', width: 200},
        {field: 'departmentTitle', headerName: 'Sektor/Odjeljenje', width: 200},
        {field: 'jobTitle', headerName: 'Radno mjesto', width: 200},
        {field: 'locationName', headerName: 'Lokacija', width: 150},
        {field: 'email', headerName: 'Email', width: 200},
        {field: 'localNumber', headerName: 'Lokal'},
        {field: 'telephone', headerName: 'Tel'},
        ];
    return(
        <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid
                rows={row}
                getRowId={(row) => row.userId}
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
            message: "",
            isLoggedIn: true,
        }
    }

    /* SET FUNKCIJE ĆEMO DEFINISATI PRIJE RENDERA */
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
        console.log(this.state.users)
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
                this.setUsers(res.data)
            })
    }

    private setUsers(data: ApiUserDto[]) {
        const info: UserType[] = data.map(user => {
            return {
                departmentId: user.departmentId,
                jobId: user.jobId,
                locationId: user.locationId,
                departmentTitle: user.department.title,
                depatmentDescription: user.department.description,
                departmentCode: user.department.departmentCode,
                jobTitle: user.job.title,
                jobDescription: user.job.description,
                jobCode: user.job.jobCode,
                locationName: user.location.name,
                locationCode: user.location.locationCode,
                fullname: user.fullname,
                surname: user.surname,
                forname: user.forname,
                localNumber: user.localNumber,
                telephone: user.telephone,
                email: user.email,
                userId: user.userId,
            }
        })
        this.setState(Object.assign(this.state, {
            users: info,
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
                        <i className="bi bi-people-fill"/> Korisnici
                        </Card.Title>
                    </Card.Header>
                    <Card.Body>
                        {UserTable(this.state.users)}
                    </Card.Body>
                </Card>
            </>
        )
    }
}


