import React from "react";
import { Card } from 'react-bootstrap';
import api, { ApiResponse } from '../../../API/api';
import { Redirect } from 'react-router-dom';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import UserType from "../../../types/UserType";
import DepartmentJobLocationType from "../../../types/Department.Job.Location.Type";

/* Obavezni dio komponente je state (properties nije), u kome definišemo konačno stanje komponente */
interface UserPageState {
    /* u ovom dijelu upisuje type npr. ako je kategorija je nekog tipa
    ako u nazivu tog typa stavimo upitnik, time kažemo da nije obavezno polje dolje ispod u konstruktoru */
    users: UserType[];
    departmentJobLocation: DepartmentJobLocationType[];
    message: string;
    isLoggedIn: boolean;
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

    private setDepartmentJobLocation(departmentJobLocationData: DepartmentJobLocationType[] | undefined) {
        this.setState(Object.assign(this.state, {
            departmentJobLocation: departmentJobLocationData
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
                /* Nakon što se izvrši ruta, šta onda */
                if (res.status === 'error') {
                    this.setErrorMessage('Greška prilikom učitavanja korisnika');
                }
                if (res.status === 'login') {
                    return this.setLogginState(false);
                }
                /* this.setUsers(res.data) */
                /*  const data : ApiUserDto[] = res.data */
                const data: UserType[] = res.data;
                this.setUsers(data)
            })
    }

    private getDepartmentJobLocation() {
        api('api/departmentJob/', 'get', {}, 'administrator')
            .then((res: ApiResponse) => {
                /* Nakon što se izvrši ruta, šta onda */
                if (res.status === 'error') {
                    this.setErrorMessage('Greška prilikom učitavanja korisnika');
                }
                if (res.status === 'login') {
                    return this.setLogginState(false);
                }
                /* this.setUsers(res.data) */
                /*  const data : ApiUserDto[] = res.data */
                const data: DepartmentJobLocationType[] = res.data;
                this.setDepartmentJobLocation(data)
            })
    }

    /* KRAJ GET I MOUNT FUNKCIJA */

    private TableContent() {
        const columns = [{
            dataField: 'userId',
            text: '#',
            formatter: (row: any) => (
                <div style={{ justifyContent: 'center', display: 'flex' }}>
                    <a href={`#/admin/userProfile/${row}`} className="btn btn-primary btn-sm" role="button" aria-pressed="true"> <i className="bi bi-person-fill" style={{fontSize:17}}/> Profil</a>
                </div>
            )
        },
        {
            dataField: 'fullname',
            text: 'Ime i prezime: ',
            sort: true,
            filter: textFilter(),        
        },
        {
            dataField: 'jobTitle',
            text: 'Radno mjesto',
            sort: true
        },
        {
            dataField: 'department',
            text: 'Sektor',
            sort: true
        },
        {
            dataField: 'location',
            text: 'Lokacija',
            sort: true
        },
        ];
        const options = {
            page: 0, /* Koja je prva stranica prikaza na učitavanju */
            sizePerPageList: [{
                text: '5', value: 5
            }, {
                text: '10', value: 10
            }, {
                text: 'Sve', value: this.state.users?.length
            }],
            sizePerPage: 5, /* Koliko će elemenata biti prikazano */
            pageStartIndex: 0,
            paginationSize: 3,
            prePage: 'Prethodna',
            nextPage: 'Sljedeća',
            firstPage: 'Prva',
            lastPage: 'Zadnja',
            paginationPosition: 'top'
        };

        return (
            <>
                 <BootstrapTable
                    keyField="userId"
                    data={this.state.users}
                    columns={columns}
                    wrapperClasses='table-responsive'
                    classes="react-bootstrap-table"
                    bordered={false}
                    striped
                    hover
                    filter={filterFactory()}
                    pagination={paginationFactory(options)}
                /> 
                {this.printOptionalMessage()}
            </>
        )
    }
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
                        {this.TableContent()}
                    </Card.Body>
                </Card>
            </>
        )
    }
}


