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

    handleFileUpload(event: React.FormEvent<HTMLInputElement>, documentId: number): void {
        const input = event.currentTarget as HTMLInputElement;
        const files = input.files;
    
        if (files && files.length > 0) {
            const file = files[0];
    
            const formData = new FormData();
            formData.append('file', file);
        
            api(`api/document/${documentId}/upload`, 'post', formData, 'administrator', { useMultipartFormData: true })
                .then((res: ApiResponse) => {
                    
                })
                .catch((error) => {    
                    if (error.response) {
                        console.error('Response data:', error.response.data);
                        console.error('Response status:', error.response.status);
                        console.error('Response headers:', error.response.headers);
                    } else if (error.request) {
                        console.error('Request data:', error.request);
                    } else {
                        console.error('Error message:', error.message);
                    }
                });
        }
        this.getDocumentsData()
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
                                <MenuItem onClick={this.handleClose} style={{fontSize:"12px"}}><i className="bi bi-file-earmark-word" style={{ color: 'darkBlue', fontSize:"18px", marginRight:'3px' }} /> WORD/RAW</MenuItem>
                                <MenuItem style={{fontSize:"12px"}} onClick={document.signed_path ? this.handleClose : undefined}>
                                    {document.signed_path ? (
                                        <>
                                        <i className="bi bi-file-earmark-pdf" style={{ color: 'darkRed', fontSize:"18px", marginRight:'3px' }} /> PDF/Potpisano
                                      </>
                                    ) : (
                                        <form encType="multipart/form-data">
                                        <Button
                                            component="label"
                                            variant="contained"
                                            startIcon={<CloudUploadIcon />}
                                        >
                                            <VisuallyHiddenInput
                                            id={`file-upload-${document.documentsId}`}
                                            type="file"
                                            onChange={(e) => this.handleFileUpload(e, document.documentsId!)}
                                            />
                                            Upload file
                                        </Button>
                                        </form>
                                    )}
                                </MenuItem>
                            </Menu>
                    </TableCell>
                    <TableCell>
                    
                    </TableCell>
                </TableRow>
            ))
        )
    }
}
    /* KRAJ GET I MOUNT FUNKCIJA */