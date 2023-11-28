import React, { useEffect, useState } from 'react';
import { ApiConfig } from '../../../config/api.config';
import api, { ApiResponse } from '../../../API/api';
import { Redirect, useHistory } from 'react-router-dom';
import { saveAs } from 'file-saver';
import * as ExcelJS from 'exceljs';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import AdminMenu from '../AdminMenu/AdminMenu';
import StockType from '../../../types/UserArticleType';
import { Badge, Button, Card, Col, Container, ListGroup, Row, Stack } from 'react-bootstrap';
import ArticleType from '../../../types/ArticleType';
import DocumentsType from '../../../types/DocumentsType';
import { Box, Link, MenuItem, Menu as MuiMenu, Button as MuiButton, Snackbar, Table, TableBody, TableCell, TableRow, TableContainer, TableHead, Pagination, TextField} from '@mui/material';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import './style.css'

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
        const fetchData = async () => {
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
    
        fetchData();
    }, [articleCurrentPage, articleItemsPerPage, articlePaginationTableQuery]);

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

    const fetchAllArticles = async () => {
        try {
          const apiUrl = `/api/admin/dashboard/articles`;
          const response = await api(apiUrl, 'get', {}, 'administrator');
      
          if (response.status === 'login') {
            setLoggedIn(false);
            return [];
          }
      
          if (response.status === 'error') {
            setMessage('Greška prilikom dohvaćanja artikala');
            return [];
          }
      
          return response.data || [];
        } catch (error) {
          setMessage('Greška prilikom dohvaćanja artikala. Greška: ' + error);
          return [];
        }
      };

      const exportToExcel = async () => {
        const allArticles = await fetchAllArticles();
        const dataToExport = allArticles.map((article:any) => ({
          ID: article.articleId,
          Naziv: article.stock?.name || '',
          serijski_broj: article.serialNumber || '',
          inventurni_broj: article.invNumber || '',
          Korisnik: article.user?.fullname || '',
          kategorija: article.category?.name || '',
          status: article.status || '',
        }));
      
        // Stvaranje radnog lista
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet1');
        
        // Dodajte zaglavlje
        const headerRow = worksheet.addRow(Object.keys(dataToExport[0] || {}));
        headerRow.eachCell((cell) => {
          cell.font = { bold: true };
        });
        
        // Dodajte podatke
        dataToExport.forEach((data:any) => {
          const row = worksheet.addRow(Object.values(data));
        });
        
        // Stvaranje binarnih podataka radne knjige
        const excelBuffer = await workbook.xlsx.writeBuffer();
        
        // Spašavanje datoteke
        saveAs(new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' }), 'export.xlsx');
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
                        <ListGroup style={{fontSize:"14px"}}>
                                <ListGroup.Item active >
                                    Posljednje dodani artikal na skladište
                                </ListGroup.Item>
                                <ListGroup.Item >
                                    Naziv: {stockData?.name}
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
                                <ListGroup.Item style={{display:"flex", justifyContent:"flex-end"}}>
                                    <Button onClick={() => handlePageClick(`stock/${stockData?.stockId}`)} size='sm'>Zaduži</Button>
                                </ListGroup.Item>
                         </ListGroup>
                                        
                    </Col>
                    <Col lg='4' xs="12" className='mt-2'>
                        <ListGroup style={{fontSize:"14px"}} >
                            <ListGroup.Item active >
                                Posljednje dodani artikal
                            </ListGroup.Item>
                            <ListGroup.Item >
                                Naziv: {articleData?.stock?.name}
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
                                Status: <span className={`status-${articleData?.status}`}>{articleData?.status}</span>
                            </ListGroup.Item>
                            <ListGroup.Item style={{display:"flex", justifyContent:"flex-end"}}>
                                    <Button onClick={() => handlePageClick(`user/${articleData?.serialNumber}`)} size='sm'>Pregledaj</Button>
                                </ListGroup.Item>
                        </ListGroup>
                    </Col>

                    <Col lg='4' xs="12" className='mt-2'>
                        <Card style={{fontSize:"14px", height:'auto', maxHeight:"309px"}}>
                            <Card.Header className="d-flex justify-content-between align-items-center">
                                Nepotpisani dokumenti <Badge bg="danger" pill> {unsignedDocumentDataCount}</Badge>
                            </Card.Header>
                            <Card.Body style={{ overflow: 'auto' }}>
                                <Table size='small'>
                                    <TableBody>
                                    {unsignedDocumentData?.map(document => (
                                        <TableRow key={document.documentsId}>
                                            <TableCell>
                                                {document?.article?.stock?.name}
                                            </TableCell>
                                            <TableCell>
                                                {document?.article?.invNumber}
                                            </TableCell>
                                            <TableCell>
                                                {document?.article?.user?.fullname}
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
                            <Row style={{width:'100%', paddingLeft:'10px', paddingRight:'10px', fontSize:"14px"}}>
                                <Col lg={11} xs={11}>
                                <TextField
                                        label="Pretraži artikle"
                                        variant="outlined"
                                        margin="normal"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              const target = e.target as HTMLInputElement;
                                              handleSearchChange(target.value);
                                            }
                                          }}
                                        style={{width:'100%', fontSize:"14px"}}
                                    /> 
                                </Col>
                                <Col lg={1} xs={1}style={{display:'flex', justifyContent:'center', alignItems:'center'}}>
                                <Link component={() => <div title='Prebaci u excel' className="linkContainer" onClick={() => exportToExcel()} ><i className="bi bi-filetype-xlsx" style={{ fontSize: "25px", color:'darkgreen'}} /></div>} />
                                </Col>
                            </Row>
{/*                             <div style={{width:'100%', paddingLeft:'10px', paddingRight:'10px', fontSize:"14px"}}>
                                       <TextField
                                        label="Pretraži artikle"
                                        variant="outlined"
                                        margin="normal"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              const target = e.target as HTMLInputElement;
                                              handleSearchChange(target.value);
                                            }
                                          }}
                                        style={{width:'100%', fontSize:"14px"}}
                                    /> 
                                    <Button onClick={exportToExcel} variant="success">
                                    <i className="bi bi-filetype-xlsx" style={{fontSize:"16px"}}></i>
                                    </Button>

                            </div> */}
                                <TableContainer style={{ maxHeight: 'auto', overflowY: 'auto', fontSize:"14px" }} >                                   
                                    <Table sx={{ minWidth: 700 }} stickyHeader size='small'>
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
                                                    <TableCell><Link href={`#/admin/userProfile/${artikal?.userId}`} >{artikal?.user?.fullname}</Link></TableCell>
                                                    <TableCell className={`status-${artikal?.status}`}>{artikal?.status}</TableCell>
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