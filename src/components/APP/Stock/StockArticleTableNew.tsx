import { FC, useEffect, useState } from "react";
import api from "../../../API/api";
import Moment from "moment";
import { ApiConfig } from "../../../config/api.config";
import saveAs from "file-saver";
import {
  Button,
  Chip,
  ChipProps,
  Input,
  Table,
  Pagination,
  Link,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";

interface StockTableProps {
  stockId: number;
}

interface ResponsibilityArticleBaseType {
  serialNumber: string;
  invNumber: string;
  status: "zaduženo" | "razduženo" | "otpisano";
  timestamp: string;
  articleId: number;
  user?: {
    userId: number;
    fullname: string;
  };
  documents?: {
    path: string;
  }[];
  // Unija tipova za user i documents
  additionalProperties?:
    | string
    | number
    | { userId: number; fullname: string }
    | { documents?: { path: string }[] };
}

const statusColorMap: Record<
  string,
  { color: ChipProps["color"]; startContent: string }
> = {
  zaduženo: { color: "success", startContent: "bi bi-check-circle" },
  razduženo: { color: "warning", startContent: "bi bi-exclamation-circle" },
  otpisano: { color: "warning", startContent: "bi bi-x-circle" },
};

const ArticleInStockTable: FC<StockTableProps> = ({ stockId }) => {
  const [userArticleData, setUserArticleData] = useState<
    ResponsibilityArticleBaseType[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [itemsPerPage] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    stockArticleData();
  }, [stockId, itemsPerPage, currentPage]);

  const stockArticleData = async () => {
    setIsLoading(true);
    try {
      const res = await api(
        `api/article/s/${stockId}?perPage=${itemsPerPage}&page=${currentPage}&query=${searchQuery}`,
        "get",
        {},
        "administrator",
      );

      if (res.status === "error") {
        console.error(
          "Greška prilikom dohvaćanja dodatnih podataka:",
          res.data,
        );
      } else if (res.status === "login") {
        console.log("Korisnik nije prijavljen.");
      } else {
        setUserArticleData(res.data.results);
        setTotalResults(Math.max(0, res.data.total));
      }
    } catch (error) {
      console.error("Greška pri dohvaćanju podataka:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      setCurrentPage(1);
      stockArticleData();
    }
  };

  const saveFile = (path: string) => {
    saveAs(ApiConfig.TEMPLATE_PATH + path, path);
  };

  const totalPages = Math.ceil(totalResults / itemsPerPage);

  return (
    <div>
      <div className="mb-3">
        
      </div>
      <Table
        aria-label="Article modal tabela"
        isHeaderSticky
        className="mb-3"
        removeWrapper
        topContent={
          <Input
          variant="bordered"
          type="search"
          startContent={<i className="bi bi-search text-default-500" />}
          isClearable
          placeholder="Pronađi artikal..."
          value={searchQuery}
          onClear={() => setSearchQuery("")}
          onValueChange={(value) => setSearchQuery(value || "")}
          onKeyDown={handleKeyPress}
        />
        }
        bottomContent={
          <div className="flex justify-center">
          <Pagination
          showControls
          showShadow
          page={currentPage}
          total={totalPages}
          onChange={(page) => setCurrentPage(page)}
        />
        </div>
        }
        classNames={{
          wrapper: "max-h-[382px]",
        }}
      >
        <TableHeader>
          <TableColumn key="fullname">Ime i prezime</TableColumn>
          <TableColumn key="sapNumber">Serijski broj</TableColumn>
          <TableColumn key="invNumber">Inventurni broj</TableColumn>
          <TableColumn key="timestamp">Status</TableColumn>
          <TableColumn key="status">Datum akcije</TableColumn>
          <TableColumn className="flex justify-center items-center" key="path">Datum akcije</TableColumn>
        </TableHeader>
        <TableBody items={userArticleData}>
          {(item) => {
            const { color, startContent } = statusColorMap[item.status];
            return userArticleData.length > 0 ? (
              <TableRow key={item.serialNumber}>
                <TableCell
                  className="min-w-fit whitespace-nowrap"
                  key={item.user?.fullname}
                >
                  <Link isBlock showAnchorIcon className="text-sm" href={`#/user/profile/${item.user?.userId}`}>
                    {item.user?.fullname}
                  </Link>
                </TableCell>
                <TableCell
                  className="min-w-fit whitespace-nowrap"
                  key={item.serialNumber}
                >
                  <Link isBlock showAnchorIcon className="text-sm" href={`#/admin/article/${item.serialNumber}`}>
                    {item.serialNumber}
                  </Link>
                </TableCell>
                <TableCell
                  className="min-w-fit whitespace-nowrap"
                  key={item.invNumber}
                >
                  {item.invNumber}
                </TableCell>
                <TableCell
                  className="min-w-fit whitespace-nowrap"
                  key={item.status}
                >
                  <Chip
                    size="sm"
                    color={color}
                    variant="shadow"
                    startContent={<i className={startContent}></i>}
                  >
                    {" "}
                    {item.status}
                  </Chip>
                </TableCell>
                <TableCell
                  className="min-w-fit whitespace-nowrap"
                  key={item.timestamp}
                >
                  {Moment(item.timestamp).format("DD.MM.YYYY. - HH:mm")}
                </TableCell>
                <TableCell className="flex justify-center" key="path">
                    <Button
                      size="sm"
                      color="primary"
                      isDisabled={item.documents && item.documents.length < 0}
                      startContent={<i className="bi bi-download" />}
                      onClick={() =>
                        item.documents &&
                        item.documents.length > 0 &&
                        saveFile(item.documents[0]?.path)
                      }
                    >
                      Prenosnica
                    </Button>
                </TableCell>
              </TableRow>
            ) : (
              <TableRow key={"nema"}>
                <TableCell
                  className="min-w-fit whitespace-nowrap"
                  key="artikala"
                  colSpan={5}
                >
                  Nema artikala
                </TableCell>
              </TableRow>
            );
          }}
        </TableBody>
      </Table>
    </div>
  );
};

export default ArticleInStockTable;
