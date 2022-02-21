import axios from 'axios';
import React from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import api from '../../../API/api';

export default class TestPage extends React.Component {
    private testFunkcija () {
        api(
            'api/article',
            'get',
            {}
        )
    }

    componentDidMount(){
        this.testFunkcija()
    }

    render(){
        return(
            <ListGroup>
                <ListGroupItem></ListGroupItem>
            </ListGroup>
        )
    }
}