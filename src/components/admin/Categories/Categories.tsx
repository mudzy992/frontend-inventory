import { Alert } from '@mui/material';
import React from 'react';
import { Card, Col, Row, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api, { ApiResponse } from '../../../API/api';
import ArticleType from '../../../types/ArticleType';
import CategoryType from '../../../types/CategoryType';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import { Button } from "@mui/material";

/* Ako imamo potrebu da se stranica učitava prilikom osvježavanja komponente po parametrima
npr. Ako nam treba konkretno neki artikal po articleID, kategorija po categoryID, korisnik po userID
onda koristimo interface koji uzima paramtera koji smo definisali u ruti (u komponenti gdje kreiramo rute)
i naziv tog parametra mora biti isti kao što je u ruti */
interface CategoryPageProperties {
    match: {
        params: {
            categoryID: number;
        }
    }
}

/* Obavezni dio komponente je state (properties nije), u kome definišemo konačno stanje komponente */

interface CategoryPageState {
    /* u ovom dijelu upisuje type npr. ako je kategorija je nekog tipa */
    category?: CategoryType; /* Ovdje kažemo da je kategorija primjerak CategoryType */
    subCategory?: CategoryType[]; /* A ovdje kažemo da je pod kategorija lista primjerka CategoryType*/
    message: string;
    articles: ArticleType[];
}

/* U većini slučajeva će biti potrebno napraviti DataTransferObjekat koji će raditi sa podacima,
gdje ćemo definisati da je neka veza primjerak tog DTO-a*/

interface CategoryDto {
    categoryId: number;
    name: string;
    imagePath: string;
}

function CategoryTable(row:ArticleType[]){
    const kolone: GridColDef[] = [
        {
        field: 'articleId', 
        headerName: 'Profil',
        sortable: false,
        disableColumnMenu: true,
        headerAlign: 'center',
        renderCell: (params: GridRenderCellParams<String>) => (
              <Button
                size="small"
                style={{ marginLeft: 5 }}
                href={`#/article/${params.row.articleId}`} 
                tabIndex={params.hasFocus ? 0 : -1}
              >
                <i className="bi bi-three-dots" style={{fontSize:25}}/>
              </Button>
          ),
    },
        {field: 'name', headerName: 'Naziv', width: 340},
        {field: 'excerpt', headerName: 'Kratak opis', width: 320},
        {field: 'sapNumber', headerName: 'SAP broj', width: 200},
        {field: 'concract', headerName: 'Ugovor', width: 150},
        ];
    return(
        <Box sx={{height: 400, width: '100%' }}>
            <DataGrid
                rows={row}
                getRowId={(row) => row.articleId}
                columns={kolone}
                pageSize={5}
                rowsPerPageOptions={[5]}
                sx={{backgroundColor:"white"}}
            />
        </Box>
    )
}

/* Ova komponenta je proširena da se prikazuje na osnovu parametara koje smo definisali iznad */
export default class CategoryPage extends React.Component<CategoryPageProperties> {
    state: CategoryPageState;
    constructor(props: Readonly<CategoryPageProperties>) {
        super(props);
        this.state = {
            articles: [],
            message: ""
        }
    }

    /* SET FUNKCIJE ĆEMO DEFINISATI PRIJE RENDERA */
    private setErrorMessage(message: string) {
        this.setState(Object.assign(this.state, {
            message: message,
        }));
    }

    private setCategoryData(category: CategoryType) {
        this.setState(Object.assign(this.state, {
            category: category
        }))
    }

    private setSubcategories(subcategories: CategoryType[]) {
        this.setState(Object.assign(this.state, {
            subCategory: subcategories,
        }));
    }

    private setArticles(articles: ArticleType[]) {
        this.setState(Object.assign(this.state, {
            articles: articles
        }))
    }


    /* KRAJ SET FUNCKIJA */

    render() {
        /* Prije povratne izvršenja returna možemo izvršiti neke provjere */
        /* kraj provjera */
        return (
            /* prikaz klijentu */
            <>
                <RoledMainMenu role='administrator' />
                <Container style={{ marginTop: 15 }}>
                    <Row className={this.state.articles.length > 0 ? '' : 'd-none'}>
                        <h5 style={{marginLeft:10, marginBottom:8, color:"white"}}><i className="bi bi-list"/>{this.state.category?.name}</h5>
                        <div> 
                            {this.showArticles()}
                        </div>
                    </Row>

                    <Row style={{marginTop:25}}>
                    <h5 style={{marginLeft:10, marginBottom:8, color:"white"}}> <i className="bi bi-list-nested"/> Podkategorije</h5>
                        <div>
                            {this.showSubcategories()}
                        </div>
                    </Row>
                </Container>
            </>
        )
    }

    private printErrorMessage() {
        if (this.state.message === "") {
            return;
        }
        return (
            <Alert severity="error"
                style={{ marginTop: 15 }}
                className={this.state.message ? '' : 'd-none'}>
                <i className="bi bi-exclamation-circle-fill"></i>  {this.state.message}
            </Alert>
        )
    }
    private showSubcategories() {
        if (this.state.subCategory?.length === 0) {
            return;
        }
        return (
            <Row>
                {this.printErrorMessage()}
                {this.state.subCategory?.map(this.singleCategory)}
            </Row>
        );
    }

    private singleCategory(category: CategoryType) {
        return (
            /* Ono kako želimo da prikažemo kategoriju (dizajn) */
            <Col lg="2" md="4" sm="6" xs="6">
                <Card className="bg-dark text-white mb-3">
                    <Card.Header>
                        <Card.Title>
                            {category.name}
                        </Card.Title>
                    </Card.Header>
                    <Card.Body style={{display:'flex', justifyContent: 'center'}}>
                        <i className={category.imagePath} style={{ fontSize: 60 }}></i>
                    </Card.Body>
                    <Card.Footer style={{display:"flex", justifyContent:'center'}}>
                        <small><Link to={`/category/${category.categoryId}`}
                            className='btn btn-block btn-sm'>Prikaži kategoriju</Link></small>
                    </Card.Footer>
                </Card>
            </Col>
        )
    }

    private showArticles() {
        if (this.state.articles?.length === 0) {
            return (
                <div>Nema opreme definisane za ovu kategoriju.</div>
            )
        }
        return (
                CategoryTable(this.state.articles)
        );
    }

    /* GET I MOUNT FUNKCIJE ĆEMO DEFINISATI ISPOD RENDERA */
    componentDidMount() {
        /* Upisujemo funkcije koje se izvršavaju prilikom učitavanja stranice */
        this.getCategoriesData()
    }

    componentDidUpdate(oldProperties: CategoryPageProperties) {
        /* Upisujemo logiku koja će se izvršavati nakon update (da se ne osvježava stalno stranica) */
        if (oldProperties.match.params.categoryID === this.props.match.params.categoryID) {
            return;
        }
        this.getCategoriesData();
    }

    /* Funkcija za dopremanje podataka, veza sa api-jem  
    api u većini slučajeva traži povratnu informaciju 3 parametra
    api('1', '2', '3'){} 
    1. ruta (provjeriti u backend), 
    2. method (onaj koji definišemo u api da koristimo get, post, patch, delete, update..) 
    3. body (ako je get tj. prazan body stavljamo {} a ako nije unutar {definišemo body}) */
    private getCategoriesData() {
        api('api/category/' + this.props.match.params.categoryID, 'get', {}, 'administrator')
            .then((res: ApiResponse) => {
                if (res.status === 'error') {
                    return this.setErrorMessage('Greška prilikom učitavanja kategorije. Osvježite ili pokušajte ponovo kasnije')
                }

                /* popunjavamo type kategorije iz responsa */

                const categoryData: CategoryType = {
                    categoryId: res.data.categoryId,
                    name: res.data.name,
                    imagePath: res.data.imagePath,
                    /* Link za sliku */
                }
                /* setujemo u funkciju setCategory podatke koje smo izvukli i sada su nam dostupni za koristiti uvijek */
                this.setCategoryData(categoryData)

                const subcategories: CategoryType[] =
                    res.data.categories.map((category: CategoryDto) => {
                        return {
                            categoryId: category.categoryId,
                            name: category.name,
                            imagePath: category.imagePath
                        }
                    });
                this.setSubcategories(subcategories);
            })

        api('api/article/?filter=categoryId||$eq||' + this.props.match.params.categoryID, 'get', {}, 'administrator')
            .then((res: ApiResponse) => {
                if (res.status === 'error') {
                    return this.setErrorMessage('Greška prilikom učitavanja kategorije. Osvježite ili pokušajte ponovo kasnije')
                }

                /* popunjavamo type kategorije iz responsa */

                this.setArticles(res.data)
            })
    }
}/* KRAJ GET I MOUNT FUNKCIJA */