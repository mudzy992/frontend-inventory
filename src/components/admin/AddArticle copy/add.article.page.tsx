import React from 'react';
import { Container, Card, Row, Col,} from 'react-bootstrap';
import api, { ApiResponse } from '../../../API/api';
import ArticleType from '../../../types/ArticleType';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { List, ListItemButton, ListItemIcon, ListItemText, ListSubheader, Paper } from '@mui/material';
import { Link } from 'react-router-dom';

interface AddArticlePageState{
    articles: ArticleType[];
    message: string;
    addArticle: {
        name: string;
        categoryId: number;
        excerpt: string;
        description: string;
        concract: string;
        comment: string;
        sap_number: string;
    }
}
export default class AddArticlePage extends React.Component<{}>{
    state: AddArticlePageState;
    constructor(props: Readonly<{}>) {
        super(props);
        this.state = {
            articles: [],
            message: '',
            addArticle: {
                name: '',
                categoryId: 1,
                excerpt: '',
                description: '',
                concract: '',
                comment: '',
                sap_number: '',
            }
        }
    }
    
    componentDidMount() {
        this.getArticle()
    }
    /* SET */
    private setArticles(articleData: ArticleType[] | undefined){
        this.setState(Object.assign(this.state, {
            articles: articleData
        }))
    }
    private setErrorMessage(message: string) {
        this.setState(Object.assign(this.state, {
            message: message,
        }));
    }
    /* Kraj SET */
    /* GET */
    private getArticle() {
        api('api/article/', 'get', {}, 'administrator')
        .then((res: ApiResponse) => {
            if(res.status === 'error') {
                this.setArticles(undefined)
                this.setErrorMessage('aGreška prilikom učitavanja artikala. Osvježite ili pokušajte ponovo kasnije')
            }
            this.setArticles(res.data)
        })
    }
    /* Kraj GET */
    /* Dodatne funkcije */
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
    /* Kraj dodatnih funkcija */
    render() {
        return(
            <div>
            <RoledMainMenu role='administrator'/>
            <Container style={{ marginTop:15}}> 
            {this.printOptionalMessage()}
                {
                    this.state.articles ?
                        (this.renderArticleData(this.state.articles)) :
                        ''
                }{}
            </Container>
            </div>
        )
    }

    private TableContent() {
        const columns = [{
            dataField: 'userId',
            text: '#',
            formatter: (row: any) => (
                <div style={{ justifyContent: 'center', display: 'flex' }}>
                    <a href={`#/admin/userProfile/${row}`} className="btn btn-primary btn-sm" role="button" aria-pressed="true"> <i className="bi bi-person-fill"/> Profil</a>
                </div>
            )
        },
        {
            dataField: 'name',
            text: 'Naziv ',
            sort: true,
            filter: textFilter(),
            formatter: (row: any) => (
                <div>
                    <i className="bi bi-arrow-down"/> {`${row}`}
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
            <div>
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
            </div>
        )
    }

    renderArticleData(article: ArticleType[]) {
        return(
            <Row>
            <Col xs ="12" lg="12">
                <Row>
                    <Col xs="12" lg="3" sm="12">
                       <Paper>
                        <List>
                            <ListSubheader>Admin menu</ListSubheader>
                            <ListItemButton>
                                <ListItemIcon><i className="bi bi-stack"/></ListItemIcon>
                                <Link to="" style={{textDecoration: 'none'}}><ListItemText primary="Dodaj opremu"/></Link>
                            </ListItemButton>
                            <ListItemButton>
                                <ListItemIcon><i className="bi bi-people-fill"/></ListItemIcon>
                                <Link to="" style={{textDecoration: 'none'}}><ListItemText primary="Korisnici"/></Link>
                            </ListItemButton>
                            <ListItemButton >
                                <ListItemIcon><i className="bi bi-journal-text"/></ListItemIcon>
                                <Link to="" style={{textDecoration: 'none'}}><ListItemText primary="Dokumenti"/></Link>
                            </ListItemButton>
                        </List>
                    </Paper> 
                    </Col>
                    <Col style={{marginTop:5}} xs="12" lg="9" sm="12">
                        <Paper>
                            {this.TableContent()}
                        </Paper>
                    </Col>
                </Row>
            </Col>
        </Row>
        )
    }
}