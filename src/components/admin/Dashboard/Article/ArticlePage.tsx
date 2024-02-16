import React, { useEffect, useState } from "react"
import RoledMainMenu from "../../../RoledMainMenu/RoledMainMenu"
import AdminMenu from "../../AdminMenu/AdminMenu"
import ArticleType from "../../../../types/ArticleType"
import { useNavigate } from "react-router-dom"
import api from "../../../../API/api"
import { saveAs } from "file-saver";
import * as ExcelJS from "exceljs";
import moment from "moment";
import { Button, Card, CardBody, Input, Link, Listbox, ListboxItem, Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react"

interface MessageType {
    message: {
      message: string;
      variant: string;
    };
  }

  interface CategoryCount {
    [key: string]: number;
  }
  
  interface OrganizationCount {
    [key: string]: number;
  }

const ArticlePage: React.FC = () => {
    const [articleDate, setArticleData] = useState<ArticleType>()
    const [totalArticles, setTotalArticles] = useState(0);
    const [categoryCount, setCategoryCount] = useState<{[key: string]: number}>({});
    const [organizationCount, setOrganizationCount] = useState<{[key: string]: number}>({});
    const [paginedArticleData, setPaginedArticle] = useState<ArticleType[]>();
    const [articleCurrentPage, setArticleCurrentPage] = useState<number>(1);
    const [articleItemsPerPage] = useState<number>(10);
    const [articleTotalPage, setArticleTotalPage] = useState<number>(0);
    const [articlePaginationTableQuery, setArticlePaginationTableQuery] = useState<string>("");

    const navigate = useNavigate();
    const [messageData, setMessage] = useState<MessageType>({
        message: { message: "", variant: "" },
      });
    const setErrorMessage = (message: string, variant: string) => {
        setMessage((prev) => ({
          ...prev,
          message: { message, variant },
        }));
    };

    useEffect(() => {
        fetchAllArticles()
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
      
          // Izračunavanje ukupnog broja artikala
          const totalArticles = response.data.length;
      
          // Mapiranje kategorija i organizacija sa brojem artikala
            const categoryCount: CategoryCount = {};
            const organizationCount: OrganizationCount = {};
      
            response.data.forEach((article: any) => {
                // Brojanje kategorija
                const category = article.category.name;
                if (categoryCount[category]) {
                  categoryCount[category]++;
                } else {
                  categoryCount[category] = 1;
                }
          
                // Brojanje organizacija
                const organization = article.user.organization.name;
                if (organizationCount[organization]) {
                  organizationCount[organization]++;
                } else {
                  organizationCount[organization] = 1;
                }
              });
      
            setTotalArticles(totalArticles);
            setCategoryCount(categoryCount);
            setOrganizationCount(organizationCount);
      
          setArticleData(response.data);
      
          return response.data || [];
        } catch (error) {
          setErrorMessage(
            "Greška prilikom dohvaćanja artikala. Greška: " + error,
            "danger"
          );
          return [];
        }
      };
      

      const handleSearchChange = (query: string) => {
        setArticleCurrentPage(1);
        setArticlePaginationTableQuery(query);
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
          Organizacija: article.user.organization.name || "",
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

    return (
        <div>
            <><RoledMainMenu />
            <div className="container mx-auto mt-3 h-max lg:px-4 gap-2">
            <div>
                <Card>
                    <CardBody>
                    <div>
                        <h2>Ukupan broj artikala: {totalArticles}</h2>
                        <h3>Broj artikala po kategorijama:</h3>
                        <ul>
                        {Object.keys(categoryCount).map((category) => (
                            <li key={category}>
                            {category}: {categoryCount[category]}
                            </li>
                        ))}
                        </ul>
                        <h3>Broj artikala po organizacijama:</h3>
                        <ul>
                        {Object.keys(organizationCount).map((organization) => (
                            <li key={organization}>
                            {organization}: {organizationCount[organization]}
                            </li>
                        ))}
                        </ul>
                    </div>

                    </CardBody>
                </Card>
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
                  <TableColumn>Organizacija</TableColumn>
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
                      <TableCell className={`organizacija-${artikal?.user?.organization?.name}`}>
                        {artikal?.user?.organization?.name}
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
    <AdminMenu />
    </>
    </div>
    )
}

export default ArticlePage