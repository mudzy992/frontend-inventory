import React, { useEffect, useState } from 'react';
import { ApiConfig } from "../../../config/api.config";
import api, { ApiResponse } from '../../../API/api';
import DocumentsType from '../../../types/DocumentsType';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import saveAs from 'file-saver';
import AdminMenu from '../../admin/AdminMenu/AdminMenu';
import Moment from 'moment';
import { Avatar, Button, Input, Link, Modal, ModalBody, ModalContent, ModalHeader, Pagination, Progress, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, useDisclosure } from '@nextui-org/react';



interface ModalData {
    document: DocumentsType | undefined;
}

const DocumentsPage: React.FC = () => {
    const [itemsPerPage] = useState<number>(15);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalResults, setTotalResults] = useState<number>(0);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
    const [documentsData, setDocumentsData] = useState<DocumentsType[]>([])
    const [modalData, setModalData] = useState<ModalData>({ document: undefined });
    const {isOpen, onOpen, onClose} = useDisclosure();
    const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);

    const handleFileUpload = async (event: React.FormEvent<HTMLInputElement>, documentId: number): Promise<void> => {
        const input = event.currentTarget;
        const files = input.files;
        if (files && files.length > 0) {
            const file = files[0];
            const formData = new FormData();
            formData.append('file', file);
            try {
                await api(`api/document/${documentId}/upload`, 'post', formData, 'administrator', { useMultipartFormData: true });
                await getDocumentsData();
                const updatedDocument = getDocumentById(documentsData, documentId);
                if (updatedDocument) {
                    setModalData({ document: updatedDocument });
                }
            } catch (error) {
                console.error('Greška priliko dodavanja fajla:', error);
            }
        }
    };

    const handleButtonClick = () => {
        const fileInput = document.getElementById('dropzone-file');
        if (fileInput) {
          fileInput.click();
        }
      };

    const documentsIdWithNullPath = documentsData.filter(item => item.signed_path || !item.signed_path).map(item => item.documentsId);

    const getDocumentById = (documentsData: DocumentsType[], selectedId: number): DocumentsType | undefined => {
        return documentsData.find(item => item.documentsId === selectedId);
    };

    const handleOpenModal = (documentId: number | null) => {
        if (documentsIdWithNullPath.includes(documentId || 0)) {
            const selectedDocument = getDocumentById(documentsData, documentId || 0);
            if (selectedDocument) {
                setModalData({ document: selectedDocument });
                setSelectedDocumentId(documentId);
                onOpen();
            }
        }
    };

    const handleCloseModal = () => {
        onClose();
        getDocumentsData();
    };

    const saveFile = (path: string) => {
        saveAs(ApiConfig.TEMPLATE_PATH + path, path);
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
          setCurrentPage(1)
          getDocumentsData();
        }
    };

    function combineFirstLetters(surname: string, forname: string) {
        const inicialLetters = surname.charAt(0).toUpperCase() + forname.charAt(0).toUpperCase()
        return inicialLetters
      }

    useEffect(() => {
        try {
            getDocumentsData();
        } catch (error) {
            console.error('Greška prilikom dohvaćanja podataka:', error);
        }
    }, [itemsPerPage, currentPage]);
    

    const getDocumentsData = () => {
        api(`api/document/s?perPage=${itemsPerPage}&page=${currentPage}&query=${encodeURIComponent(searchQuery)}`, 
        'get', {}, 
        'administrator')
            .then((res: ApiResponse) => {
                if (res.status === 'login') {
                    setIsLoggedIn(false);
                    setMessage('Greška prilikom učitavanja dokumenata');
                    return;
                }
                setDocumentsData(res.data.results)
                setTotalResults(Math.max(0, res.data.total));
            });
    }
    

    const totalPages = Math.ceil(totalResults / itemsPerPage);

    const dokumentAction = (signed: string, documentId: number, handleOpenModal: (documentId: number | null) => void) => {
        if(signed) {
            return (
                <Button key={documentId} onPress={() => handleOpenModal(documentId)} color='success' variant='solid' size='sm'>
                    Detalji
                </Button>
            );
        }
        if(!signed) {
            return (
                <Button key={documentId} onPress={() => handleOpenModal(documentId)} color='danger' variant='solid' size='sm'>
                    Detalji
                </Button>
            );
        }
    };
    
    return (
        <><RoledMainMenu />
        <div className="container mx-auto lg:px-4 mt-3 h-max">
        <div className='mb-3'> 
            <Input
            variant="bordered"
            type="text"
            isClearable
            placeholder="Pronađi artikal..."
            value={searchQuery}
            onClear={() => setSearchQuery("")} 
            onValueChange={(value) => setSearchQuery(value || "")}
            onKeyDown={handleKeyPress}
            />           
          </div>
          <Table
            aria-label="Article modal tabela"
            isHeaderSticky
            className='mb-3'
            classNames={{
              wrapper: "max-h-screen",
            }}
            
          >
            <TableHeader>
              <TableColumn key="documentNumber">Broj dokumenta</TableColumn>
              <TableColumn key="naziv-artikla">Naziv artikla</TableColumn>
              <TableColumn key="serijski-broj-artikla">Serijski broj</TableColumn>
              <TableColumn key="inv-broj-artikal">Inventurni broj</TableColumn>
              <TableColumn key="zaduzeni-korisnik-predao">Predao</TableColumn>
              <TableColumn key="zaduzeni-korisnik-preuzeo">Preuzeo</TableColumn>
              <TableColumn key="dokument-prenosnica">Dokument</TableColumn>
            </TableHeader>
                <TableBody items={documentsData}>
                    {(item) => 
                    (
                        <TableRow key={item.documentsId}>
                            <TableCell className='whitespace-nowrap min-w-fit'>{item.documentNumber}</TableCell>
                            <TableCell className='whitespace-nowrap min-w-fit'>{item.article?.stock?.name}</TableCell>
                            <TableCell className='whitespace-nowrap min-w-fit'><Link className='text-sm' isBlock showAnchorIcon color="primary" href={`#/admin/article/${item.article?.serialNumber}`}>{item.article?.serialNumber}</Link></TableCell>
                            <TableCell className='whitespace-nowrap min-w-fit'>{item.article?.invNumber}</TableCell>
                            <TableCell className='whitespace-nowrap min-w-fit'>{item.articleTimelines && item.articleTimelines.length > 0 ? item.articleTimelines[0].subbmited?.fullname : null}</TableCell>
                            <TableCell className='whitespace-nowrap min-w-fit'>{item.articleTimelines && item.articleTimelines.length > 0 ? item.articleTimelines[0].user?.fullname : null}</TableCell>
                            <TableCell className='whitespace-nowrap min-w-fit'>{dokumentAction(item.signed_path!, item.documentsId, handleOpenModal)}</TableCell>
                        </TableRow>
                    )}
                </TableBody>
          </Table>
            <Modal isOpen={isOpen} onClose={handleCloseModal} backdrop='blur' size='2xl'>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>
                                {modalData.document?.article?.stock?.name}
                            </ModalHeader>
                            <ModalBody>
                                {modalData.document && (
                                    <>
                                        <div className='grid grid-cols-12 gap-2 '>
                                                {modalData.document.articleTimelines && modalData.document.articleTimelines.length > 0 && (
                                                    <div className='col-span-4 flex flex-col justify-center items-center w-full h-[250px] p-3'>
                                                        <div className='mb-3'><Avatar className='w-20 h-20 text-large' isBordered showFallback name={combineFirstLetters(modalData.document.articleTimelines[0]?.subbmited?.surname!, modalData.document.articleTimelines[0]?.subbmited?.forname!)} /></div>
                                                        <div className='text-center'>{modalData.document.articleTimelines[0]?.subbmited?.fullname}</div>
                                                    </div>
                                                )}
                                            <div className='max-w-[100%] col-span-4 flex flex-col justify-center items-center text-center'>
                                                {modalData.document.article?.stock?.name}
                                                    <Progress
                                                        size="sm"
                                                        isIndeterminate
                                                        aria-label="Loading..."
                                                        className=" max-w-[80%] "
                                                    />
                                                {modalData.document.article?.invNumber}
                                            </div>
                                            {modalData.document.articleTimelines && modalData.document.articleTimelines.length > 0 && (
                                                    <div className='col-span-4 flex flex-col justify-center items-center w-full max-h-[250px] p-3'>
                                                        <div className='mb-3'><Avatar className='w-20 h-20 text-large' isBordered showFallback name={combineFirstLetters(modalData.document.articleTimelines[0]?.user?.surname!, modalData.document.articleTimelines[0]?.user?.forname!)} /></div>
                                                        <div className='text-center'>{modalData.document.articleTimelines[0]?.user?.fullname}</div>
                                                    </div>
                                                )}
                                        </div>
                                        <div>
                                            Broj dokumenta: {modalData.document.documentNumber}
                                        </div>
                                        <div>
                                            Datum i vrijeme kreiranja prenosnica: {Moment(modalData.document.createdDate).format("DD.MM.YYYY. - HH:mm")}
                                        </div>
                                        <div className='cursor-pointer'>
                                            RAW prenosnica: 
                                            <Button className='ml-2' color='primary' variant='faded' startContent={<i className="bi bi-file-earmark-word" />} onPress={() => saveFile(modalData.document?.path!)}>Preuzmi</Button>
                                        </div>
                                        <div className='cursor-pointer flex flex-nowrap items-center mb-3'>
                                            PDF prenosnica: 
                                            {modalData.document.signed_path === "" ? (
                                                <form encType="multipart/form-data">
                                                    <Button className='ml-2' color='danger' variant='faded' onClick={handleButtonClick} startContent={<i className="bi bi-cloud-arrow-up-fill" />}> Dodaj dokument
                                                        <input id="dropzone-file" type="file" className="hidden" onChange={(e) => handleFileUpload(e, selectedDocumentId!)} />
                                                    </Button>
                                                </form>
                                            ) : (
                                                <Button className='ml-2' color='danger' variant='faded' startContent={<i className="bi bi-file-earmark-pdf" />} onPress={() => saveFile(modalData.document?.signed_path!)}>Preuzmi</Button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
                </Modal>
          <div className="flex justify-center">
            <Pagination
              showControls
              showShadow
              page={currentPage}
              total={totalPages}
              onChange={(page) => setCurrentPage(page)}
            />
          </div>
        </div>
        <AdminMenu />
        </>
      );
}
  
export default DocumentsPage;