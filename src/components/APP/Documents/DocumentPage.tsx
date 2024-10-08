import React, { useCallback, useEffect, useState } from "react";
import { ApiConfig } from "../../../config/api.config";
import api, { ApiResponse } from "../../../API/api";
import DocumentsType from "../../../types/DocumentsType";
import RoledMainMenu from "../../RoledMainMenu/RoledMainMenu";
import saveAs from "file-saver";
import AdminMenu from "../../admin/AdminMenu/AdminMenu";
import Moment from "moment";
import {
  Accordion,
  AccordionItem,
  Avatar,
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Pagination,
  Progress,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import Toast from "../../custom/Toast";

interface ModalData {
  document: DocumentsType | undefined;
}

interface MessageType {
  message: {
    message: string;
    variant: string;
  };
}

const DocumentsPage: React.FC = () => {
  const [itemsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [documentsData, setDocumentsData] = useState<DocumentsType[]>([]);
  const [modalData, setModalData] = useState<ModalData>({document: undefined});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [unsignedDocumentData, setUnsignedDocument] = useState<DocumentsType[]>();
  const [unsignedDocumentDataCount, setUnsignedDocumentCount] = useState<number>();
  const [unsignedDocumentId, setUnsignedDocumentId] = useState<number>();
  const [open, setOpen] = React.useState(false);
  const [messageData, setMessage] = useState<MessageType>({ message: { message: "", variant: "" }});
  const navigate = useNavigate();

  const setErrorMessage = (message: string, variant: string) => {
    setMessage((prev) => ({
      ...prev,
      message: { message, variant },
    }));
  };


  const handleFileUpload = async (documentId: number, file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      await api(
        `api/document/${documentId}/upload`,
        "post",
        formData,
        "administrator",
        { useMultipartFormData: true },
      );

      setUnsignedDocument((updatedData) => {
        const updatedList = (updatedData || []).filter(
          (doc) => doc.documentsId !== documentId,
        );
        return updatedList;
      });

      setUnsignedDocumentCount((prevCount) => (prevCount ?? 0) - 1);

      setErrorMessage("Dokument uspješno dodan!", "success");
      handleUploadClick();
    } catch (error) {
      setErrorMessage(
        "Greška prilikom uploada dokumenta. Greška: " + error,
        "danger",
      );
    }
  };

  const handleButtonClick = (documentId: any) => {
    const fileInput = document.getElementById("dropzone-file");
    if (fileInput) {
      fileInput.click();
    }
    setUnsignedDocumentId(documentId)
  };

  const handleUploadClick = () => {
    setOpen(true);
  };

  const documentsIdWithNullPath = documentsData
    .filter((item) => item.signed_path || !item.signed_path)
    .map((item) => item.documentsId);

  const getDocumentById = (
    documentsData: DocumentsType[],
    selectedId: number,
  ): DocumentsType | undefined => {
    return documentsData.find((item) => item.documentsId === selectedId);
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
      setCurrentPage(1);
      getDocumentsData();
    }
  };

  function combineFirstLetters(surname: string, forname: string) {
    const inicialLetters =
      surname.charAt(0).toUpperCase() + forname.charAt(0).toUpperCase();
    return inicialLetters;
  }

  const getDocumentsData = useCallback(() => {
    api(
      `api/document/s?perPage=${itemsPerPage}&page=${currentPage}&query=${encodeURIComponent(searchQuery)}`,
      "get",
      {},
      "administrator",
    ).then((res: ApiResponse) => {
      if (res.status === "login") {
        setIsLoggedIn(false);
        setErrorMessage("Greška prilikom dohvaćanja artikala.", 'error');
        return;
      }
      setDocumentsData(res.data.results);
      setTotalResults(Math.max(0, res.data.total));
    });
  }, [itemsPerPage, currentPage, searchQuery]); 

  useEffect(() => {
    try {
      getDocumentsData();
    } catch (error) {
      console.error("Greška prilikom dohvaćanja podataka:", error);
    }
  }, [getDocumentsData]);

  const totalPages = Math.ceil(totalResults / itemsPerPage);

  useEffect(() => {
    const fatchData = async () => {
      try {
        const unsignedDocumentResponse = await api(
          "/api/document/unsigned",
          "get",
          {},
          "administrator",
        );
        if (unsignedDocumentResponse.status === "login") {
          navigate("/login");
          return;
        }

        if (unsignedDocumentResponse.status === "error") {
          setErrorMessage(
            "Greška prilikom dohvaćanja posljednjeg artikla na skladištu",
            "danger",
          );
          return;
        }
        const [documents, count] = unsignedDocumentResponse.data;
        setUnsignedDocument(documents);
        setUnsignedDocumentCount(count);
      } catch (error) {
        setErrorMessage(
          "Greška prilikom dohvaćanja dokumenta. Greška: " + error,
          "danger",
        );
      }
    };
    fatchData();
  }, [navigate]);

  const dokumentAction = (
    signed: string,
    documentId: number,
    handleOpenModal: (documentId: number | null) => void,
  ) => {
    if (signed) {
      return (
        <Button
          key={documentId}
          onPress={() => handleOpenModal(documentId)}
          color="success"
          variant="solid"
          size="sm"
        >
          Detalji
        </Button>
      );
    }
    if (!signed) {
      return (
        <Button
          key={documentId}
          onPress={() => handleOpenModal(documentId)}
          color="danger"
          variant="solid"
          size="sm"
        >
          Detalji
        </Button>
      );
    }
  };

  return (
    <>
      <RoledMainMenu />
      <div className="container mx-auto mt-3 h-max lg:px-4">
        <Accordion variant="shadow" className="mb-3">
          <AccordionItem

          key={1} 
          aria-label="Nepotpisani-dokumenti" 
          title="Nepotpisani dokumenti" 
          startContent={<Chip color="danger" size="sm" variant="shadow">
                      {" "}
                      {unsignedDocumentDataCount}
                    </Chip>}
          >
          <Table
            removeWrapper
            isStriped
            isHeaderSticky
            aria-label="Tabela nepotpisanih dokumenta"
            classNames={{
              base: "max-h-[250px] overflow-y-auto",
              /* table: "min-h-[190px]", */
            }}
              >
                <TableHeader>
                  <TableColumn>#</TableColumn>
                  <TableColumn>Naziv</TableColumn>
                  <TableColumn>Inv.Broj</TableColumn>
                  <TableColumn>Razdužio/la</TableColumn>
                  <TableColumn>Zadužio/la</TableColumn>
                  <TableColumn>Akcija</TableColumn>
                </TableHeader>
                <TableBody emptyContent={"Sve prenosnice su skenirane do dodane"}>
                  {(unsignedDocumentData || []).map((document, index) => (
                    <TableRow key={index}>
                      <TableCell
                        className="min-w-fit whitespace-nowrap"
                        textValue={`broj-${index}`}
                      >
                        {document?.documentNumber}
                      </TableCell>
                      <TableCell
                        className="min-w-fit whitespace-nowrap"
                        textValue={`naziv-${index}`}
                      >
                        {document?.article?.stock?.name}
                      </TableCell>
                      <TableCell
                        className="min-w-fit whitespace-nowrap"
                        textValue={`Inventurni broj-${index}`}
                      >
                        {document?.article?.invNumber}
                      </TableCell>
                      <TableCell
                        className="min-w-fit whitespace-nowrap"
                        textValue={`predao-${index}`}
                      >
                        {document.articleTimelines?.[0]?.subbmited?.fullname ?? ''}
                      </TableCell>
                      <TableCell
                        className="min-w-fit whitespace-nowrap"
                        textValue={`preuzeo-${index}`}
                      >
                        {document.articleTimelines?.[0]?.user?.fullname ?? ''}
                      </TableCell>
                      <TableCell>
                      <Dropdown>
                        <DropdownTrigger>
                          <i
                            style={{ fontSize: "20px", cursor: "pointer", color: "darkgray" }}
                            className="bi bi-cloud-arrow-up-fill"
                          ></i>
                        </DropdownTrigger>
                        <DropdownMenu variant="faded" aria-label="Dropdown menu with icons">
                          <DropdownItem
                            key="new"
                            onClick={() => handleButtonClick(document.documentsId)}
                            startContent={<i className="bi bi-filetype-pdf"></i>}
                          >
                            Dodaj
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                        <form encType="multipart/form-data">
                          <input
                            id="dropzone-file"
                            type="file"
                            className="hidden"
                            onChange={(e) =>
                              handleFileUpload(
                                unsignedDocumentId!,
                                e.target.files![0],
                              )
                            }
                          />
                        </form>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          </AccordionItem>
        </Accordion>

        <Table
          aria-label="Article modal tabela"
          isHeaderSticky
          className="mb-3"
          classNames={{
            wrapper: "max-h-screen",
          }}
          topContent={
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
          }
          bottomContent={
            <div className="flex w-full justify-center">
              <Pagination
                showControls
                showShadow
                page={currentPage}
                total={totalPages}
                onChange={(page) => setCurrentPage(page)}
              />
            </div>
          }
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
            {(item) => (
              <TableRow key={item.documentsId}>
                <TableCell className="min-w-fit whitespace-nowrap">
                  {item.documentNumber}
                </TableCell>
                <TableCell className="min-w-fit whitespace-nowrap">
                  {item.article?.stock?.name}
                </TableCell>
                <TableCell className="min-w-fit whitespace-nowrap">
                  <Link
                    className="text-sm"
                    isBlock
                    showAnchorIcon
                    color="primary"
                    href={`#/admin/article/${item.article?.serialNumber}`}
                  >
                    {item.article?.serialNumber}
                  </Link>
                </TableCell>
                <TableCell className="min-w-fit whitespace-nowrap">
                  {item.article?.invNumber}
                </TableCell>
                <TableCell className="min-w-fit whitespace-nowrap">
                  {item.articleTimelines && item.articleTimelines.length > 0
                    ? item.articleTimelines[0].subbmited?.fullname
                    : null}
                </TableCell>
                <TableCell className="min-w-fit whitespace-nowrap">
                  {item.articleTimelines && item.articleTimelines.length > 0
                    ? item.articleTimelines[0].user?.fullname
                    : null}
                </TableCell>
                <TableCell className="min-w-fit whitespace-nowrap">
                  {dokumentAction(
                    item.signed_path!,
                    item.documentsId,
                    handleOpenModal,
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <Modal
          isOpen={isOpen}
          onClose={handleCloseModal}
          backdrop="blur"
          size="2xl"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>
                  {modalData.document?.article?.stock?.name}
                </ModalHeader>
                <ModalBody>
                  {modalData.document && (
                    <>
                      <div className="grid grid-cols-12 gap-2 ">
                        {modalData.document.articleTimelines &&
                          modalData.document.articleTimelines.length > 0 && (
                            <div className="col-span-4 flex h-[250px] w-full flex-col items-center justify-center p-3">
                              <div className="mb-3">
                                <Avatar
                                  className="h-20 w-20 text-large"
                                  isBordered
                                  showFallback
                                  name={combineFirstLetters(
                                    modalData.document.articleTimelines[0]
                                      ?.subbmited?.surname!,
                                    modalData.document.articleTimelines[0]
                                      ?.subbmited?.forname!,
                                  )}
                                />
                              </div>
                              <div className="text-center">
                                {
                                  modalData.document.articleTimelines[0]
                                    ?.subbmited?.fullname
                                }
                              </div>
                            </div>
                          )}
                        <div className="col-span-4 flex max-w-[100%] flex-col items-center justify-center text-center">
                          {modalData.document.article?.stock?.name}
                          <Progress
                            size="sm"
                            isIndeterminate
                            aria-label="Loading..."
                            className=" max-w-[80%] "
                          />
                          {modalData.document.article?.invNumber}
                        </div>
                        {modalData.document.articleTimelines &&
                          modalData.document.articleTimelines.length > 0 && (
                            <div className="col-span-4 flex max-h-[250px] w-full flex-col items-center justify-center p-3">
                              <div className="mb-3">
                                <Avatar
                                  className="h-20 w-20 text-large"
                                  isBordered
                                  showFallback
                                  name={combineFirstLetters(
                                    modalData.document.articleTimelines[0]?.user
                                      ?.surname!,
                                    modalData.document.articleTimelines[0]?.user
                                      ?.forname!,
                                  )}
                                />
                              </div>
                              <div className="text-center">
                                {
                                  modalData.document.articleTimelines[0]?.user
                                    ?.fullname
                                }
                              </div>
                            </div>
                          )}
                      </div>
                      <div>
                        Broj dokumenta: {modalData.document.documentNumber}
                      </div>
                      <div>
                        Datum i vrijeme kreiranja prenosnica:{" "}
                        {Moment(modalData.document.createdDate).format(
                          "DD.MM.YYYY. - HH:mm",
                        )}
                      </div>
                      <div className="cursor-pointer">
                        RAW prenosnica:
                        <Button
                          className="ml-2"
                          color="primary"
                          variant="faded"
                          startContent={
                            <i className="bi bi-file-earmark-word" />
                          }
                          onPress={() => saveFile(modalData.document?.path!)}
                        >
                          Preuzmi
                        </Button>
                      </div>
                      <div className="mb-3 flex cursor-pointer flex-nowrap items-center">
                        PDF prenosnica:
                        {modalData.document.signed_path === "" ? (
                          <div>test</div>
                        ) : (
                          <Button
                            className="ml-2"
                            color="danger"
                            variant="faded"
                            startContent={
                              <i className="bi bi-file-earmark-pdf" />
                            }
                            onPress={() =>
                              saveFile(modalData.document?.signed_path!)
                            }
                          >
                            Preuzmi
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </ModalBody>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
      <Toast
        variant={messageData.message.variant}
        message={messageData.message.message}
      />
      <AdminMenu />
    </>
  );
};

export default DocumentsPage;
