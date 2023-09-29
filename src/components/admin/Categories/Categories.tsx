import { Alert } from '@mui/material';
import React from 'react';
import { Card, Col, Row, Container, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api, { ApiResponse } from '../../../API/api';
import CategoryType from '../../../types/CategoryType';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbar } from '@mui/x-data-grid';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { TABELE } from "../../../config/lang.ba";
import Box from '@mui/material/Box';
import { hrHR } from '@mui/material/locale';
import { Button } from "@mui/material";

import UserArticleType from '../../../types/UserArticleType';
import Tabela from './TableFunction';

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

interface ArticleType {
    articleId?: number;
    name?: string;
    excerpt?: string;
    sapNumber?: string;
    categoryId?: number;
    category?: {
        name: string;
        imagePath: string;
    };
    userArticles?: {
        /* invBroj?: string; */
        serialNumber?: string;
        status?: 'zaduženo' | 'razduženo' | 'otpisano';
        timestamp?: string;
        userId?: number;
    }[],
    userDetails?: {
      userId: number;
      surname: string;
      forname: string;
      fullname: string;
    }[]
}

interface UserArticleBaseType {
    articleId?: number;
    name?: string;
    excerpt?: string;
    sapNumber?: string;
    articles?: {
        invBroj?: string;
        serialNumber?: string;
        status?: string;
        timestamp?: string;
        userId?: number;
    }[]
}

/* Obavezni dio komponente je state (properties nije), u kome definišemo konačno stanje komponente */

interface CategoryPageState {
    /* u ovom dijelu upisuje type npr. ako je kategorija je nekog tipa */
    category?: CategoryType; /* Ovdje kažemo da je kategorija primjerak CategoryType */
    subCategory?: CategoryType[]; /* A ovdje kažemo da je pod kategorija lista primjerka CategoryType*/
    message: string;
    articles: ArticleType[];
    userArticle: UserArticleBaseType[];
}

/* U većini slučajeva će biti potrebno napraviti DataTransferObjekat koji će raditi sa podacima,
gdje ćemo definisati da je neka veza primjerak tog DTO-a*/

interface CategoryDto {
    categoryId: number;
    name: string;
    imagePath: string;
}


/* Ova komponenta je proširena da se prikazuje na osnovu parametara koje smo definisali iznad */
export default class CategoryPage extends React.Component<CategoryPageProperties> {
    state: CategoryPageState;
    constructor(props: Readonly<CategoryPageProperties>) {
        super(props);
        this.state = {
            userArticle: [],
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
 
    private setUserArticle(data: UserArticleType[]) {
        const articles: UserArticleBaseType[] = data.map(ar => {
            return {
                articleId: ar.articleId,
                name: ar.article?.name,
                excerpt: ar.article?.excerpt,
                sapNumber: ar.article?.sapNumber,
                articles: 
                    [
                        {
                    invBroj: ar.invBroj,
                    serialNumber: ar.serialNumber,
                    status: ar.status,
                    timestamp: ar.timestamp,
                    userId: ar.userId,
                }
                ]
            }
            }
        )
        this.setState(Object.assign(this.state, {
            userArticle: articles
        }))
    }


    /* KRAJ SET FUNCKIJA */

    render() {
        /* Prije povratne izvršenja returna možemo izvršiti neke provjere */
        /* kraj provjera */
        return (
            /* prikaz klijentu */
            <div>
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
            </div>
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
            <Col lg="2" md="4" sm="6" xs="6" key={category.categoryId}>
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
                /* CategoryTable(this.state.articles) */
                <Tabela data={this.state.articles} />
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

        api('api/userArticle/?filter=article.categoryId||$eq||' + this.props.match.params.categoryID, 'get', {}, 'administrator')
            .then((res: ApiResponse) => {
                if (res.status === 'error') {
                    return this.setErrorMessage('Greška prilikom učitavanja user Article apija. Osvježite ili pokušajte ponovo kasnije')
                }
                /* popunjavamo type kategorije iz responsa */
                this.setUserArticle(res.data)
        })
    }
}/* KRAJ GET I MOUNT FUNKCIJA */