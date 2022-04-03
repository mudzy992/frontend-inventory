import { Alert, Container, Paper } from '@mui/material';
import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api, { ApiResponse } from '../../../API/api';
import ArticleType from '../../../types/ArticleType';
import CategoryType from '../../../types/CategoryType';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import paginationFactory from 'react-bootstrap-table2-paginator';

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

interface ArticleDto {
    articleId: number;
    name: string;
    excerpt?: string;
    description?: string;
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
                        <Card className={this.state.articles.length > 0 ? '' : 'd-none'} style={{ marginBottom: 10}} text='white' bg='dark'>
                            <Card.Header>
                                <Card.Title>
                                <i className="bi bi-list"/>{this.state.category?.name}
                                </Card.Title>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    {this.printErrorMessage()}
                                 </Row>      
                                    {this.showArticles()}
                                 
                            </Card.Body>
                        </Card>  
                        <Card className="mb-3 text-white bg-dark">
                            <Card.Header>
                                <i className="bi bi-list-nested"/> Podkategorije
                            </Card.Header>
                            <Card.Body>
                                {this.showSubcategories()}
                            </Card.Body>
                        </Card>
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
                {this.state.subCategory?.map(this.singleCategory)}
            </Row>
        );
    }

    private singleCategory(category: CategoryType) {
        return (
            /* Ono kako želimo da prikažemo kategoriju (dizajn) */
            <Col lg="3" md="4" sm="6" xs="12">
                <Card className="text-dark bg-light mb-3">
                    <Card.Header>
                        <Card.Title>
                            {category.name}
                        </Card.Title>
                    </Card.Header>
                    <Card.Body style={{display:'flex', justifyContent: 'center'}}>
                        <i className={category.imagePath} style={{ fontSize: 100 }}></i>
                    </Card.Body>
                    <Card.Footer>
                        <small><Link to={`/category/${category.categoryId}`}
                            className='btn btn-primary btn-block btn-sm'>Prikaži kategoriju</Link></small>
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
            <Row>
                {this.TableContent()}
            </Row>
        );
    }

    private TableContent() {
        const columns = [
        {
            dataField: 'name',
            text: 'Naziv ',
            sort: true,
            filter: textFilter(),
        },
        {
            dataField: 'articleId',
            text: '',
            formatter: (row: any) => (
                <div style={{ justifyContent: 'center', display: 'flex' }}>
                    <a href={`#/article/${row}`} className="btn btn-primary btn-sm" role="button" aria-pressed="true"> <i className="bi bi-three-dots"></i> Detalji</a>
                </div>
            )
        },
        ];
        const options = {
            page: 0, /* Koja je prva stranica prikaza na učitavanju */
            sizePerPageList: [{
                text: '5', value: 5
            }, {
                text: '10', value: 10
            }, {
                text: 'Sve', value: this.state.articles.length
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
            <Paper>
                <BootstrapTable
                    keyField="userId"
                    data={this.state.articles}
                    columns={columns}
                    wrapperClasses='table-responsive'
                    classes="react-bootstrap-table"
                    bordered={false}
                    striped
                    hover
                    filter={filterFactory()}
                    pagination={paginationFactory(options)}
                />
                </Paper>
            </>
        )
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

                const articleData: ArticleType[] =
                    res.data.map((article: ArticleDto) => {
                        const object: ArticleType = {
                            articleId: article.articleId,
                            name: article.name,
                            excerpt: article.excerpt,
                            description: article.description
                        }
                        return object
                    })
                this.setArticles(articleData)
            })
    }
}/* KRAJ GET I MOUNT FUNKCIJA */