import React from "react";
import {Card, Col, Container, Row } from 'react-bootstrap';
import { Alert, Table, TableContainer, TableHead, TableRow, TableBody, TableCell } from "@mui/material";
import Paper from '@mui/material/Paper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import api, { ApiResponse } from '../../API/api';
import UserType from '../../types/UserType';
import { Link } from 'react-router-dom';
import ApiUserDto from '../../dtos/ApiUserDto';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import { faArrowDownShortWide, faUser, faUsers,  } from "@fortawesome/free-solid-svg-icons";


/* Obavezni dio komponente je state (properties nije), u kome definišemo konačno stanje komponente */

interface UserPageState {
    /* u ovom dijelu upisuje type npr. ako je kategorija je nekog tipa
    ako u nazivu tog typa stavimo upitnik, time kažemo da nije obavezno polje dolje ispod u konstruktoru */
    users: UserType[];
    message: string;
}



const columns = [{  
    dataField: 'userId',  
    text: '#',
    formatter: (row: any) => (
        <div style={{justifyContent: 'center', display: 'flex'}}>
          <a href={`#/userProfile/${row}`} className="btn btn-primary btn-sm" role="button" aria-pressed="true"> <FontAwesomeIcon icon={faUser}/> Profil</a>
        </div>
      )
  },  
  {  
    dataField: 'surname', 
    text: 'Ime ',  
    sort:true,
    filter: textFilter(),
    formatter: (row: any) => (
        <div>
            <FontAwesomeIcon icon={faArrowDownShortWide}/> {`${row}`}
        </div>
    )
    
  },
  {  
    dataField: 'forname',  
    text: 'Prezime',  
    sort:true,
    
  },
  {  
    dataField: 'jobTitle',  
    text: 'Radno mjesto',  
    sort:true  
  },
  {  
    dataField: 'department',  
    text: 'Sektor',  
    sort:true  
  },
  {  
    dataField: 'location',  
    text: 'Lokacija',  
    sort:true  
  },
];




/* Ova komponenta je proširena da se prikazuje na osnovu parametara koje smo definisali iznad */
export default class UserPage extends React.Component {
    state: UserPageState;

    constructor(props: Readonly<{}>){
        super(props);
        this.state = {
            message: "",
            users: []
        }
    }
    
    /* SET FUNKCIJE ĆEMO DEFINISATI PRIJE RENDERA */
    private setUsers(userData: ApiUserDto[]) {
        const users: UserType[] = userData.map(user => {
            return {
                userId: user.userId,
                surname: user.surname,
                forname: user.forname,
                email: user.email,
                jobTitle: user.jobTitle,
                department: user.department,
                location: user.location,
                articles: user.articles.map(userArticles => ({
                    articleId: userArticles.articleId,
                    name: userArticles.name,
                    excerpt: userArticles.excerpt,
                    description: userArticles.description,
                    comment: userArticles.description,
                    concract: userArticles.concract,
                    categoryId: userArticles.categoryId,
                    sapNumber: userArticles.sapNumber
                })),
                responsibilityArticles: user.responsibilityArticles.map(ra =>({
                    userArticleId: ra.userArticleId,
                    value: ra.value,
                    status: ra.status,
                    timestamp: ra.timestamp,
                    serialNumber: ra.serialNumber
                })),
                debtItems: user.debtItems.map(debtItems=> ({
                    debtItemsId: debtItems.debtItemsId,
                    value: debtItems.value,
                    comment: debtItems.comment,
                    timestamp: debtItems.timestamp,
                    serialNumber: debtItems.serialNumber
                })),
                destroyeds: user.destroyeds.map(destroyed=> ({
                    destroyedId: destroyed.destroyedId,
                    value: destroyed.value,
                    comment: destroyed.comment,
                    timestamp: destroyed.timestamp,
                    serialNumber: destroyed.serialNumber
                }))
            }
        })
        const newState = Object.assign(this.state, {
            users: users
          })
          this.setState(newState)
    }

    private setErrorMessage(message: string) {
        this.setState(Object.assign(this.state, {
            message: message,
        }));
    }

        /* KRAJ SET FUNCKIJA */

    /* GET I MOUNT FUNKCIJE ĆEMO DEFINISATI ISPOD RENDERA */
    componentDidMount(){
        /* Upisujemo funkcije koje se izvršavaju prilikom učitavanja stranice */
        this.getUserData()
    }

    componentDidUpdate(){
        /* Upisujemo logiku koja će se izvršavati nakon update (da se ne osvježava stalno stranica) */
        
    }

    private printOptionalMessage() {
        if (this.state.message === '') {
            return;
        }
        return (
            <Card.Text>
                { this.state.message }
            </Card.Text>
        );
    }

    /* Funkcija za dopremanje podataka, veza sa api-jem  
    api u većini slučajeva traži povratnu informaciju 3 parametra
    api('1', '2', '3'){} 
    1. ruta (provjeriti u backend), 
    2. method (onaj koji definišemo u api da koristimo get, post, patch, delete, update..) 
    3. body (ako je get tj. prazan body stavljamo {} a ako nije unutar {definišemo body}) */
    private getUserData () {
        api('api/user/', 'get', {} )
        .then((res: ApiResponse ) => {
            /* Nakon što se izvrši ruta, šta onda */
            if(res.status === 'error') {
                this.setErrorMessage('Greška prilikom učitavanja korisnika');
            }
            this.setUsers(res.data)
        }) 
    }
    
    /* KRAJ GET I MOUNT FUNKCIJA */

    private TableContent () {
        const options = {  
            page: 0, /* Koja je prva stranica prikaza na učitavanju */   
            sizePerPageList: [ {  
                text: '5', value: 5  
            }, {  
                text: '10', value: 10  
            }, {  
                text: 'Sve', value: this.state.users.length  
            } ],   
            sizePerPage: 5, /* Koliko će elemenata biti prikazano */
            pageStartIndex: 0,   
            paginationSize: 3, 
            prePage: 'Prethodna',   
            nextPage: 'Sljedeća',   
            firstPage: 'Prva',   
            lastPage: 'Zadnja',   
            paginationPosition: 'top'
          };

        const expandRow = {
            renderer: (row: UserType) => (
                <>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 700 }} aria-label="customized table">
                    <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Naziv</TableCell>
                        <TableCell>Ugovor</TableCell>
                        <TableCell>SAP broj</TableCell> 
                    </TableRow>
                </TableHead>
                    {this.ExtendedTableContent(row)}
                    </Table>
                </TableContainer>
            </>
            ), onlyOneExpanding: true, /* Poigrat se malo ovdje sa css, pokušati zbaciti fade */
          };

          return(
            <>
                <BootstrapTable
                        keyField="userId"
                        data={ this.state.users }
                        columns={ columns }
                        wrapperClasses='table-responsive'
                        classes="react-bootstrap-table"
                        bordered={false}
                        striped
                        hover
                        expandRow={expandRow}
                        filter={filterFactory()}
                        pagination={paginationFactory(options)}
                        />

                {this.printOptionalMessage()}
            </>
     )}

     private ExtendedTableContent (row:UserType) {
         if (row.articles?.length === 0) {
                 return (
                     <TableRow>
                         <TableCell colSpan={4}>
                         <Alert variant="filled" severity="info">Korisnik nema zadužene opreme</Alert>
                         </TableCell>
                    </TableRow>
                 )
             }
         return (
            row.articles?.map(article => (
                <>
                <TableBody>
                    <TableRow hover>
                        <TableCell>{article.articleId}</TableCell>
                        <TableCell><Link style={{textDecoration: 'none', fontWeight:'bold'}} to={`/article/${article.articleId}`}>{article.name} </Link></TableCell>
                        <TableCell>{article.concract}</TableCell>
                        <TableCell>{article.sapNumber}</TableCell>
                    </TableRow>
                </TableBody>
                </>
                ), this)
         )
     }
     
    render() {
        /* Prije povratne izvršenja returna možemo izvršiti neke provjere */
        /* kraj provjera */
        return (
        <>
            <Container style={{marginTop:10}} fluid="md">
                <Col>
                    <Card className="text-dark bg-light">
                    <Card.Body>
                        <Card.Header>
                            <Card.Title>
                                <FontAwesomeIcon icon={faUsers}/> Spisak korisnika
                            </Card.Title>
                        </Card.Header>
                        <Row> 
                            <Card.Text>
                            {this.TableContent()}  
                            </Card.Text>
                        </Row>
                    </Card.Body>
                    </Card>
                </Col>
            </Container>
        </>  
    )}
}


