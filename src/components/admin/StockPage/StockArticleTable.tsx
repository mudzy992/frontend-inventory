import React, { FC, useEffect, useMemo, useState } from "react";
import MaterialReactTable, { MRT_ColumnDef } from "material-react-table";
import { Button, Dropdown } from "react-bootstrap";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { saveAs } from 'file-saver';
import { Card, Link } from "@mui/material";
import api from "../../../API/api";
import { ApiConfig } from "../../../config/api.config";
import Moment from 'moment';
import ArticleType from "../../../types/ArticleType";

interface TabelaProps {
  stockId: number;
}

const StockArticleTable: FC<TabelaProps> = ({ stockId }) => {
  const [data, setData] = useState<ArticleType[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);

  const fetchData = async (page: number, perPage: number) => {
    const offset = (page - 1) * perPage;
    try {
      const response = await api(`api/article/s/${stockId}/?perPage=${perPage}&offset=${offset}`, 'get', {}, 'administrator');

      if (response.status === 'error') {
        setErrorMessage('Greška prilikom učitavanja vremenske linije artikla. Osvježite stranicu ili pokušajte ponovo kasnije');
        setData([]);
        return;
      }

      const articleTimelines = response.data.results as ArticleType[];
      setData(articleTimelines);
      setTotalResults(response.data.total || 0); // Postavi ukupan broj rezultata iz odgovora
    } catch (error) {
      console.error("Greška (Stock Article Table):", error);
      setData([]);
      setTotalResults(0);
    }
  };

  useEffect(() => {
    fetchData(currentPage, itemsPerPage);
  }, [stockId, currentPage, itemsPerPage]);

  const columns = useMemo<MRT_ColumnDef[]>(
    () => [
      {
        accessorKey: "user.fullname",
        header: "Korisnik",
        Cell: ({ cell }) => {
          const row = cell.row.original as ArticleType;
          const userId = row && row.user?.userId;

          if (userId) {
            return (
              <Link href={`#/admin/user/${userId}`} style={{ textDecoration: 'none', fontWeight: 'bold' }}>
                {cell.getValue<string>()}
              </Link>
            );
          }

          return null;
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        Cell: ({ cell }) => cell.getValue<string>(),
      },
      {
        accessorKey: "comment",
        header: "Komentar",
        Cell: ({ cell }) => cell.getValue<string>(),
      },
      {
        accessorKey: "serialNumber",
        header: "Serijski broj",
        Cell: ({ cell }) => {
          const articleTimeline = cell.row.original as ArticleType;
          const linkUrl = `#/admin/user/${articleTimeline.serialNumber}`;
          return (
            <Link href={linkUrl} style={{ textDecoration: 'none', fontWeight: 'bold' }}>
              {cell.getValue<string>()}
            </Link>
          );
        },
      },
      {
        accessorKey: "invNumber",
        header: "Inventurni broj",
        Cell: ({ cell }) => cell.getValue<string>(),
      },
      {
        accessorKey: "timestamp",
        header: "Vrijeme akcije",
        Cell: ({ cell }) => Moment(cell.getValue<string>()).format('DD.MM.YYYY. - HH:mm'),
      },
      {
        accessorKey: "documentId",
        header: "Dokument",
        Cell: ({ cell }) => {
          const docId = cell.getValue<number>();
          const [docPath, setDocPath] = useState<string | null>(null);

          useEffect(() => {
            const fetchData = async () => {
              try {
                const response = await api(`api/document/${docId}`, 'get', {}, 'administrator');
                const data = response.data;
                const path = data.path;
                setDocPath(path);
              } catch (error) {
                console.error("Greška (Stock Article Table - Documents):", error);
              }
            };

            fetchData();
          }, [docId]);

          if (docPath === null) {
            return (
              <div>
                <Link>
                  <OverlayTrigger
                    placement="top"
                    delay={{ show: 250, hide: 400 }}
                    overlay={
                      <Tooltip id="tooltip-prenosnica">Prenosnica nije generisana</Tooltip>
                    }
                  >
                    <i className="bi bi-file-earmark-text" style={{ fontSize: 22, color: "red" }} />
                  </OverlayTrigger>
                </Link>
              </div>
            );
          }

          const savedFile = () => {
            saveAs(ApiConfig.TEMPLATE_PATH + `${docPath}`, docPath);
          };

          return (
            <Link onClick={savedFile}>
              <i className="bi bi-file-earmark-text" style={{ fontSize: 22, color: "#008b02", cursor: "pointer" }} />
            </Link>
          );
        },
      },
    ],
    []
  );

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchData(newPage, itemsPerPage);
  };

  // Provjerite da li postoje prethodne i sljedeće stranice
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage * itemsPerPage < totalResults;

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  if (errorMessage) {
    return <div>{errorMessage}</div>;
  }

  return (
    <>
    <Card>    
      <MaterialReactTable
        columns={columns}
        data={data}
        enablePagination={true}
      />

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "5px", padding: '5px' }}>
        <Button onClick={() => handlePageChange(currentPage - 1)} disabled={!hasPreviousPage}>
          Prethodna stranica
        </Button>
        <Button onClick={() => handlePageChange(currentPage + 1)} disabled={!hasNextPage}>
          Sljedeća stranica
        </Button>
        <Dropdown>
          <Dropdown.Toggle variant="success" id="dropdown-basic">
            {itemsPerPage} rezultata po stranici
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => handleItemsPerPageChange(5)}>5</Dropdown.Item>
            <Dropdown.Item onClick={() => handleItemsPerPageChange(10)}>10</Dropdown.Item>
            <Dropdown.Item onClick={() => handleItemsPerPageChange(20)}>20</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
      </Card>
    </>
  );
};

export default StockArticleTable;
