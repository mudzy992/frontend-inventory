import React, { useEffect, useState } from 'react';
import { ApiConfig } from '../../../config/api.config';
import api, { ApiResponse } from '../../../API/api';
import { Redirect, useHistory } from 'react-router-dom';
import { saveAs } from 'file-saver';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import AdminMenu from '../AdminMenu/AdminMenu';
import StockType from '../../../types/UserArticleType';
import { Badge, Button, Card, Col, Container, ListGroup, Row, Stack } from 'react-bootstrap';
import ArticleType from '../../../types/ArticleType';
import DocumentsType from '../../../types/DocumentsType';
import { Box, Link, MenuItem, Menu as MuiMenu, Button as MuiButton, Snackbar, Table, TableBody, TableCell, TableRow, TableContainer, TableHead, Pagination, TextField} from '@mui/material';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

// Funkcionalna komponenta AdminDashboardPage
const AdminDashboardPage: React.FC<{}> = () => {
    // State hook za stanje komponente
    const [isLoggedIn, setLoggedIn] = useState<boolean>(true);
    const [stockData, setStock] = useState<StockType>();
    const [articleData, setArticle] = useState<ArticleType>();
    const [paginedArticleData, setPaginedArticle] = useState<ArticleType[]>();
    const [articleCurrentPage, setArticleCurrentPage] = useState<number>(1);
    const [articleItemsPerPage, setArticleItemsPerPage] = useState<number>(10);
    const [isArticleSearchActive, setIsArticleSearchActive] = useState<boolean>(false);
    const [articleTotalPage, setArticleTotalPage] = useState<number>(0);
    const [articlePaginationTableQuery, setArticlePaginationTableQuery] = useState<string>('');
    const [unsignedDocumentData, setUnsignedDocument] = useState<DocumentsType[]>();
    const [unsignedDocumentDataCount, setUnsignedDocumentCount] = useState<number>();
    const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedDocument, setSelectedDocument] = useState<DocumentsType | null>(null);
    const [open, setOpen] = React.useState(false);
    const [messageData, setMessage] = useState<string>('')

    const history = useHistory();

    // useEffect hook koji se poziva nakon što se komponenta montira
    useEffect(() => {
        const fatchData = async () => {
            try {
                const stockResponse = await api('/api/admin/dashboard/stock', 'get', {}, 'administrator');
                if (stockResponse.status === 'login') {
                    setLoggedIn(false);
                    return
                }

                if (stockResponse.status === 'error') {
                    setMessage('Greška prilikom dohvaćanja posljednjeg artikla na skladištu')
                    return;
                }
                setStock(stockResponse.data)
            } catch (err) {
                setMessage('Greška prilikom dohvaćanja posljednjeg artikla na skladištu. Greška: ' + err)
            }

            try {
                const articleResponse = await api('/api/admin/dashboard/article', 'get', {}, 'administrator');
                if (articleResponse.status === 'login') {
                    setLoggedIn(false);
                    return
                }

                if (articleResponse.status === 'error') {
                    setMessage('Greška prilikom dohvaćanja posljednjeg artikla na skladištu')
                    return;
                }
                setArticle(articleResponse.data)

            } catch (error) {
                setMessage('Greška prilikom do' + error)
            }

            /* try {
                const offset = ((articleCurrentPage - 1) * articleItemsPerPage)
                const apiUrl = `/api/admin/dashboard/articles/p?perPage=${articleItemsPerPage}&offset=${offset}`
                const paginedArticleResponse = await api(apiUrl, 'get', {}, 'administrator');
                if (paginedArticleResponse.status === 'login') {
                    setLoggedIn(false);
                    return
                }

                if (paginedArticleResponse.status === 'error') {
                    setMessage('Greška prilikom dohvaćanja posljednjeg artikla na skladištu')
                    return;
                }
                setPaginedArticle(paginedArticleResponse.data.results)
                setArticleTotalPage(paginedArticleResponse.data.total)

            } catch (error) {
                setMessage('Greška prilikom dohvaćanja artikala u tabelu. Greška: ' + error)
            } */

            try {
                const unsignedDocumentResponse = await api('/api/admin/dashboard/document/unsigned', 'get', {}, 'administrator');
                if (unsignedDocumentResponse.status === 'login') {
                    setLoggedIn(false);
                    return
                }

                if (unsignedDocumentResponse.status === 'error') {
                    setMessage('Greška prilikom dohvaćanja posljednjeg artikla na skladištu')
                    return;
                }
                const [documents, count] = unsignedDocumentResponse.data;
                setUnsignedDocument(documents);
                setUnsignedDocumentCount(count);
            } catch (error) {
                setMessage('Greška prilikom dohvaćanja dokumenta. Greška: ' + error)
            }
        }
        fatchData()
    }, []);

    useEffect(() => {
        // Ova funkcija se izvršava samo kada se mijenja stranica
        const fetchPaginatedData = async () => {
            try {
                const offset = ((articleCurrentPage - 1) * articleItemsPerPage);
                const apiUrl = `/api/admin/dashboard/articles/p?perPage=${articleItemsPerPage}&offset=${offset}`;
                const paginatedArticleResponse = await api(apiUrl, 'get', {}, 'administrator');
    
                if (paginatedArticleResponse.status === 'login') {
                    setLoggedIn(false);
                    return;
                }
    
                if (paginatedArticleResponse.status === 'error') {
                    setMessage('Greška prilikom dohvaćanja posljednjeg artikla na skladištu');
                    return;
                }
    
                setPaginedArticle(paginatedArticleResponse.data.results);
                setArticleTotalPage(paginatedArticleResponse.data.total);
            } catch (error) {
                setMessage('Greška prilikom dohvaćanja artikala u tabelu. Greška: ' + error);
            }
        };
    
        // Ako nije aktivan search, dohvatite paginirane podatke
        if (!isArticleSearchActive) {
            fetchPaginatedData();
        }
    }, [articleCurrentPage, articleItemsPerPage, isArticleSearchActive]);

    useEffect(() => {
        // Ova funkcija se izvršava samo kada se vrši pretraga
        const fetchSearchData = async () => {
            try {
                const apiUrl = `/api/admin/dashboard/articles/s?perPage=${articleItemsPerPage}&page=${articleCurrentPage}&query=${encodeURIComponent(articlePaginationTableQuery)}`;
                const paginatedArticleResponse = await api(apiUrl, 'get', {}, 'administrator');
    
                if (paginatedArticleResponse.status === 'login') {
                    setLoggedIn(false);
                    return;
                }
    
                if (paginatedArticleResponse.status === 'error') {
                    setMessage('Greška prilikom dohvaćanja posljednjeg artikla na skladištu');
                    return;
                }
    
                setPaginedArticle(paginatedArticleResponse.data.results);
                const totalCount: number = paginatedArticleResponse.data.total;
                const totalPages: number = Math.ceil(totalCount / articleItemsPerPage);
                setArticleTotalPage(totalPages);
            } catch (error) {
                setMessage('Greška prilikom dohvaćanja artikala u tabelu. Greška: ' + error);
            }
        };
    
        // Ako je aktivan search, dohvatite rezultate pretrage
        if (isArticleSearchActive) {
            fetchSearchData();
        }
    }, [articleCurrentPage, articleItemsPerPage, isArticleSearchActive, articlePaginationTableQuery]);

    if (!isLoggedIn) {
        return <Redirect to="/admin/login" />;
    }

    const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
        props,
        ref,
      ) {
        return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
    });

    const handlePageChange = (newPage: number) => {
        setArticleCurrentPage(newPage);
    };

    const handleSearchChange = (query: string) => {
        setIsArticleSearchActive(true)
        setArticleCurrentPage(1)
        setArticlePaginationTableQuery(query)        
    }

/*     const searchArticle = async (query: string = '') => {
        try {
            const apiUrl = `/api/admin/dashboard/articles/s?perPage=${articleItemsPerPage}&page=${articleCurrentPage}&query=${encodeURIComponent(articlePaginationTableQuery)}`
            const paginedArticleResponse = await api(apiUrl, 'get', {}, 'administrator');
            if (paginedArticleResponse.status === 'login') {
                setLoggedIn(false);
                return
            }

            if (paginedArticleResponse.status === 'error') {
                setMessage('Greška prilikom dohvaćanja posljednjeg artikla na skladištu')
                return;
            }
            setPaginedArticle(paginedArticleResponse.data.results)
            const totalCount: number = paginedArticleResponse.data.total;
            const totalPages: number = Math.ceil(totalCount / articleItemsPerPage);
            setArticleTotalPage(totalPages)
            setArticlePaginationTableQuery(query)
        } catch (error) {
            setMessage('Greška prilikom dohvaćanja artikala u tabelu. Greška: ' + error)
        }
    } */

    

    const handleClick = () => {
        setOpen(true);
    };

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
        return;
    }

    setOpen(false);
    };

    const handleClickMenu = (event: React.MouseEvent<HTMLElement>, document: DocumentsType) => {
        setMenuAnchorEl(event.currentTarget);
        setSelectedDocument(document);
    };
    
    const handleCloseMenu = () => {
        setMenuAnchorEl(null);
        setSelectedDocument(null);
    };
    
    const handleSaveFile = (docPath: string) => {
    if (docPath) {
        saveAs(ApiConfig.TEMPLATE_PATH + docPath, docPath);
    }
    };
    
    const handleFileUpload = async (documentId: number, file: File) => {
        try {
          const formData = new FormData();
          formData.append('file', file);
    
          await api(`api/document/${documentId}/upload`, 'post', formData, 'administrator', { useMultipartFormData: true });

          setUnsignedDocument(updatedData => {
            const updatedList = (updatedData || []).filter(doc => doc.documentsId !== documentId);
            return updatedList;
        });

        setUnsignedDocumentCount(prevCount => (prevCount ?? 0) - 1);

        handleCloseMenu()
        setMessage('Dokument uspješno dodan!')
        handleClick()

        } catch (error) {
            setMessage('Greška prilikom uploada dokumenta. Greška: ' + error)
        }
    };

    const handlePageClick = (link: string) => {
        history.push(link);
    };


    return (
        <>
            <RoledMainMenu role="administrator" />
            <Container className="mt-3" fluid="md">
                <Row >
                    <Col lg='4' xs="12" className='mt-2'>
                        <Card style={{fontSize:"14px", height:'auto', minHeight:"auto"}}>
                            <Card.Header>
                                Posljednje dodani artikal na skladište
                            </Card.Header>
                            <Card.Body>
                                <Row >
                                    <Col xs={12} md lg > 
                                        <ListGroup style={{width:'auto'}}>
                                            <ListGroup.Item active >
                                                {stockData?.name}
                                            </ListGroup.Item>
                                            <ListGroup.Item>
                                                Kategorija: {stockData?.category?.name}
                                            </ListGroup.Item>
                                            <ListGroup.Item>
                                                Dostupno: {stockData?.valueAvailable}
                                            </ListGroup.Item>
                                            <ListGroup.Item>
                                                Ugovor: {stockData?.contract}
                                            </ListGroup.Item>
                                            <ListGroup.Item>
                                                SAP broj: {stockData?.sapNumber}
                                            </ListGroup.Item>
                                        </ListGroup>
                                    </Col>
                                </Row>
                            </Card.Body>
                            <Card.Footer>
                                <Row>
                                    <Col style={{display:"flex", justifyContent:"flex-end"}}><Button onClick={() => handlePageClick(`stock/${stockData?.stockId}`)} size='sm'>Zaduži</Button></Col>
                                </Row>
                            </Card.Footer>
                        </Card>
                    </Col>
                    <Col lg='4' xs="12" className='mt-2'>
                        <Card style={{fontSize:"14px", height:'auto', minHeight:"309px"}}>
                            <Card.Header>
                                Posljednje dodani artikal
                            </Card.Header>
                            <Card.Body className="justify-content-md-center">
                                <Row >
                                    <Col xs={12} md lg> 
                                        <ListGroup style={{width:'auto'}}>
                                            <ListGroup.Item active >
                                                {articleData?.stock?.name}
                                            </ListGroup.Item>
                                            <ListGroup.Item>
                                                Serijski broj: {articleData?.serialNumber}
                                            </ListGroup.Item>
                                            <ListGroup.Item>
                                                Inventurni broj: {articleData?.invNumber}
                                            </ListGroup.Item>
                                            <ListGroup.Item>
                                                Korisnik: {articleData?.user?.fullname}
                                            </ListGroup.Item>
                                            <ListGroup.Item>
                                                Status: {articleData?.status}
                                            </ListGroup.Item>
                                        </ListGroup>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg='4' xs="12" className='mt-2'>
                        <Card style={{fontSize:"14px", height:'auto', maxHeight:"309px"}}>
                            <Card.Header className="d-flex justify-content-between align-items-center">
                                Nepotpisani dokumenti <Badge bg="danger" pill> {unsignedDocumentDataCount}</Badge>
                            </Card.Header>
                            <Card.Body style={{ overflow: 'auto' }}>
                                <Table>
                                    <TableBody>
                                    {unsignedDocumentData?.map(document => (
                                        <TableRow key={document.documentsId}>
                                            <TableCell>
                                                <i className={document?.article?.category?.imagePath} />
                                            </TableCell>
                                            <TableCell>
                                                {document?.article?.stock?.name}
                                            </TableCell>
                                            <TableCell>
                                                {document?.article?.invNumber}
                                            </TableCell>
                                            <TableCell>
                                                <Button onClick={(event) => handleClickMenu(event, document)} size='sm'>Dodaj</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))} 
                                    </TableBody>
                                </Table>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Row className="mt-4" >
                    <Col>
                        <Card style={{fontSize:"14px"}}>
                            <Card.Header>
                                 Svi artikli
                            </Card.Header>
                            
                            <TextField
                                label="Pretraži artikle"
                                variant="outlined"
                                margin="normal"
                                onChange={(e) => handleSearchChange(e.target.value)}
                                style={{width:'98%', margin:'10px', fontSize:"14px"}}
                            />
                                <TableContainer style={{ maxHeight: 'auto', overflowY: 'auto', fontSize:"14px" }} >
                                    <Table sx={{ minWidth: 700 }} stickyHeader aria-label="sticky table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Naziv</TableCell>
                                                <TableCell>Serijski broj</TableCell>
                                                <TableCell>Invneturni broj</TableCell>
                                                <TableCell>Kategorija</TableCell>
                                                <TableCell>Korisnik</TableCell>
                                                <TableCell>Status</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {paginedArticleData && paginedArticleData.map(artikal => (
                                                <TableRow key={artikal.articleId} hover>
                                                    <TableCell><Link href={`#/admin/user/${artikal?.serialNumber}`} >{artikal?.stock?.name} </Link></TableCell>
                                                    <TableCell>{artikal?.serialNumber}</TableCell>
                                                    <TableCell>{artikal?.invNumber}</TableCell>
                                                    <TableCell>{artikal?.category?.name}</TableCell>
                                                    <TableCell>{artikal?.user?.fullname}</TableCell>
                                                    <TableCell>{artikal?.status}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            <Card.Footer>
                            <Pagination  variant="outlined" color="primary" showFirstButton showLastButton count={articleTotalPage} page={articleCurrentPage} onChange={(event, value) => handlePageChange(value)} />
                            </Card.Footer>
                            
                        </Card>
                    </Col>
                </Row>
                
            </Container>

            {/* Redovi u tabeli  */}

            {/* Menu za dodavanje fajlove */}
            <MuiMenu
                id="simple-menu"
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleCloseMenu}
            >
            <MenuItem>
                <Link onClick={() => handleSaveFile(selectedDocument?.path!)}>
                    <i className="bi bi-file-earmark-word" style={{ color: 'darkBlue', fontSize: '18px', marginRight: '3px' }} />
                    WORD/RAW
                </Link>
                </MenuItem>
                <MenuItem>
                {selectedDocument?.signed_path ? (
                    <Link onClick={() => handleSaveFile(selectedDocument?.signed_path!)}>
                    <i className="bi bi-file-earmark-pdf" style={{ color: 'darkRed', fontSize: '18px', marginRight: '3px' }} />
                    PDF/Potpisano
                    </Link>
                ) : (
                    <Box component="form" encType="multipart/form-data">
                    <MuiButton component="label" variant="contained" startIcon={<CloudUploadIcon />}>
                        Dodaj PDF
                        <input
                        id={`file-upload-${selectedDocument?.documentsId}`}
                        type="file"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(selectedDocument?.documentsId!, e.target.files![0])}
                        />
                    </MuiButton>
                    </Box>
                )}
                </MenuItem>
            </MuiMenu>

            {/* SnakBar za poruke */}
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
                    {messageData}
                </Alert>
            </Snackbar>
            {/* <AdminMenu /> */}
        </>
    );
};

export default AdminDashboardPage;
