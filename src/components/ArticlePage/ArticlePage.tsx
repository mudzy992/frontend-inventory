import { faListCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import api, { ApiResponse } from '../../API/api';
import {Badge, Card, Col, Container, ListGroup, Row, Tab } from 'react-bootstrap';
import FeaturesType from '../../types/FeaturesType';
import ApiArticleDto from '../../dtos/ApiArticleDto';
import Moment from 'moment';
import { Table, TableContainer, TableHead, TableRow, TableBody, TableCell, Link, TableSortLabel} from "@mui/material";
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
            <Container  style={{marginTop:15}}>
                <Card className="text-white bg-dark">
                    <Card.Header >
                        <Card.Title style={{display:"flex", justifyContent:"start", }}>
                            <FontAwesomeIcon style={{marginRight:5}} icon={faListCheck}/>{
                                this.state.articles ?
                                this.state.articles?.name :
                                'Article not found'
                            }
                            {this.badgeStatus()}
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

    private badgeStatus(){
        
        let status = 0;
        this.state.articles?.articlesInStock.map(stat => (
            status = stat.valueAvailable
        ))
        if(status === 0) {
            return (
            <Badge pill bg="danger" style={{marginLeft:10, alignItems:"center", display:"flex", fontSize:12}}>
               nema na stanju
            </Badge>)
        }
        if(status > 0) {
            return (
            <Badge pill bg="success" style={{marginLeft:10, alignItems:"center", display:"flex", fontSize:12}}>
                dostupno
            </Badge>)
        }
        
    }
    

    renderArticleData(article: ApiArticleDto) {
        return (
            <Row>
                <Col xs="12" lg="8">
                    <Row>
                        <Col xs="12" lg="4" sm="4" style={{justifyContent:'center', alignItems:"center", display:"flex"}}>
                            <i className={`${article.category?.imagePath}`} style={{fontSize: 150}}></i>
                            </Col>
                        <Col xs="12" lg="8" sm="8"> 
                            <Card bg="dark" text="light" className="mb-3">
                                <Card.Header>Detalji opreme</Card.Header>
                                <ListGroup variant="flush" >
                                    { this.state.features.map(feature => (
                                        <ListGroup.Item>
                                            <b>{ feature.name }:</b> { feature.value }
                                        </ListGroup.Item>
                                    ), this) }
                                </ListGroup>
                            </Card>
                        </Col>
                    </Row>

                    <Row>
                        <Col xs="12" lg="12" sm="12">
                        <Card bg="dark" text="light" className="mb-3">
                                <Card.Header>Detaljan opis</Card.Header>
                                <Card.Body style={{borderRadius:"0 0 calc(.25rem - 1px) calc(.25rem - 1px)", background:"white", color:"black"}}>{ article.description }</Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <Row>
                        <Col>
                        <Card className="mb-3">
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
                        </Card>
                        </Col>
                    </Row>
                </Col>
                <Col sm="12" xs="12" lg="4" >
                    <Row>
                        <Col>
                            <Card className="text-dark bg-light mb-2" >
                                <Card.Header>U skladištu</Card.Header>
                                <ListGroup variant="flush" >
                                    {this.state.articles?.articlesInStock.map(arStock => (
                                        <><ListGroup.Item>Stanje po ugovoru: {arStock.valueOnConcract}</ListGroup.Item>
                                        <ListGroup.Item>Trenutno stanje: {arStock.valueAvailable}</ListGroup.Item>
                                        <ListGroup.Item>SAP broj: {arStock.sapNumber}</ListGroup.Item>
                                        <ListGroup.Item>Stanje na: {Moment(arStock.timestamp).format('DD.MM.YYYY. - HH:mm')}</ListGroup.Item>
                                        </> 
                                    ), this)}  
                                </ListGroup>
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}
