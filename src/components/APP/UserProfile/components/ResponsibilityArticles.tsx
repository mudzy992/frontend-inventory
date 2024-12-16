import React, { useEffect, useState } from "react";
import ArticleType from "../../../../types/ArticleType";
import {
  Accordion,
  AccordionItem,
  Button,
  Link,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { ApiConfig } from "../../../../config/api.config";
import saveAs from "file-saver";
import { useUserContext } from "../../../UserContext/UserContext";
import api, { ApiResponse } from "../../../../API/api";
import { useNavigate } from "react-router-dom";
import DocumentsType from "../../../../types/DocumentsType";

interface UserProps {
  userID: number;
}

const ResponsibilityArticles: React.FC<UserProps> = ({userID}) => {
  const [data, setArticles] = useState<ArticleType[]>([])
  const {role} = useUserContext();
  const [loading, setLoading] = useState<boolean>(false)
  const navigate = useNavigate();
  
  const getArticleData = async () => {
    try{
      setLoading(true);
      const res: ApiResponse = await api(`api/article/user/${userID}`, 'get', undefined, role)

      if (res.status === "error" || res.status === "login") {
        return navigate("/login");
      }

      if (res.status === 'ok'){
        setArticles(res.data)
      }
    } catch (error){
      console.error("Greška prilikom dohvatanja korisničkih podataka:", error);
      throw error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if(userID){
      getArticleData()
    }
  }, [userID])

  if (!data) {
    return <div>Loading...</div>;
  }
  const uniqueCategories = Array.from(
    new Set(data.map((article) => article.category?.name)),
  );

  return (
    <Accordion variant="splitted">
      {uniqueCategories.map((categoryName, index) => {
        const categoryArticles = data.filter(
          (article: any) => article.category?.name === categoryName,
        );

        return (
          <AccordionItem
            key={categoryName}
            aria-label={`Accordion ${index + 1}`}
            title={categoryName}
          >
            <Table
              aria-label={`Tabela-artikala-${index}`}
              hideHeader
              removeWrapper
              isStriped
            >
              <TableHeader>
                <TableColumn>Naziv</TableColumn>
                <TableColumn>Serijski broj</TableColumn>
                <TableColumn>Inventurni broj</TableColumn>
                <TableColumn>Dokument</TableColumn>
              </TableHeader>
              <TableBody>
                {categoryArticles?.map((article: ArticleType) => (
                  <TableRow key={article.articleId}>
                    <TableCell>{article.stock?.name || "N/A"}</TableCell>
                    <TableCell>
                      <Link href={`#/admin/article/${article.serialNumber}`}>
                        {article.serialNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{article.invNumber || "N/A"}</TableCell>
                    <TableCell>
                      {saveFile(
                        article.documents ? article.documents : [],
                      )}
                    </TableCell>
                  </TableRow>
                )) || []}
              </TableBody>
            </Table>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};

function saveFile(documents: DocumentsType[]) {
  let pdfDocument = documents[0].signed_path
  let docxDocument = documents[0].path
  const savedFile = (docPath : any) => {
    saveAs(ApiConfig.TEMPLATE_PATH + docPath, docPath);
  }
  if (!documents) {
    return (
      <div>
        <Popover placement="right" showArrow backdrop="blur">
          <PopoverTrigger>
            <Button size="sm" className={'bg-color: red'}>
              <i
                className="bi bi-file-earmark-text"
                style={{ fontSize: 20, color: "white" }}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent>Prenosnica nije generisana</PopoverContent>
        </Popover>
      </div>
    );
  }

  if(pdfDocument){
    return(
      <Button
        size="sm"
        style={{ backgroundColor: "#9D5353" }}
        onClick={() => savedFile(pdfDocument)}
      >
        <i
          className="bi bi-file-earmark-text"
          style={{ fontSize: 20, color: "white" }}
        />
      </Button>
      )
  } else {
    return(
      <Button
          size="sm"
          style={{ backgroundColor: "#3A6351" }}
          onClick={() => savedFile(docxDocument)}
        >
          <i
            className="bi bi-file-earmark-text"
            style={{ fontSize: 20, color: "white" }}
          />
        </Button>
    )
  }
  
}

export default ResponsibilityArticles;
