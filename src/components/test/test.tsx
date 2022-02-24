import { faListAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Button, Card, Col, Container, ListGroup, ListGroupItem, Row } from 'react-bootstrap';
import api, { ApiResponse } from '../../API/api';
import ArticleType from '../../types/ArticleType';


interface TestPageState {
    articles: ArticleType[];
}

interface ArticleDto {
    articleId: number;
    name: string;
    excerpt: string;
    description: string;
}


export default class TestPage extends React.Component {
    state: TestPageState;

    constructor(props: Readonly<{}>){
        super(props);
        this.state = {
            articles: []
        }
    }

    render(){
        return(
            <Container>
                <Card className="text-white bg-dark">
                    <Card.Header>
                        <Card.Title>
                            <FontAwesomeIcon icon={faListAlt}/>
                        </Card.Title>
                    </Card.Header>
                <Card.Body>
                    <Card.Text>
                        { this.showArticles() }
                    </Card.Text>
                </Card.Body>
                
                </Card>
            </Container>
        )
    }

    private showArticles() {
        if (this.state.articles?.length === 0) {
            return (
                <div>There are now articles in this category.</div>
            )
        }
        return (
            <Row>
                { this.state.articles?.map(this.singleArticle) }
            </Row>
        );
    }

    private singleArticle(artikal: ArticleType){
        return(
            /* Ono kako želimo da prikažemo kategoriju (dizajn) */
            <Col lg="4" md="6" sm="6" xs="12">
                <Card className="text-dark bg-light mb-3">
                    <Card.Img variant="top" src="" className="w-100"/>
                        <Card.Body>
                            <Card.Title>
                                {artikal.name}
                            </Card.Title>
                            <ListGroup className="list-group-flush">
                                <ListGroupItem key={artikal.articleId}> <strong>Excerpt:</strong> {artikal.excerpt}</ListGroupItem>
                            </ListGroup>
                        </Card.Body>
                    <Card.Footer>
                        <Button href={`/article/${artikal.articleId}`} variant="outlined" > Više detalja</Button>
                    </Card.Footer>  
                </Card>
            </Col>
        )
    }

    componentDidMount(){
        this.testFunkcija()
    }

    private testFunkcija () {
        api(
            'api/article',
            'get',
            {}
        )
        .then ((res: ApiResponse) => {
            this.putArticlesInState(res.data)
    })
  }

  private putArticlesInState(data: ArticleDto[]){
      const articles: ArticleType[] = data.map(article => {
          return {
              articleId: article.articleId,
              name: article.name,
              excerpt: article.excerpt,
              description: article.description,
          }
      })

      const newState = Object.assign(this.state, {
          articles : articles
      })
      this.setState(newState)
  }
}