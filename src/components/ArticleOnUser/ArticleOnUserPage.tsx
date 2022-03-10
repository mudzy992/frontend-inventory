import { faListCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import api, { ApiResponse } from '../../API/api';
import {Badge, Card, Col, Container, ListGroup, Row, Tab } from 'react-bootstrap';
import FeaturesType from '../../types/FeaturesType';
import ApiArticleByUserDto from '../../dtos/ApiArticleByUserDto';
import Moment from 'moment';
import { Table, TableContainer, TableHead, TableRow, TableBody, TableCell, Link, TableSortLabel} from "@mui/material";
import ArticleTimelineType from '../../types/ArticleTimelineType';
import Paper from '@mui/material/Paper';
import ArticleByUserType from '../../types/ArticleByUserType';
import { statSync } from 'fs';

interface ArticleOnUserPageProperties {
    match: {
        params: {
            articleId: number;
            serial: string;
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

interface ArticleOnUserPageState {
    message: string;
    article: ArticleByUserType[];
    features: FeatureData[];
    articleTimeline: ArticleTimelineData[];
}


export default class ArticleOnUserPage extends React.Component<ArticleOnUserPageProperties> {
    state: ArticleOnUserPageState;

    constructor(props: Readonly<ArticleOnUserPageProperties>){
        super(props);
        this.state = {
            message : "",
            features: [],
            articleTimeline: [],
            article: []
        }
    }

    private setArticle(articleData: ArticleByUserType[]) {
        this.setState(Object.assign(this.state, {
            article: articleData
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

    componentDidUpdate(oldProperties: ArticleOnUserPageProperties){
        /* Upisujemo logiku koja će se izvršavati nakon update (da se ne osvježava stalno stranica) */
        if(oldProperties.match.params.articleId === this.props.match.params.articleId){
            return;
        }
        this.getArticleData();
    }

    private getArticleData () {
        api('api/article/?filter=articleId||$eq||' + this.props.match.params.articleId + '&join=userArticle&filter=userArticle.serialNumber||$eq||' + this.props.match.params.serial, 'get', {} )
        .then ((res: ApiResponse)=> {
            if (res.status === 'error') {
                this.setFeaturesData([]);
                this.setErrorMessage('Greška prilikom učitavanja kategorije. Osvježite ili pokušajte ponovo kasnije')
                return;
            }

            const data: ArticleByUserType[] = res.data;
            this.setErrorMessage('')
            this.setArticle(data)
            
            const features : FeaturesType[] = [];

            for(const start of data){
                for (const articleFeature of start.articleFeature) {
                    const value = articleFeature.value;
                    let name = '';

                    for (const feature of start.features) {
                        if (feature.featureId === articleFeature.featureId) {
                            name = feature.name;
                            break;
                        }
                    }

                    features.push({ name, value });
                }
            }
            this.setFeaturesData(features);

            const articleTimeline : ArticleTimelineType[] = [];
            
            for(const start of data){
                for (const statusRespon of start.userArticle) {
                    let sapNumber = start.sapNumber;
                    let surname = '';
                    let forname = '';
                    let comment = '';
                    let status = '';
                    let serialNumber = '';
                    let timestamp = '';
                    if(statusRespon.articleId === start.articleId)
                        {
                        status = statusRespon.status;
                        comment = '';
                        serialNumber = statusRespon.serialNumber;
                        timestamp = statusRespon.timestamp;
                        for(const user of start.userDetails) {
                            if(statusRespon.userId === user.userId) {
                                surname = user.surname;
                                forname = user.forname;
                            }
                        }
                    }
                    articleTimeline.push({surname, forname, status, comment, serialNumber, sapNumber, timestamp})
                }
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
                    <Card.Header >
                        <Card.Title style={{display:"flex", justifyContent:"start", }}>
                            <FontAwesomeIcon style={{marginRight:5}} icon={faListCheck}/>{
                                this.state.article ?
                                this.state.article.map :
                                'Article not found'
                            }
                            {this.state.article.map(ar => (ar.name))} 
                            {this.badgeStatus(this.state.article)} 
                        </Card.Title>
                    </Card.Header>
                <Card.Body>
                    <Card.Text>
                    { this.printOptionalMessage() }

                        {
                            this.state.article ?
                            ( this.renderArticleData(this.state.article) ) :
                            ''
                        } 
                    </Card.Text>
                </Card.Body>
                </Card>
            </Container>
        )
    }

    private badgeStatus(article:ArticleByUserType[]){
        let stat = ""
        article.map(ua => (ua.userArticle.map(status => (stat = status.status))))

        if(stat === "zaduženo") {
            return(
            <Badge pill bg="success" style={{marginLeft:10, alignItems:"center", display:"flex", fontSize:12}}>
            {stat}
            </Badge>)
        }
        if(stat === "razduženo") {
            return (
            <Badge pill bg="warning" text="dark" style={{marginLeft:10, alignItems:"center", display:"flex", fontSize:12}}>
                {stat}
            </Badge>)
        }
        if(stat === "otpisano") {
            return (
            <Badge pill bg="danger" style={{marginLeft:10, alignItems:"center", display:"flex", fontSize:12}}>
                {stat}
            </Badge>)
        }

    }

    renderArticleData(article: ArticleByUserType[]) {
        return (
            <Row>
                <Col xs="12" lg="8">
                    <Row>
                        <Col xs="12" lg="4" sm="4" style={{justifyContent:'center', alignItems:"center", display:"flex"}}>
                            <i className={`${article.map(cat => (cat.category.imagePath))}`} style={{fontSize: 150}}></i>
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
                                 <Card.Body style={{borderRadius:"0 0 calc(.25rem - 1px) calc(.25rem - 1px)", background:"white", color:"black"}}>{ article.map(desc => (desc.description)) }</Card.Body>
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
                    <Card bg="success" text="white" className="mb-2">
                            <Card.Header>Detalji korisnika</Card.Header>

                            <ListGroup variant="flush" >
                                {article.map(propUser => (propUser.userDetails.map(user => (
                                    <><ListGroup.Item>Ime: {user.surname}</ListGroup.Item>
                                    <ListGroup.Item>Prezime: {user.forname}</ListGroup.Item>
                                    <ListGroup.Item>Email: {user.email}</ListGroup.Item>
                                    <ListGroup.Item>Sektor: {user.department}</ListGroup.Item>
                                    <ListGroup.Item>Radno mjest: {user.jobTitle}</ListGroup.Item>
                                    <ListGroup.Item>Lokacija: {user.location}</ListGroup.Item>
                                    </> 
                                 ))))}
                            </ListGroup>
                        </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Card bg="light" text="dark" className=" mb-2">
                                <Card.Header>Status</Card.Header>
                                    <ListGroup variant="flush">
                                    {article.map(uaStat => (uaStat.userArticle.map(stat => (
                                        <>
                                        <ListGroup.Item>Status: <b>{stat.status} </b></ListGroup.Item>
                                        <ListGroup.Item>Datum zaduženja: {Moment(stat.timestamp).format('DD.MM.YYYY. - HH:mm')}</ListGroup.Item>
                                        </> 
                                    ))))}
                                    </ListGroup>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Card className="text-dark bg-light mb-2" >
                                <Card.Header>U skladištu</Card.Header>
                                <ListGroup variant="flush" >
                                    {article.map(artStock => (
                                        artStock.articlesInStock.map(arStock => (
                                        <><ListGroup.Item>Stanje po ugovoru: {arStock.valueOnConcract}</ListGroup.Item>
                                        <ListGroup.Item>Trenutno stanje: {arStock.valueAvailable}</ListGroup.Item>
                                        <ListGroup.Item>SAP broj: {arStock.sapNumber}</ListGroup.Item>
                                        <ListGroup.Item>Stanje na: {Moment(arStock.timestamp).format('DD.MM.YYYY. - HH:mm')}</ListGroup.Item>
                                        </> 
                                    ))
                                    ))
                                    }   
                                </ListGroup>
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}
