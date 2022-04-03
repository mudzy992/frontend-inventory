import React from 'react';
import { Button, Card, Col, Container, FloatingLabel, Form, Row } from 'react-bootstrap';
import { List, ListItemButton, ListItemIcon, ListItemText, ListSubheader, Paper } from '@mui/material';
import { Link } from 'react-router-dom';

export default class AddFeaturePage extends React.Component<{}> {
    constructor(props: Readonly<{}>) {
        super(props);
    }

    render() {
        return(
            <Col xs="12" lg="3" sm="12">
                <Paper>
                    <List>
                        <ListSubheader><i className="bi bi-star-fill" /> Admin menu</ListSubheader>                        <Link to="/admin/article/" style={{textDecoration: 'none'}}>
                            <ListItemButton>
                                <ListItemIcon style={{fontSize:20}}><i className="bi bi-stack"/></ListItemIcon>
                                <ListItemText primary="Nova oprema"/>
                            </ListItemButton>
                        </Link>
                        <Link to="/admin/feature/" style={{textDecoration: 'none'}}>
                            <ListItemButton >
                                <ListItemIcon style={{fontSize:20}}><i className="bi bi-list-stars"/></ListItemIcon>
                                <ListItemText primary="Nova osobina kategorije"/>
                            </ListItemButton>
                        </Link>
                        <Link to="/admin/category/" style={{textDecoration: 'none'}}>
                            <ListItemButton>
                                <ListItemIcon style={{fontSize:20}}><i className="bi bi-card-checklist"/></ListItemIcon>
                                <ListItemText primary="Nova kategorija"/>
                            </ListItemButton>
                        </Link>
                        <Link to="/admin/user/" style={{textDecoration: 'none'}}>
                            <ListItemButton>
                                <ListItemIcon style={{fontSize:20}}><i className="bi bi-person-plus-fill"/></ListItemIcon>
                                <ListItemText primary="Novi korisnik"/>
                            </ListItemButton>
                        </Link>
                        <Link to="/admin/document/" style={{textDecoration: 'none'}}>
                            <ListItemButton >
                                <ListItemIcon style={{fontSize:20}}><i className="bi bi-journal-text"/></ListItemIcon>
                                <ListItemText primary="Novi dokument"/>
                            </ListItemButton>
                        </Link>
                    </List>
                </Paper> 
            </Col>
        )
    }
}