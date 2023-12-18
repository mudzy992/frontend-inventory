import React, { useEffect, useState } from 'react';
import { ApiConfig } from '../../../config/api.config';
import api from '../../../API/api';
import { saveAs } from 'file-saver';
import * as ExcelJS from 'exceljs';
import StockType from '../../../types/UserArticleType';
import ArticleType from '../../../types/ArticleType';
import DocumentsType from '../../../types/DocumentsType';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import ArticleTimlineModal from '../ArticleTimelinePage/ArticleTimelinePageModal';
import AdminMenu from '../AdminMenu/AdminMenu';
import moment from 'moment';
import { Button, Card, CardFooter, CardHeader, Chip, Input, Link, Listbox, ListboxItem, Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@nextui-org/react';
import { useNavigate } from 'react-router-dom';

// Funkcionalna komponenta AdminDashboardPage
const AdminDashboardPage: React.FC = () => {
    // State hook za stanje komponente
    const [isLoggedIn, setLoggedIn] = useState<boolean>(true);
    const [stockData, setStock] = useState<StockType>();
    const [articleData, setArticle] = useState<ArticleType>();
    const [paginedArticleData, setPaginedArticle] = useState<ArticleType[]>();
    const [articleCurrentPage, setArticleCurrentPage] = useState<number>(1);
    const [articleItemsPerPage] = useState<number>(10);
    const [articleTotalPage, setArticleTotalPage] = useState<number>(0);
    const [articlePaginationTableQuery, setArticlePaginationTableQuery] = useState<string>('');
    const [unsignedDocumentData, setUnsignedDocument] = useState<DocumentsType[]>();
    const [unsignedDocumentDataCount, setUnsignedDocumentCount] = useState<number>();
    const [unsignedDocumentId, setUnsignedDocumentId] = useState<number>()
    const [selectedDocument, setSelectedDocument] = useState<DocumentsType | null>(null);
    const [open, setOpen] = React.useState(false);
    const [messageData, setMessage] = useState<string>('')
    const [showModal, setShowModal] = useState(false); 
    const [selectedArticleTimelineId, setSelectedArticleTimelineId] = useState<number | null>(null);
    const navigate = useNavigate();

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

    const handleSearchChange = (query: string) => {
        setArticleCurrentPage(1)
        setArticlePaginationTableQuery(query)        
    }  

    const handleClick = () => {
        setOpen(true);
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
        Serijski_broj: article.serialNumber || '',
        Inventurni_broj: article.invNumber || '',
        Korisnik: article.user?.fullname || '',
        Kategorija: article.category?.name || '',
        Status: article.status || '',
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
          worksheet.addRow(Object.values(data));
        });
        
        // Stvaranje binarnih podataka radne knjige
        const excelBuffer = await workbook.xlsx.writeBuffer();
        const currentDate = moment();
        const formattedDate = currentDate.format('DD.MM.YYYY');
        // Spašavanje datoteke
        saveAs(new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' }), `Oprema-${formattedDate}.xlsx`);
      };
      
    const handleButtonClick = (documentId:any) => {
        const fileInput = document.getElementById('dropzone-file');
        setUnsignedDocumentId(documentId)
        if (fileInput) {
          fileInput.click();
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

        setMessage('Dokument uspješno dodan!')
        handleClick()

        } catch (error) {
            setMessage('Greška prilikom uploada dokumenta. Greška: ' + error)
        }
    };

    const handleShowModal = () => {
        setShowModal(true);
      };
    
    const handleHideModal = () => {
        setShowModal(false);
    };

    const openModalWithArticle = (articleTimelineId: number) => {
        setSelectedArticleTimelineId(articleTimelineId);
        handleShowModal();
    };

    return (
        <div>
            <RoledMainMenu />
            <div className="container mx-auto lg:px-4 mt-3 h-max">

            <div className="flex flex-col mb-14">
                <div className='lg:flex lg:flex-row mb-3'>
                    <div className="lg:w-1/4 w-full mb-3 lg:mr-3">
                        <Card>
                            <CardHeader className='bg-default-100'>
                                Posljednje dodani artikal na skladište
                            </CardHeader>
                                <Listbox key={1-0} aria-label='Posljednje dodani artikal na skladište' className='w-[90%]'>
                                    <ListboxItem key={1} textValue={stockData?.name}>
                                        Naziv: {stockData?.name}
                                    </ListboxItem>
                                    <ListboxItem key={2} textValue={stockData?.name}>
                                        Kategorija: {stockData?.category?.name}
                                    </ListboxItem>
                                    <ListboxItem key={3} textValue={stockData?.valueAvailable?.toString()}>
                                        Dostupno: {stockData?.valueAvailable}
                                    </ListboxItem>
                                    <ListboxItem key={4} textValue={stockData?.contract}>
                                        Ugovor: {stockData?.contract}
                                    </ListboxItem>
                                    <ListboxItem key={5} textValue={stockData?.sapNumber}>
                                        SAP broj: {stockData?.sapNumber}
                                    </ListboxItem> 
                                </Listbox>
                                <CardFooter className='flex justify-end'>
                                     <Button color='warning' variant='shadow' onClick={() => navigate(`/admin/stock/${stockData?.stockId}`)} size='sm'>Zaduži</Button>
                                </CardFooter>
                        </Card>
                    </div>
                    <div className="lg:w-1/4 w-full mb-3 lg:mr-3">
                        <Card>
                            <CardHeader className='bg-default-100'>
                                Posljednje dodani artikal
                            </CardHeader>

                                <Listbox key={2-0} aria-label='Posljednje dodani artikli' className='w-[90%]'>
                                    <ListboxItem key={1} textValue={stockData?.name}>
                                        Naziv: {articleData?.stock?.name}
                                    </ListboxItem>
                                    <ListboxItem key={2} textValue={stockData?.name}>
                                        Serijski broj: {articleData?.serialNumber}
                                    </ListboxItem>
                                    <ListboxItem key={3} textValue={stockData?.valueAvailable?.toString()}>
                                        Inventurni broj: {articleData?.invNumber}
                                    </ListboxItem>
                                    <ListboxItem key={4} textValue={stockData?.contract}>
                                        Korisnik: {articleData?.user?.fullname}
                                    </ListboxItem>
                                    <ListboxItem key={5} textValue={stockData?.sapNumber}>
                                        Status: <span className={`status-${articleData?.status}`}>{articleData?.status}</span>
                                    </ListboxItem>
                                </Listbox>
                                <CardFooter className='flex justify-end'>
                                     <Button color='warning' variant='shadow' onClick={() => navigate(`/admin/article/${articleData?.serialNumber}`)} size='sm'>Zaduži</Button>
                                </CardFooter>
                        </Card>
                    </div>
                    <div className="lg:w-1/2 w-full bg-default-50 rounded-2xl shadow p-2 max-h-[262px]">
                        <div className='mb-3 bg-default-100 rounded-lg p-2'>
                            <span>Nepotpisani dokumenti</span> <Chip color="danger" variant='shadow'> {unsignedDocumentDataCount}</Chip>
                        </div>
                            <Table 
                            hideHeader 
                            removeWrapper
                            isStriped 
                            aria-label='Tabela nepotpisanih dokumenta'
                            classNames={{base: 'max-h-[190px] overflow-y-scroll ', table: 'min-h-[190px]'}}
                            >
                                <TableHeader>
                                    <TableColumn>Naziv</TableColumn>
                                    <TableColumn>Inv.Broj</TableColumn>
                                    <TableColumn>Korisnik</TableColumn>
                                    <TableColumn>Dodaj</TableColumn>
                                    <TableColumn>Timeline</TableColumn>
                                </TableHeader>
                                <TableBody>
                                {(unsignedDocumentData || []).map((document, index) => (
                                    <TableRow key={index}>
                                        <TableCell textValue={`naziv-${index}`}>
                                            {document?.article?.stock?.name}
                                        </TableCell>
                                        <TableCell textValue={`Inventurni broj-${index}`}>
                                            {document?.article?.invNumber}
                                        </TableCell>
                                        <TableCell textValue={`Korisnik-${index}`}>
                                            {document?.article?.user?.fullname}
                                        </TableCell>
                                        <TableCell textValue={`Dokument-${index}`}>
                                            <Button size='sm' color='success' variant='shadow' onClick={() => handleButtonClick(document?.documentsId)}> Dodaj
                                                <form encType="multipart/form-data">
                                                    <input id="dropzone-file" type="file" className='hidden' onChange={(e) => handleFileUpload(unsignedDocumentId!, e.target.files![0])} />
                                                </form>
                                           </Button>   
                                        </TableCell>
                                        <TableCell textValue={`Modal dokument-${index}`}>
                                        <Button
                                            onClick={(event) => {
                                                const firstArticleTimeline = document.articleTimelines?.[0];
                                                if (firstArticleTimeline?.articleTimelineId !== undefined) {
                                                openModalWithArticle(firstArticleTimeline.articleTimelineId);
                                                }
                                            }}
                                            size='sm'
                                            variant='shadow'
                                            >
                                            Timeline
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                    </div>
                </div>

                <div className="xs:w-full bg-default-50 rounded-2xl shadow p-2">
                    <div className='mb-3 bg-default-100 rounded-lg p-2' >Svi artikli</div>
                    <div className='mb-3 flex flex-row gap-3 items-center'>
                        <div className='w-full'>
                            <Input
                            placeholder="Pronađi artikal..."
                            variant='bordered'
                            isClearable
                            startContent={<i className="bi bi-search text-default-500" />}
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                if (e.key === 'Enter') {
                                    const target = e.target as HTMLInputElement;
                                    handleSearchChange(target.value);
                                }
                            }}                            
                        />
                        </div>
                        <div>
                            <Button onClick={() => exportToExcel()} variant='shadow' color='success' className='h-[52px]' startContent={<i className="bi bi-filetype-xlsx" style={{ fontSize: "25px"}} />} />
                        </div>
                        
                    </div>
                    <div className='w-full'>
                        <Table selectionMode='single'  aria-label='Tabela artikala'>
                            <TableHeader>
                                <TableColumn>Naziv</TableColumn>
                                <TableColumn>Serijski broj</TableColumn>
                                <TableColumn>Inventurni broj</TableColumn>
                                <TableColumn>Kategorija</TableColumn>
                                <TableColumn>Korisnik</TableColumn>
                                <TableColumn>Status</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {(paginedArticleData || []).map((artikal, index) => (
                                    <TableRow key={artikal.articleId}>
                                        <TableCell><Link className='text-sm' showAnchorIcon href={`#/admin/article/${artikal?.serialNumber}`} >{artikal?.stock?.name} </Link></TableCell>
                                        <TableCell>{artikal?.serialNumber}</TableCell>
                                        <TableCell>{artikal?.invNumber}</TableCell>
                                        <TableCell>{artikal?.category?.name}</TableCell>
                                        <TableCell><Link className='text-sm' showAnchorIcon href={`#/admin/user/${artikal?.userId}`} >{artikal?.user?.fullname}</Link></TableCell>
                                        <TableCell className={`status-${artikal?.status}`}>{artikal?.status}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                        
                    <div className="flex justify-center mt-3">
                        <Pagination
                        color="default"
                        showControls
                        variant='flat'
                        disableCursorAnimation
                        initialPage={articleCurrentPage}
                        page={articleCurrentPage}
                        total={articleTotalPage}
                        onChange={(page) => setArticleCurrentPage(page)}
                        />
                    </div>
                </div>
            </div>
</div>

        <ArticleTimlineModal 
            show={showModal}
            onHide={handleHideModal}
            articleTimlineId={selectedArticleTimelineId!}
        />
        <AdminMenu /> 
        </div>
    );
};

export default AdminDashboardPage;


    
