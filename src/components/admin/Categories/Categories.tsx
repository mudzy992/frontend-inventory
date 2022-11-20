import { Alert } from '@mui/material';
import React from 'react';
import { Card, Col, Row, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api, { ApiResponse } from '../../../API/api';
import ArticleType from '../../../types/ArticleType';
import CategoryType from '../../../types/CategoryType';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import TableFunction from './TableFunction';

interface CategoryPageProperties {
    match: {
        params: {
            categoryID: number;
        }
    }
}

interface UserArticleBaseDetailsType {
    articleId?: number;
    name?: string;
    concract?: string;
    sapNumber?: string;
    articlesInStock?: {
        valueOnConcract: number;
        valueAvailable: number;
    };
    userArticles?: {
        invBroj?: string;
        serialNumber?: string;
        status?: string;
        timestamp?: string;
        userId?: number;
    }[]  
}

interface CategoryPageState {
    category?: CategoryType; 
    subCategory?: CategoryType[]; 
    message: string;
    articles: ArticleType[];
    userArticle: UserArticleBaseDetailsType[];
}


interface CategoryDto {
    categoryId: number;
    name: string;
    imagePath: string;
}

export default class CategoryPage extends React.Component<CategoryPageProperties> {
    state: CategoryPageState;
    constructor(props: Readonly<CategoryPageProperties>) {
        super(props);
        this.state = {
            userArticle:[],
            articles:[],
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
            articles: articles,
        }))
    }

    private setUserArticle(data: UserArticleBaseDetailsType[]) {
        this.setState(Object.assign(this.state, {
            userArticle: data,
        }))
    }
  

    /* KRAJ SET FUNCKIJA */

    render() {
        return (
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
            <TableFunction data={this.state.userArticle} />
        );
    }

    /* GET I MOUNT FUNKCIJE ĆEMO DEFINISATI ISPOD RENDERA */
    componentDidMount() {
        this.getCategoriesData()
    }

    componentDidUpdate(oldProperties: CategoryPageProperties) {
        if (oldProperties.match.params.categoryID === this.props.match.params.categoryID) {
            return;
        }
        this.getCategoriesData();
    }

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

        api('/api/article/?filter=categoryId||$eq||' + this.props.match.params.categoryID, 'get', {}, 'administrator')
            .then((res: ApiResponse) => {
                if (res.status === 'error') {
                    return this.setErrorMessage('Greška prilikom učitavanja user Article apija. Osvježite ili pokušajte ponovo kasnije')
                }
                this.setArticles(res.data)
        })


        api('/api/article/?filter=categoryId||$eq||' + this.props.match.params.categoryID + '/?sort=userArticles.timestamp,DESC', 'get', {}, 'administrator')
            .then((res: ApiResponse) => {
                if (res.status === 'error') {
                    return this.setErrorMessage('Greška prilikom učitavanja user Article apija. Osvježite ili pokušajte ponovo kasnije')
                }
                this.setUserArticle(res.data)

        })
    }
}/* KRAJ GET I MOUNT FUNKCIJA */