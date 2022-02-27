import { faListAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import api, { ApiResponse } from '../../API/api';
import { Button, Card, Col, Container, ListGroup, ListGroupItem, Row } from 'react-bootstrap';
import ArticleType from '../../types/ArticleType';
import FeaturesType from '../../types/FeaturesType';
import { Alert } from '@mui/material';

interface ArticlePageProperties {
    match: {
        params: {
            articleID: number;
        }
    }
}

interface ArticlePageState {
    message: string;
    articles: ArticleType;
    features?: FeaturesType[];
    featuresData?: FeaturesType[];
}

interface articleFeaturesDto {
    name: string;
    value: string; 
    
}

export default class ArticlePage extends React.Component<ArticlePageProperties> {
    state: ArticlePageState;

    constructor(props: Readonly<ArticlePageProperties>){
        super(props);
        this.state = {
            message : "",
            articles: {}
        }
    }

    private setArticles(articles: ArticleType) {
        this.setState(Object.assign(this.state, {
            articles: articles
        }))
    }

    private setArticleFeatures(articleFeatures: FeaturesType[]) {
        this.setState(Object.assign(this.state, {
            features: articleFeatures
        }))
    }

    private setFeaturesData(featuresData: FeaturesType[]) {
        this.setState(Object.assign(this.state, {
            featuresData: featuresData
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
                return this.setErrorMessage('Greška prilikom učitavanja kategorije. Osvježite ili pokušajte ponovo kasnije')
            }
            const articleData: ArticleType = {
                articleId: res.data.articleId,
                name: res.data.name,
                excerpt: res.data.excerpt,
                description: res.data.description,
                comment: res.data.comment,
                sapNumber: res.data.sapNumber,
                categoryName: res.data.category.name,
            }
            this.setArticles(articleData)    
        })
        /* api('api/feature/?join=articleFeature&filter=articleFeature.articleId||$eq||' + this.props.match.params.articleID, 'get', {} ) */
        api('api/article/' + this.props.match.params.articleID, 'get', {} )
        .then ((res: ApiResponse) => {
            const articleFeaturesData: FeaturesType[] = 
            (res.data.features.map((articleFeature: articleFeaturesDto) => {
                const object: FeaturesType = {
                    name: articleFeature.name,
                }
                return object;
            })
            )

            this.setArticleFeatures(articleFeaturesData)

             const featureData: FeaturesType[] =
            res.data.articleFeature.map((articleFeature: articleFeaturesDto) => {
                return {
                    value: articleFeature.value,
                }
            });

            this.setFeaturesData(featureData); 
        })
        
  }

    render(){
        return(
            <Container style={{marginTop:15}}>
                <Card className="text-white bg-dark">
                    <Card.Header>
                        <Card.Title>
                            <FontAwesomeIcon icon={faListAlt}/> Artikli
                        </Card.Title>
                    </Card.Header>
                <Card.Body>
                    <Card.Text>
                        { this.printErrorMessage () }
                        { this.singleArticle(this.state.articles) }
                        {console.log(this.state.articles)}
                        { this.showArticleFeatures() } 
                    </Card.Text>
                </Card.Body>
                
                </Card>
            </Container>
        )
    }

    private printErrorMessage() {
        if(this.state.message === "") {
            return;
        }
        return (
            <Alert severity="error"
                    style={{marginTop:15}}
                    className={ this.state.message ? '' : 'd-none' }>
                    { this.state.message }
            </Alert>
        )
    } 

    private singleArticle(article: ArticleType){
        return(
            /* Ono kako želimo da prikažemo kategoriju (dizajn) */
            <Col lg="4" md="6" sm="6" xs="12">
                <Card className="text-dark bg-light mb-3">
                    <Card.Img variant="top" src="" className="w-100"/>
                        <Card.Body>
                            <Card.Title>
                                {article.name}
                            </Card.Title>
                            <ListGroup className="list-group-flush">
                                <ListGroupItem> <strong>Excerpt:</strong> {article.excerpt}</ListGroupItem>
                                <ListGroupItem> <strong>Excerpt:</strong> {article.description}</ListGroupItem>
                                <ListGroupItem> <strong>Excerpt:</strong> {article.comment}</ListGroupItem>
                                <ListGroupItem> <strong>Excerpt:</strong> {article.categoryName}</ListGroupItem>
                                <ListGroupItem> <strong>Excerpt:</strong> {article.sapNumber}</ListGroupItem>
                            </ListGroup>
                        </Card.Body>
                    <Card.Footer>
                        Footer
                    </Card.Footer>  
                </Card>
            </Col>
        )
    }

    private showArticleFeatures() {
        if (this.state.features?.length === 0) {
            return (
                <div>There are now articles in this category.</div>
            )
        }
        return (
            <Row>
                { this.state.features?.map(this.singleFeatures) }
                { this.state.featuresData?.map(this.singleValueFeatures) }
            </Row>

        );
    } 

    private singleFeatures(features: FeaturesType){
        return(
            /* Ono kako želimo da prikažemo kategoriju (dizajn) */
            <Col lg="4" md="6" sm="6" xs="12">
                <Card className="text-dark bg-light mb-3">
                    <Card.Img variant="top" src="" className="w-100"/>
                        <Card.Body>
                            <ListGroup className="list-group-flush">
                                <ListGroupItem> <strong>Name:</strong> {features.name}</ListGroupItem>
                            </ListGroup>
                        </Card.Body>
                    <Card.Footer>
                    </Card.Footer>  
                </Card>
            </Col>
        )
    }
    private singleValueFeatures(featureValue: FeaturesType){
        return(
            /* Ono kako želimo da prikažemo kategoriju (dizajn) */
            <Col lg="4" md="6" sm="6" xs="12">
                <Card className="text-dark bg-light mb-3">
                    <Card.Img variant="top" src="" className="w-100"/>
                        <Card.Body>
                            <ListGroup className="list-group-flush">
                                <ListGroupItem> <strong>Value:</strong> {featureValue.value}</ListGroupItem>
                            </ListGroup>
                        </Card.Body>
                    <Card.Footer>
                    </Card.Footer>  
                </Card>
            </Col>
        )
    } 
}
