import { FC, useEffect, useMemo, useState } from "react";
import api from "../../../API/api"; 
import Moment from "moment";
import { Link, Badge, Button, ChipProps, Input, Modal, ModalBody, ModalContent, 
  ModalFooter, ModalHeader, Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";

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
  [key: string]: string | number | { userId: number; fullname: string } | undefined;
}


interface ArticleModalProps {
  show: boolean;
  onHide: () => void;
  stockId: number;
}

const statusColorMap: Record<string, ChipProps["color"]> = {
  zaduženo: "success",
  razduženo: "danger",
  otpisano: "warning",
};

const ArticleModal: FC<ArticleModalProps> = ({ show, onHide, stockId }) => {
  const [articleData, setArticleData] = useState<ResponsibilityArticleBaseType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const itemsPerPage = 5;
  const totalPages = Math.ceil(totalResults / itemsPerPage);

  const items = useMemo(() => {
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;

  return articleData.slice(start, end);
}, [currentPage, itemsPerPage, articleData]);


  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await api(`api/article/s/${stockId}?perPage=${itemsPerPage}&page=${currentPage}&query=${searchQuery}`, "get", {}, "administrator");
  
        if (res.status === "error") {
          console.error("Greška prilikom dohvaćanja dodatnih podataka:", res.data);
        } else if (res.status === "login") {
          console.log("Korisnik nije prijavljen.");
        } else {
          setArticleData(prevData => [...prevData, ...res.data.results]);
          setTotalResults(res.data.total);
        }
      } catch (error) {
        console.error("Greška pri dohvaćanju podataka:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    if (show) {
      fetchData();
    } else {
      setArticleData([])
      setSearchQuery("")
    }
  }, [show, stockId, itemsPerPage, currentPage, searchQuery]);
 
  const handleSearch = () => {
    setIsLoading(true);
    api(`api/article/s/${stockId}?perPage=${itemsPerPage}&page=${currentPage}&query=${searchQuery}`, "get", {}, "administrator")
      .then((res) => {
        if (res.status === "error") {
          console.error("Greška prilikom pretrage:", res.data);
        } else {
          setArticleData(res.data.results);
          setTotalResults(res.data.total);
        }
      })
      .catch((error) => {
        console.error("Greška pri dohvaćanju podataka:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
};

  return (
    <Modal isOpen={show} onClose={onHide} size="4xl" backdrop="blur">
      <ModalContent>
        <ModalHeader>Detalji zaduženja</ModalHeader>
        <ModalBody >
        <div>
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
            </TableHeader>
            <TableBody items={items}>
              {(item) => {
                return items.length > 0 ? (
                  <TableRow key={item.serialNumber}>
                    <TableCell key={item.user?.fullname}>
                      <Link href={`#/admin/userProfile/${item.user?.userId}`}>
                        {item.user?.fullname}
                      </Link>
                    </TableCell>
                    <TableCell key={item.serialNumber}>
                      <Link href={`#/admin/user/${item.serialNumber}`}>
                        {item.serialNumber}
                      </Link>
                    </TableCell>
                    <TableCell key={item.invNumber}>{item.invNumber}</TableCell>
                    <TableCell key={item.status}><Badge content={item.status} color={statusColorMap[item.status]} variant="flat" shape="rectangle"> </Badge></TableCell>
                    <TableCell key={item.timestamp}>{Moment(item.timestamp).format("DD.MM.YYYY. - HH:mm")}</TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell colSpan={5}>Nema artikala</TableCell>
                  </TableRow>
                );
              }}
            </TableBody>
          </Table>
          <div className="flex justify-center">
            <Pagination
              showControls
              showShadow
              page={currentPage}
              total={totalPages}
              onChange={(page) => setCurrentPage(page)}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="success" onClick={onHide}>Zatvori</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ArticleModal;