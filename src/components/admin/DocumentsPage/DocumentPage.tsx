import React from 'react';
import { ApiConfig } from "../../../config/api.config";
import api, { ApiResponse } from '../../../API/api';
import DocumentsType from '../../../types/DocumentsType';
import { Redirect } from 'react-router-dom';
import { Button, Container, Menu, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';


/* Obavezni dio komponente je state (properties nije), u kome definišemo konačno stanje komponente */

interface DocumentsPageState {
    isLoggedIn: boolean;
    message: string;
    documents: DocumentsType[];
    anchorEl: null,
    openedMenuId: number | null;
}

/* U većini slučajeva će biti potrebno napraviti DataTransferObjekat koji će raditi sa podacima,
gdje ćemo definisati da je neka veza primjerak tog DTO-a*/



/* Ova komponenta je proširena da se prikazuje na osnovu parametara koje smo definisali iznad */
export default class DocumentsPage extends React.Component<{}> {
    state: DocumentsPageState ;

    constructor(props: Readonly<{}>){
        super(props);
        this.state = {
            message: '',
            isLoggedIn: true,
            documents: [],
            anchorEl: null,
            openedMenuId: null,
        }
    }

    /* SET FUNKCIJE ĆEMO DEFINISATI PRIJE RENDERA */

    private setLogginState(isLoggedIn: boolean) {
        const newState = Object.assign(this.state, {
            isLoggedIn: isLoggedIn,
        });

        this.setState(newState);
    }

    private setErrorMessage(message: string) {
        this.setState(Object.assign(this.state, {
            message: message,
        }));
    }

    private setDocumentsData(documentsData: DocumentsType[]) {
        this.setState(Object.assign(this.state, {
            documents: documentsData
        }))
    }

    handleClick = (event: { currentTarget: any; }, documentsId: number) => {
        this.setState({
            anchorEl: event.currentTarget,
            openedMenuId: documentsId, 
        });
    };
    
    handleClose = () => {
        this.setState({ anchorEl: null, openedMenuId: null });
    };

    handleFileUpload(event: React.ChangeEvent<HTMLInputElement>, documentId: number): void {
        const file = event.target.files && event.target.files[0];
    
        if (file) {
            // Implementirajte logiku za poziv servisa za prijenos datoteke
            api(`api/document/${documentId}/upload`, 'post', file, 'administrator')
                .then((res: ApiResponse) => {
                    // Obradite odgovor ako je potrebno
                })
                .catch((error) => {
                    console.error(error);
                    // Obradite grešku ako je potrebno
                });
        }
        this.handleClose();
    }
    

    /* KRAJ SET FUNCKIJA */

    render() {
        if (this.state.isLoggedIn === false) {
            return (
                <Redirect to="/admin/login" />
            );
        }
        return(
            <><RoledMainMenu role='administrator' />
            <Container style={{ marginTop: 15 }}>     
                <TableContainer style={{ maxHeight: 500, overflowY: 'auto' }} component={Paper}>
                    <Table sx={{ minWidth: 700 }} stickyHeader aria-label="sticky table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Artikal</TableCell>
                                <TableCell>Serijski broj</TableCell>
                                <TableCell>Inventurni broj</TableCell>
                                <TableCell>Korisnik</TableCell>
                                <TableCell>Datum akcije</TableCell>
                                <TableCell>Dokument</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.tableRowData(this.state.documents)}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Container></>
        )
    }

    /* GET I MOUNT FUNKCIJE ĆEMO DEFINISATI ISPOD RENDERA */
    componentDidMount(){
        this.getDocumentsData()
    }

    componentDidUpdate(){
        /* Upisujemo logiku koja će se izvršavati nakon update (da se ne osvježava stalno stranica) */
    }

    /* Funkcija za dopremanje podataka, veza sa api-jem  
    api u većini slučajeva traži povratnu informaciju 3 parametra
    api('1', '2', '3'){} 
    1. ruta (provjeriti u backend), 
    2. method (onaj koji definišemo u api da koristimo get, post, patch, delete, update..) 
    3. body (ako je get tj. prazan body stavljamo {} a ako nije unutar {definišemo body}) */
    private getDocumentsData () {
        api('api/document/', 'get', { }, 'administrator' )
        .then((res: ApiResponse ) => {
            if (res.status === 'login') {
                this.setLogginState(false);
                this.setErrorMessage('Greška prilikom učitavanja dokumenata')
                return
            }

            const documents: DocumentsType[] = res.data;
            this.setDocumentsData(documents)
        }) 
    }

    private tableRowData(data: DocumentsType[]) {
        const { anchorEl, openedMenuId } = this.state;
        const open = Boolean(anchorEl);

        const VisuallyHiddenInput = styled('input')({
            clip: 'rect(0 0 0 0)',
            clipPath: 'inset(50%)',
            height: 1,
            overflow: 'hidden',
            position: 'absolute',
            bottom: 0,
            left: 0,
            whiteSpace: 'nowrap',
            width: 1,
          });
        return(
            data.map(document => (
                <TableRow key={document.documentsId} hover>
                    <TableCell>{document.article?.stock?.name}</TableCell>
                    <TableCell>{document.article?.serialNumber}</TableCell>
                    <TableCell>{document.article?.invNumber}</TableCell>
                    <TableCell>{document.article?.user?.fullname}</TableCell>
                    <TableCell>{document.createdDate}</TableCell>
                    <TableCell>
                    <Button
                                id={`basic-button-${document.documentsId}`}
                                aria-controls={open && openedMenuId === document.documentsId ? `basic-menu-${document.documentsId}` : undefined}
                                aria-haspopup="true"
                                aria-expanded={open && openedMenuId === document.documentsId ? 'true' : undefined}
                                onClick={(event) => this.handleClick(event, document.documentsId!)}
                            >
                                Dashboard
                            </Button>
                            <Menu
                                id={`basic-menu-${document.documentsId}`}
                                anchorEl={anchorEl}
                                open={open && openedMenuId === document.documentsId}
                                onClose={this.handleClose}
                                MenuListProps={{
                                    'aria-labelledby': `basic-button-${document.documentsId}`,
                                }}
                            >
                                <MenuItem onClick={this.handleClose}><i className="bi bi-file-earmark-word">{document.path}</i></MenuItem>
                                <MenuItem onClick={this.handleClose}><i className="bi bi-file-earmark-pdf">{document.signed_path}</i></MenuItem>
                                <MenuItem onClick={this.handleClose}>
           
                                        <Button component="label" variant="contained" startIcon={<CloudUploadIcon />}>
                                            Upload file
                                        </Button>
                                    <VisuallyHiddenInput id={`file-upload-${document.documentsId}`} type="file" onChange={(e) => this.handleFileUpload(e, document.documentsId!)} />
                                </MenuItem>
                            </Menu>
                    </TableCell>
                </TableRow>
            ))
        )
    }
}
    /* KRAJ GET I MOUNT FUNKCIJA */