import { faListCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import api, { ApiResponse } from '../../API/api';
import {Card, Col, Container, Row } from 'react-bootstrap';
import FeaturesType from '../../types/FeaturesType';
import ApiArticleDto from '../../dtos/ApiArticleDto';
import Moment from 'moment';
import { Alert, Table, TableContainer, TableHead, TableRow, TableBody, TableCell, Link, TableSortLabel} from "@mui/material";
import ArticleTimelineType from '../../types/ArticleTimelineType';
import Paper from '@mui/material/Paper';

interface ArticlePageProperties {
    match: {
        params: {
            articleID: number;
        }
    }
}

interface FeatureData {
    name: string;
    value: string;
}

interface ArticleTimelineData {
    surname: string;
    forname: string;
    name: string;
    status: string;
    comment: string;
    serialNumber: string;
    sapNumber: string;
    timestamp: string;
}

interface ArticlePageState {
    message: string;
    articles?: ApiArticleDto;
    features: FeatureData[];
    articleTimeline: ArticleTimelineData[];
}


export default class ArticlePage extends React.Component<ArticlePageProperties> {
    state: ArticlePageState;

    constructor(props: Readonly<ArticlePageProperties>){
        super(props);
        this.state = {
            message : "",
            features: [],
            articleTimeline: []
        }
    }

    private setArticles(articleData: ApiArticleDto | undefined) {
        this.setState(Object.assign(this.state, {
            articles: articleData
        }))
    }

    private setFeaturesData(featuresData: FeaturesType[]) {
        this.setState(Object.assign(this.state, {
            features: featuresData
        }))
    }

    private setArticleTimelineData(articleTimelineData: ArticleTimelineType[]) {
        this.setState(Object.assign(this.state, {
            articleTimeline: articleTimelineData
        }))
    }

    private setErrorMessage(message: string) {
        this.setState(Object.assign(this.state, {
            message: message,
        }));
    }

    componentDidMount(){
        this.getArticleData()
    }

    componentDidUpdate(oldProperties: ArticlePageProperties){
        /* Upisujemo logiku koja će se izvršavati nakon update (da se ne osvježava stalno stranica) */
        if(oldProperties.match.params.articleID === this.props.match.params.articleID){
            return;
        }
        this.getArticleData();
    }

    private getArticleData () {
        api('api/article/' + this.props.match.params.articleID, 'get', {} )
        .then ((res: ApiResponse)=> {
            if (res.status === 'error') {
                this.setArticles(undefined);
                this.setFeaturesData([]);
                this.setErrorMessage('Greška prilikom učitavanja kategorije. Osvježite ili pokušajte ponovo kasnije')
                return;
            }

            const data: ApiArticleDto = res.data;
            this.setErrorMessage('')
            this.setArticles(data)
            
            const features : FeaturesType[] = [];

            for (const articleFeature of data.articleFeature) {
                const value = articleFeature.value;
                let name = '';

                for (const feature of data.features) {
                    if (feature.featureId === articleFeature.featureId) {
                        name = feature.name;
                        break;
                    }
                }

                features.push({ name, value });
            }
            this.setFeaturesData(features);

            const articleTimeline : ArticleTimelineType[] = [];
            
            for (const statusRespon of data.userArticle) {
                let sapNumber = data.sapNumber;
                let surname = '';
                let forname = '';
                let comment = '';
                let status = '';
                let serialNumber = '';
                let timestamp = '';
                if(statusRespon.articleId === data.articleId)
                    {
                    status = statusRespon.status;
                    comment = '';
                    serialNumber = statusRespon.serialNumber;
                    timestamp = statusRespon.timestamp;
                    for(const user of data.userDetails) {
                        if(statusRespon.userId === user.userId) {
                            surname = user.surname;
                            forname = user.forname;
                        }
                    }
                }
                articleTimeline.push({surname, forname, status, comment, serialNumber, sapNumber, timestamp})
            }
            this.setArticleTimelineData(articleTimeline)
        })
        /* Poseban api za sortiranje po timestampu */
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

    render(){
        return(
            <Container style={{marginTop:15}}>
                <Card className="text-white bg-dark">
                    <Card.Header>
                        <Card.Title>
                            <FontAwesomeIcon icon={faListCheck}/> {
                                this.state.articles ?
                                this.state.articles?.name :
                                'Article not found'
                            }
                        </Card.Title>
                    </Card.Header>
                <Card.Body>
                    <Card.Text>
                    { this.printOptionalMessage() }

                        {
                            this.state.articles ?
                            ( this.renderArticleData(this.state.articles) ) :
                            ''
                        }
                    </Card.Text>
                </Card.Body>
                </Card>
            </Container>
        )
    }

    renderArticleData(article: ApiArticleDto) {
        return (

            <Row>
                <Col xs="12" lg="8">
                    <div className="excerpt">
                        { article.excerpt }
                    </div>

                    <hr />
                    
                    <div className="description">
                        { article.description }
                    </div>

                    <hr />

                    <b>Detalji opreme:</b><br />

                    <ul>
                        { this.state.features.map(feature => (
                            <li>
                                { feature.name }: { feature.value }
                            </li>
                        ), this) }
                    </ul>
                    <div>
                    <>
                    <b>Kretanje opreme</b><br />
                    <TableContainer style={{maxHeight:300, overflowY: 'auto'}} component={Paper}>
                        <Table sx={{ minWidth: 700}} stickyHeader aria-label="sticky table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Korisnik</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Komentar</TableCell>
                                    <TableCell>Serijski broj</TableCell>
                                    <TableCell>SAP broj</TableCell>
                                    <TableCell sortDirection='desc'>Datum i vrijeme akcije</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {this.state.articleTimeline?.map(articleTimeline => (
                                    <TableRow hover>
                                        <TableCell>{articleTimeline.surname} {articleTimeline.forname}</TableCell>
                                        <TableCell>{articleTimeline.status}</TableCell>
                                        <TableCell>{articleTimeline.comment}</TableCell>
                                        <TableCell>{articleTimeline.serialNumber}</TableCell>
                                        <TableCell>{articleTimeline.sapNumber}</TableCell>
                                        <TableCell >{Moment(articleTimeline.timestamp).format('DD.MM.YYYY. - HH:mm')}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
            </> 
                    </div>
                </Col>
                <Col xs="12" lg="4" style={{padding:20}}>
                    <Row>
                        <Card className="text-dark bg-light mb-3">
                            <Card.Title style={{marginTop:10}}>
                            Detalji korisnika:
                            </Card.Title>
                            <Card.Body>
                                <ul>
                                {this.state.articles?.userDetails.map(user => (
                                    <><li>Ime: {user.surname}</li>
                                    <li>Prezime: {user.forname}</li>
                                    <li>Email: {user.email}</li>
                                    <li>Sektor: {user.department}</li>
                                    <li>Radno mjest: {user.jobTitle}</li>
                                    <li>Lokacija: {user.location}</li>
                                    <hr />
                                    </> 
                                ), this)}
                                    </ul>
                            </Card.Body>
                        </Card>
                    </Row>

                    <Row>
                    <Card className="text-dark bg-light mb-3">
                            <Card.Title style={{marginTop:10}}>
                            Status:
                            </Card.Title>
                            <Card.Body>
                                <ul>
                                {this.state.articles?.responsibility.map(userArticles => (
                                    <>
                                    <li>Količina: {userArticles.value}</li>
                                    <li>Status: <b>{userArticles.status} </b></li>
                                    <li>Datum zaduženja: {Moment(userArticles.timestamp).format('DD.MM.YYYY. - HH:mm')}</li>
                                    <hr />
                                    </> 
                                ), this)}
                                    </ul>
                            </Card.Body>
                        </Card>
                    </Row>
                </Col>
            </Row>
        );
    }
}
