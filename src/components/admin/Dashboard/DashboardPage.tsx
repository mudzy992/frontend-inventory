import React, { useEffect, useState } from "react";
import { saveAs } from "file-saver";
import * as ExcelJS from "exceljs";
import StockType from "../../../types/UserArticleType";
import ArticleType from "../../../types/ArticleType";
import DocumentsType from "../../../types/DocumentsType";
import RoledMainMenu from "../../RoledMainMenu/RoledMainMenu";
import ArticleTimlineModal from "../../APP/ArticleTimeline/ArticleTimelinePageModal";
import AdminMenu from "../../SpeedDial/SpeedDial";
import moment from "moment";
import {
  Button,
  Card,
  CardFooter,
  CardHeader,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Link,
  Listbox,
  ListboxItem,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import Toast from "../../custom/Toast";
import { useApi } from "../../../API/api";

interface MessageType {
  message: {
    message: string;
    variant: string;
  };
}

// Funkcionalna komponenta AdminDashboardPage
const AdminDashboardPage: React.FC = () => {
  const { api } = useApi();
  const [stockData, setStock] = useState<StockType>();
  const [articleData, setArticle] = useState<ArticleType>();
  const [paginedArticleData, setPaginedArticle] = useState<ArticleType[]>();
  const [articleCurrentPage, setArticleCurrentPage] = useState<number>(1);
  const [articleItemsPerPage] = useState<number>(10);
  const [articleTotalPage, setArticleTotalPage] = useState<number>(0);
  const [articlePaginationTableQuery, setArticlePaginationTableQuery] = useState<string>("");
  const [unsignedDocumentData, setUnsignedDocument] = useState<DocumentsType[]>();
  const [unsignedDocumentDataCount, setUnsignedDocumentCount] = useState<number>();
  const [unsignedDocumentId, setUnsignedDocumentId] = useState<number>();
  const [open, setOpen] = React.useState(false);
  const [messageData, setMessage] = useState<MessageType>({ message: { message: "", variant: "" }});
  const [showModal, setShowModal] = useState(false);
  const [selectedArticleTimelineId, setSelectedArticleTimelineId] = useState<number | null>(null);
  const navigate = useNavigate();

  const setErrorMessage = (message: string, variant: string) => {
    setMessage((prev) => ({
      ...prev,
      message: { message, variant },
    }));
  };

  // useEffect hook koji se poziva nakon što se komponenta montira
  useEffect(() => {
    const fatchData = async () => {
      try {
        const stockResponse = await api(
          "/api/admin/dashboard/stock",
          "get",
          {},
          "administrator",
        );
        if (stockResponse.status === "login") {
          navigate("/login");
          return;
        }

        if (stockResponse.status === "error") {
          setErrorMessage(
            "Greška prilikom dohvaćanja posljednjeg artikla na skladištu",
            "danger",
          );
          return;
        }
        setStock(stockResponse.data);
      } catch (err) {
        setErrorMessage(
          "Greška prilikom dohvaćanja posljednjeg artikla na skladištu. Greška: " +
            err,
          "danger",
        );
      }

      try {
        fetchAllArticles()
      } catch (error) {
        setErrorMessage("Greška prilikom do" + error, "danger");
      }

      try {
        const unsignedDocumentResponse = await api(
          "/api/admin/dashboard/document/unsigned",
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
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = `/api/admin/dashboard/articles/s?perPage=${articleItemsPerPage}&page=${articleCurrentPage}&query=${encodeURIComponent(articlePaginationTableQuery)}`;
        const paginatedArticleResponse = await api(
          apiUrl,
          "get",
          {},
          "administrator",
        );

        if (paginatedArticleResponse.status === "login") {
          navigate("/login");
          return;
        }

        if (paginatedArticleResponse.status === "error") {
          setErrorMessage(
            "Greška prilikom dohvaćanja posljednjeg artikla na skladištu",
            "danger",
          );
          return;
        }

        setPaginedArticle(paginatedArticleResponse.data.results);
        const totalCount: number = paginatedArticleResponse.data.total;
        const totalPages: number = Math.ceil(totalCount / articleItemsPerPage);
        setArticleTotalPage(totalPages);
      } catch (error) {
        setErrorMessage(
          "Greška prilikom dohvaćanja artikala u tabelu. Greška: " + error,
          "danger",
        );
      }
    };

    fetchData();
  }, [articleCurrentPage, articleItemsPerPage, articlePaginationTableQuery]);

  const handleSearchChange = (query: string) => {
    setArticleCurrentPage(1);
    setArticlePaginationTableQuery(query);
  };

  const handleClick = () => {
    setOpen(true);
  };

  const fetchAllArticles = async () => {
    try {
      const apiUrl = `/api/admin/dashboard/articles`;
      const response = await api(apiUrl, "get", {}, "administrator");

      if (response.status === "login") {
        navigate("/login");
        return [];
      }

      if (response.status === "error") {
        setErrorMessage("Greška prilikom dohvaćanja artikala", "danger");
        return [];
      }
      setArticle(response.data)
      return response.data || [];
    } catch (error) {
      setErrorMessage(
        "Greška prilikom dohvaćanja artikala. Greška: " + error,
        "danger",
      );
      return [];
    }
  };

  const exportToExcel = async () => {
    const allArticles = await fetchAllArticles();
    const dataToExport = allArticles.map((article: any) => ({
      ID: article.articleId,
      Naziv: article.stock?.name || "",
      Serijski_broj: article.serialNumber || "",
      Inventurni_broj: article.invNumber || "",
      Korisnik: article.user?.fullname || "",
      Kategorija: article.category?.name || "",
      Status: article.status || "",
    }));

    // Stvaranje radnog lista
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");

    // Dodajte zaglavlje
    const headerRow = worksheet.addRow(Object.keys(dataToExport[0] || {}));
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
    });

    // Dodajte podatke
    dataToExport.forEach((data: any) => {
      worksheet.addRow(Object.values(data));
    });

    // Stvaranje binarnih podataka radne knjige
    const excelBuffer = await workbook.xlsx.writeBuffer();
    const currentDate = moment();
    const formattedDate = currentDate.format("DD.MM.YYYY");
    // Spašavanje datoteke
    saveAs(
      new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      }),
      `Oprema-${formattedDate}.xlsx`,
    );
  };

  const handleButtonClick = (documentId: any) => {
    const fileInput = document.getElementById("dropzone-file");
    if (fileInput) {
      fileInput.click();
    }
    setUnsignedDocumentId(documentId)
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
      handleClick();
    } catch (error) {
      setErrorMessage(
        "Greška prilikom uploada dokumenta. Greška: " + error,
        "danger",
      );
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
      <div className="container mx-auto mt-3 h-max lg:px-4">
        <div className="mb-14 flex flex-col">
          <div className="lg:flex lg:flex-row">
            <div className="mb-3 w-full lg:mr-3 lg:w-1/2">
              <Card>
                <CardHeader className="bg-default-100">
                  Posljednje dodani artikal na skladište
                </CardHeader>
                <Listbox
                  key={1 - 0}
                  aria-label="Posljednje dodani artikal na skladište"
                  className="w-[90%]"
                >
                  <ListboxItem key={1} textValue={stockData?.name}>
                    Naziv: {stockData?.name}
                  </ListboxItem>
                  <ListboxItem key={2} textValue={stockData?.name}>
                    Kategorija: {stockData?.category?.name}
                  </ListboxItem>
                  <ListboxItem
                    key={3}
                    textValue={stockData?.valueAvailable?.toString()}
                  >
                    Dostupno: {stockData?.valueAvailable}
                  </ListboxItem>
                  <ListboxItem key={4} textValue={stockData?.contract}>
                    Ugovor: {stockData?.contract}
                  </ListboxItem>
                  <ListboxItem key={5} textValue={stockData?.sapNumber}>
                    SAP broj: {stockData?.sapNumber}
                  </ListboxItem>
                </Listbox>
                <CardFooter className="flex justify-end">
                  <Button
                    color="warning"
                    variant="shadow"
                    onClick={() =>
                      navigate(`/admin/stock/${stockData?.stockId}`)
                    }
                    size="sm"
                  >
                    Zaduži
                  </Button>
                </CardFooter>
              </Card>
            </div>
            <div className="max-h-[280px] w-full rounded-2xl bg-default-50 p-2 shadow">
              <div className="mb-3 rounded-lg bg-default-100 p-2 ">
                <span>Nepotpisani dokumenti</span>{" "}
                <Chip color="danger" variant="shadow">
                  {" "}
                  {unsignedDocumentDataCount}
                </Chip>
              </div>
              <Table
                hideHeader
                removeWrapper
                isStriped
                aria-label="Tabela nepotpisanih dokumenta"
                classNames={{
                  base: "max-h-[210px] overflow-y-auto",
                  /* table: "min-h-[190px]", */
                }}
              >
                <TableHeader>
                  <TableColumn>Naziv</TableColumn>
                  <TableColumn>Inv.Broj</TableColumn>
                  <TableColumn>Korisnik</TableColumn>
                  <TableColumn>Dodaj</TableColumn>
                </TableHeader>
                <TableBody>
                  {(unsignedDocumentData || []).map((document, index) => (
                    <TableRow key={index}>
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
                        textValue={`Korisnik-${index}`}
                      >
                        {document?.article?.user?.fullname}
                      </TableCell>
                      <TableCell>
                      <Dropdown>
                        <DropdownTrigger>
                          <i style={{fontSize:"20px", cursor:"pointer", color:"darkgray"}} className="bi bi-cloud-arrow-up-fill"></i>
                        </DropdownTrigger>
                        <DropdownMenu variant="faded" aria-label="Dropdown menu with icons">
                          <DropdownItem
                          key="new"
                          onClick={()=> handleButtonClick(document.documentsId)}
                          startContent={<i className="bi bi-filetype-pdf"></i>}
                          >
                            {" "}
                            Dodaj
                            
                          </DropdownItem>
                          <DropdownItem
                          key="timeline"
                          onClick={(event) => {
                            const firstArticleTimeline =
                              document.articleTimelines?.[0];
                            if (
                              firstArticleTimeline?.articleTimelineId !==
                              undefined
                            ) {
                              openModalWithArticle(
                                firstArticleTimeline.articleTimelineId,
                              );
                            }
                          }}
                          startContent={<i className="bi bi-clock-history"></i>}
                          >
                            {" "}
                            Timeline
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
            </div>
          </div>

          <div className="xs:w-full rounded-2xl bg-default-50 p-2 shadow">
            <div className="mb-3 rounded-lg bg-default-100 p-2">
              Svi artikli
            </div>
            <div className="mb-3 flex flex-row items-center gap-3">
              <div className="w-full">
                <Input
                  placeholder="Pronađi artikal..."
                  variant="bordered"
                  isClearable
                  startContent={<i className="bi bi-search text-default-500" />}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === "Enter") {
                      const target = e.target as HTMLInputElement;
                      handleSearchChange(target.value);
                    }
                  }}
                />
              </div>
              <div>
                <Button
                  onClick={() => exportToExcel()}
                  variant="shadow"
                  color="success"
                  className="h-[52px]"
                  startContent={
                    <i
                      className="bi bi-filetype-xlsx"
                      style={{ fontSize: "25px" }}
                    />
                  }
                />
              </div>
            </div>
            <div className="w-full">
              <Table selectionMode="single" aria-label="Tabela artikala">
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
                      <TableCell className="min-w-fit whitespace-nowrap">
                        <Link
                          className="text-sm"
                          showAnchorIcon
                          href={`#/admin/article/${artikal?.serialNumber}`}
                        >
                          {artikal?.stock?.name}{" "}
                        </Link>
                      </TableCell>
                      <TableCell className="min-w-fit whitespace-nowrap">
                        {artikal?.serialNumber}
                      </TableCell>
                      <TableCell className="min-w-fit whitespace-nowrap">
                        {artikal?.invNumber}
                      </TableCell>
                      <TableCell className="min-w-fit whitespace-nowrap">
                        {artikal?.category?.name}
                      </TableCell>
                      <TableCell className="min-w-fit whitespace-nowrap">
                        <Link
                          className="text-sm"
                          showAnchorIcon
                          href={`#/user/profile/${artikal?.userId}`}
                        >
                          {artikal?.user?.fullname}
                        </Link>
                      </TableCell>
                      <TableCell className={`status-${artikal?.status}`}>
                        {artikal?.status}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-3 flex justify-center">
              <Pagination
                color="default"
                showControls
                variant="flat"
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
      <Toast
        variant={messageData.message.variant}
        message={messageData.message.message}
      />
      <AdminMenu />
    </div>
  );
};

export default AdminDashboardPage;
