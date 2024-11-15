import { FC, useCallback, useEffect, useState } from "react";
import api from "../../../API/api";
import Moment from "moment";
import {
  Link,
  Button,
  ChipProps,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Chip,
  Spinner,
} from "@nextui-org/react";

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
  [key: string]:
    | string
    | number
    | { userId: number; fullname: string }
    | undefined;
}

interface ArticleModalProps {
  show: boolean;
  onHide: () => void;
  stockId: number;
}

const statusColorMap: Record<
  string,
  { color: ChipProps["color"]; startContent: string }
> = {
  zaduženo: { color: "success", startContent: "bi bi-check-circle" },
  razduženo: { color: "warning", startContent: "bi bi-exclamation-circle" },
  otpisano: { color: "warning", startContent: "bi bi-x-circle" },
};

const ArticleModal: FC<ArticleModalProps> = ({ show, onHide, stockId }) => {
  const [articleData, setArticleData] = useState<
    ResponsibilityArticleBaseType[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalResults / itemsPerPage);

  const stockArticleData = useCallback(async () => {
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
        setArticleData(res.data.results);
        setTotalResults(res.data.total);
      }
    } catch (error) {
      console.error("Greška pri dohvaćanju podataka:", error);
    } finally {
      setIsLoading(false);
    }
  }, [stockId, itemsPerPage, currentPage, searchQuery]); 

  useEffect(() => {
    if (show) {
      stockArticleData(); 
    } else {
      setArticleData([]);
      setSearchQuery("");
      setCurrentPage(1);
    }
  }, [show, stockArticleData]); 

  

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      setCurrentPage(1);
      stockArticleData();
    }
  };

  return (
    <Modal isOpen={show} onClose={onHide} size="4xl" backdrop="blur">
      <ModalContent>
        <ModalHeader>Detalji zaduženja </ModalHeader>
        <ModalBody>
          {isLoading ? (
            <div><Spinner label="Učitavanje..." color="warning" /></div>
          ) : (
            <>
              <Table
                aria-label="Article modal tabela"
                isHeaderSticky
                removeWrapper
                topContent={
                  <Input
                    variant="bordered"
                    type="search"
                    isClearable
                    startContent={
                      <i className="bi bi-search text-default-500" />
                    }
                    placeholder="Pronađi artikal..."
                    value={searchQuery}
                    onClear={() => setSearchQuery("")}
                    onValueChange={(value) => setSearchQuery(value || "")}
                    onKeyDown={handleKeyPress}
                  />
                }
              >
                <TableHeader>
                  <TableColumn key="fullname">Ime i prezime</TableColumn>
                  <TableColumn key="sapNumber">Serijski broj</TableColumn>
                  <TableColumn key="invNumber">Inventurni broj</TableColumn>
                  <TableColumn key="timestamp">Status</TableColumn>
                  <TableColumn key="status">Datum akcije</TableColumn>
                </TableHeader>
                <TableBody items={articleData}>
                  {(item) => {
                    const { color, startContent } = statusColorMap[item.status];
                    return articleData.length > 0 ? (
                      <TableRow key={item.serialNumber}>
                        <TableCell
                          className="min-w-fit whitespace-nowrap"
                          key={item.user?.fullname}
                        >
                          <Link
                            isBlock
                            showAnchorIcon
                            className="text-sm"
                            href={`#/user/profile/${item.user?.userId}`}
                          >
                            {item.user?.fullname}
                          </Link>
                        </TableCell>
                        <TableCell
                          className="min-w-fit whitespace-nowrap"
                          key={item.serialNumber}
                        >
                          <Link
                            isBlock
                            showAnchorIcon
                            className="text-sm"
                            href={`#/admin/article/${item.serialNumber}`}
                          >
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
                            color={color}
                            size="sm"
                            variant="flat"
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
                      </TableRow>
                    ) : (
                      <TableRow>
                        <TableCell
                          className="min-w-fit whitespace-nowrap"
                          colSpan={5}
                        >
                          Nema artikala
                        </TableCell>
                      </TableRow>
                    );
                  }}
                </TableBody>
              </Table>

              {totalPages <= 1 ? (
                <div></div>
              ) : (
                <div className="flex justify-center">
                  <Pagination
                    showControls
                    showShadow
                    page={currentPage}
                    total={totalPages}
                    size="sm"
                    onChange={(page) => setCurrentPage(page)}
                  />
                </div>
              )}
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button size="sm" color="success" onClick={onHide}>
            Zatvori
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ArticleModal;
