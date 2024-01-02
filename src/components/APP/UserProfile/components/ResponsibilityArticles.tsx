import React from 'react'
import ArticleType from '../../../../types/ArticleType'
import { Accordion, AccordionItem, Button, Link, Popover, PopoverContent, PopoverTrigger, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@nextui-org/react'
import { ApiConfig } from '../../../../config/api.config'
import saveAs from "file-saver";
import UserType from '../../../../types/UserType';

type ArticleProps = {
    data: UserType
}
const ResponsibilityArticles:React.FC<ArticleProps> = ({data}) => {

    if (!data) {
        return <div>Loading...</div>;
    }
    const uniqueCategories = Array.from(new Set(data.articles?.map((article) => article.category?.name)));

    return (
        <Accordion variant="splitted">
            {uniqueCategories.map((categoryName, index) => {
              const categoryArticles = data.articles?.filter((article:any) => article.category?.name === categoryName);
      
              return (
                <AccordionItem key={categoryName} aria-label={`Accordion ${index + 1}`} title={categoryName}>
                  <Table aria-label={`Tabela-artikala-${index}`} hideHeader removeWrapper isStriped>
                    <TableHeader>
                      <TableColumn>Naziv</TableColumn>
                      <TableColumn>Serijski broj</TableColumn>
                      <TableColumn>Inventurni broj</TableColumn>
                      <TableColumn>Dokument</TableColumn>
                    </TableHeader>
                    <TableBody>
                    {categoryArticles?.map((article: ArticleType) => (
                            <TableRow key={article.articleId}>
                                <TableCell>{article.stock?.name || 'N/A'}</TableCell>
                                <TableCell>
                                    <Link href={`#/admin/article/${article.serialNumber}`}>{article.serialNumber}</Link>
                                </TableCell>
                                <TableCell>{article.invNumber || 'N/A'}</TableCell>
                                <TableCell>{saveFile(article.documents ? article.documents[0]?.path : 'N/A')}</TableCell>
                            </TableRow>
                        )) || []}
                    </TableBody>
                  </Table>
                </AccordionItem>
              );
            })}
          </Accordion>
    )
}

function saveFile (docPath: any) {
    if(!docPath) {
        return (
            <div>
                <Popover placement='right' showArrow backdrop="blur">
                <PopoverTrigger>
                    <Button size='sm' style={{ backgroundColor: "#9D5353" }}>
                        <i className="bi bi-file-earmark-text" style={{ fontSize: 20, color: "white" }} />
                </Button>
            </PopoverTrigger>
            <PopoverContent>
                    Prenosnica nije generisana
                </PopoverContent>
            </Popover>
            </div>
            )
    }
    if (docPath) {
        const savedFile = (docPath:any) => {
            saveAs(
                ApiConfig.TEMPLATE_PATH + docPath,
                docPath
            );
        }
        return (
            <Button size='sm' style={{backgroundColor:"#3A6351"}} onClick={() => savedFile(docPath)}>
            <i className="bi bi-file-earmark-text" style={{ fontSize: 20, color:"white" }}/></Button>
        )
    }
}

export default ResponsibilityArticles