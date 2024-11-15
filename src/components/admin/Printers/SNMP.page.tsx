import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../UserContext/UserContext";
import api from "../../../API/api";
import RoledMainMenu from "../../RoledMainMenu/RoledMainMenu";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
  Chip,
  Input,
  Accordion,
  AccordionItem,
  Spinner,
  Selection,
  Link,
  ScrollShadow,
  Modal,
  ModalHeader,
  ModalBody,
  ModalContent
} from "@nextui-org/react";
import Moment from "moment";
import Toast from "../../custom/Toast";
import InvoiceForm from "./Invoice.form";

interface MessageType {
  message: {
    message: string;
    variant: string;
  };
}


const SNMPPage: React.FC = () => {
  const { role } = useUserContext();
  const [message, setMessage] = useState<MessageType>({
    message: { message: "", variant: "" },
  });
  const [printers, setPrinters] = useState<PrinterDTO[]>([]);
  const [invoices, setInvoices] = useState<InvoiceType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingPrintersCounts, setLoadingPrintersCounts] = useState<boolean>(false); 
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [currentInvoiceId, setCurrentInvoiceId] = useState<any>(null);
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set(null));
  const navigate = useNavigate();
  const [isInvoiceEditModalVisible, setIsInvoiceEditModalVisible] = useState<boolean>(false)

  useEffect(() => {
    fatechInvoices();
  }, []);

  useEffect(() => {
    const currentKey = Array.from(selectedKeys)[0];
    const fetchPrinterDataByInvoiceId = async () => {
      setLoadingPrintersCounts(true);
      try {
        const response = await api(`api/invoice/${currentKey}/printers/`, "get", {}, role);
        if (response.status === "ok") {
          const printerData: any[] = response.data;
  
          const mappedPrinters: PrinterDTO[] = printerData.map(printer => {
            let connection = null;
            let rentType = null;
            let ownership = null;
  
            for (let i = 0; i < printer.printerFeatures.length; i++) {
              const feature = printer.printerFeatures[i];
              if (feature.featureId === 97) {
                connection = feature.featureValue;
              } else if (feature.featureId === 100) {
                rentType = feature.featureValue;
              } else if (feature.featureId === 99) {
                ownership = feature.featureValue;
              }
            }
  
            return {
              printerId: printer.printerId,
              printerType: printer.printerType,
              serialNumber: printer.serialNumber,
              ownership: ownership,
              connection: connection,
              rentType: rentType,
              user: printer.user,
              counters: {
                oid27: printer.counters.oid27,
                oid28: printer.counters.oid28,
                oid29: printer.counters.oid29,
              }
            };
          });
  
          setPrinters(mappedPrinters);
        } else {
          setErrorMessage("Failed to fetch printers", "error");
        }
      } catch (error) {
        setErrorMessage("Failed to fetch printers", "error");
      } finally {
        setLoadingPrintersCounts(false);
      }
    };
    if(currentKey !== undefined) {
      fetchPrinterDataByInvoiceId();
    }
  }, [role, selectedKeys]);
  

  const fatechInvoices = async () => {
    setLoading(true);
    try {
      const response = await api("api/invoice", "get", {}, role);
      if (response.status === "ok") {
        setInvoices(response.data as InvoiceType[]);
      } else {
        navigate('/login')
        setErrorMessage("Failed to fetch invoices", "error");
      }
    } catch (error) {
      setErrorMessage("Failed to fetch invoices", "error");
    } finally{
      setLoading(false);
    }
  };

  const calculateInvoice = async (invoiceId:number) => {
    setLoading(true);
    setIsDisabled(true)
    setCurrentInvoiceId(invoiceId);
    try {
      const response = await api(`api/invoice`, "post", {}, role);
      if (response.status === "ok") {
        setErrorMessage("Faktura uspješno obračunata", "success");
      } else {
        setErrorMessage("Greška prilikom obračuna fakture", "error");
      }
    } catch (error) {
      setErrorMessage("Greška prilikom obračuna fakture", "error");
    } finally {
      fatechInvoices()
      setCurrentInvoiceId(null);
    }
  };

  const setErrorMessage = (message: string, variant: string) => {
    setMessage((prev) => ({
      ...prev,
      errorMessage: { message, variant },
    }));
  };

  const resetMessage = () => {
    setMessage((prev) => ({
      ...prev,
      errorMessage: { message: "", variant: "" },
    }));
  };

  const updatePrinterOid = async (printerOidId: number, updateData: any) => {
    try {
      const response = await api(`api/printer-oid/${printerOidId}`, "put", updateData, role);
      if (response.status === "ok") {
        setErrorMessage("Printer OID updated successfully", "success");
      } else {
        setErrorMessage("Failed to update printer OID", "error");
      }
    } catch (error) {
      setErrorMessage("Failed to update printer OID", "error");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    printerId: number,
    oidKey: keyof PrinterDTO["counters"]
  ) => {
    const { value } = e.target;
    setPrinters((prevPrinters) =>
      prevPrinters.map((printer) =>
        printer.printerId === printerId
          ? {
              ...printer,
              counters: {
                ...printer.counters,
                [oidKey]: {
                  ...printer.counters[oidKey],
                  current: { value: Number(value), printerOidId: printer.counters[oidKey].current?.printerOidId || null },
                },
              },
            }
          : printer
      )
    );
  };

  const handleIsEditModalVisible = (invoiceId:number) => {
    setCurrentInvoiceId(invoiceId);
    setIsInvoiceEditModalVisible(true);
 }

 const handleIsEditModalVisibleClose = () => {
  setIsInvoiceEditModalVisible(false);
  fatechInvoices()
}
 

  const handleInputKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>,
    printerId: number,
    oidKey: keyof PrinterDTO["counters"]
  ) => {
    if (e.key === "Enter") {
      const currentValue = printers.find((p) => p.printerId === printerId)?.counters[oidKey].current;
      if (currentValue && currentValue.printerOidId !== null && currentValue.printerOidId !== undefined) {
        const updateData = { value: currentValue.value };
        updatePrinterOid(currentValue.printerOidId, updateData);
      } else {
        console.error("Invalid currentValue or printerOidId");
      }
    }
  };

  const columns = [
    { key: "printerId", label: "ID" },
    { key: "user", label: "Korisnik" },
    { key: "printerType", label: "Model" },
    { key: "serialNumber", label: "Serijski broj" },
    { key: "connection", label: "Veza" },
    { key: "ownership", label: "Vlasništvo" },
    { key: "rentType", label: "Rent Tip" },
    { key: "oid28_previous", label: "B/W Prethodno" },
    { key: "oid28_current", label: (<div className="flex justify-between"><span>B/W Trenutno</span><span>Ukupno</span></div>) },
    { key: "oid27_previous", label: "Kolor Prethodno" },
    { key: "oid27_current", label:  (<div className="flex justify-between"><span>Kolor Trenutno</span><span>Ukupno</span></div>) },
    { key: "oid29_previous", label: "Sken. Prethodno" },
    { key: "oid29_current", label:  (<div className="flex justify-between"><span>Sken. Trenutno</span><span>Ukupno</span></div>) },
  ];

  function oduzimanje(a: number, b: number) {
    const rezultat: number = a - b;
    return (
      rezultat === 0 ? (
        <Chip size="sm" variant="flat" color="warning">{rezultat}</Chip>
      ) : rezultat < 0 || !rezultat ? (
        <Chip variant="flat" color="danger">{rezultat}</Chip>
      ) : rezultat > 0 ? (
        <Chip size="sm" variant="flat" color="success">{rezultat}</Chip>
      ) : null
    );
  }

  const rows = printers.map((printer) => ({
    ...printer,
    oid28_previous: printer.counters.oid28.previous?.value || "",
    oid28_current: (
      printer.counters.oid28.previous?.value ? (
        <div className="flex justify-between gap-2 items-center">
          <Input
            className="w-[100px]"
            type="number"
            color="danger"
            variant="faded"
            value={(printer.counters.oid28.current?.value ?? "").toString()}
            onChange={(e) => handleInputChange(e, printer.printerId, "oid28")}
            onKeyPress={(e) => handleInputKeyPress(e, printer.printerId, "oid28")}
          />
          <div className="w-[50px] flex justify-center">
            {oduzimanje(printer.counters.oid28.current?.value ?? 0, printer.counters.oid28.previous?.value ?? 0) || ""}
          </div>
      </div>
      ):
     ""
    ) || "",
    oid27_previous: printer.counters.oid27.previous?.value || "",
    oid27_current: (
        printer.counters.oid27.previous?.value ? (
          <div className="flex justify-between gap-2 items-center">
            <Input
              className="w-[100px]"
              type="number"
              color="danger"
              variant="faded"
              value={(printer.counters.oid27.current?.value ?? "").toString()}
              onChange={(e) => handleInputChange(e, printer.printerId, "oid27")}
              onKeyPress={(e) => handleInputKeyPress(e, printer.printerId, "oid27")}
            />
            <div className="w-[50px] flex justify-center">
              {oduzimanje(printer.counters.oid27.current?.value ?? 0, printer.counters.oid27.previous?.value ?? 0) || ""}
            </div>
        </div>
        ):
       ""
      ) || "",
    oid29_previous: printer.counters.oid29.previous?.value || "",
    oid29_current: (
        printer.counters.oid29.previous?.value ? (
          <div className="flex justify-between gap-2 items-center">
            <Input
              className="w-[100px]"
              type="number"
              color="danger"
              variant="faded"
              value={(printer.counters.oid29.current?.value ?? "").toString()}
              onChange={(e) => handleInputChange(e, printer.printerId, "oid29")}
              onKeyPress={(e) => handleInputKeyPress(e, printer.printerId, "oid29")}
            />
            <div className="w-[50px] flex justify-center">
              {oduzimanje(printer.counters.oid29.current?.value ?? 0, printer.counters.oid29.previous?.value ?? 0) || ""}
            </div>
        </div>
        ):
       ""
      ) || "",
  }));

  return (
    <div>
      <RoledMainMenu />
      <div className="container mt-2 lg:mt-4">
        {loading ? (
          <div className="flex items-center justify-center min-h-[70vh]">
            <Spinner
              label="Učitavanje..."
              labelColor="warning"
              color="warning"
            />
          </div>
        ):(
              <div>
                <Accordion variant="splitted" selectedKeys={selectedKeys} onSelectionChange={setSelectedKeys}>
                {invoices.map((invoice) => (
                  <AccordionItem
                    isDisabled={isDisabled && currentInvoiceId === invoice.invoiceId}
                    key={invoice.invoiceId}
                    startContent={invoice.status === "plaćeno" ?
                      <i className="bi bi-check2-circle text-success-400 " /> :
                      <i className="bi bi-hourglass-split text-warning-400" />}
                    title={<div className="flex justify-between">
                      <span>{invoice.invoiceId} - {invoice.customer} - {invoice.invoiceNumber}/{Moment(invoice?.createdAt).format(
                        "YYYY"
                      )}</span>
                      <span className="text-small md:text-medium text-default-400">{Moment(invoice?.createdAt).format(
                        "DD.MM.YYYY"
                      )}</span>
                    </div>}
                    subtitle={<div className="flex overflow-y-auto md:max-w-fit max-w-[250px]">
                      <div className="grid grid-flow-col gap-2 text-default-500 ">
                        <span className="flex gap-1">
                          <i className="bi bi-printer text-white" />
                          {invoice.blackAndWhite ? invoice.blackAndWhite.toLocaleString() : "n/a"}
                        </span>
                        <span className="flex gap-1">
                          <i className="bi bi-palette text-danger-500" />
                          {invoice.color ? invoice.color.toLocaleString() : "n/a"}
                        </span>
                        <span className="flex gap-1">
                          <i className="bi bi-phone-landscape text-secondary-500" />
                          {invoice.scan ? invoice.scan.toLocaleString() : "n/a"}
                        </span>
                        <span className="flex gap-1 min-w-[100px]">
                          <i className="bi bi-cash-stack text-primary-500" />
                          {invoice.rentPrice ? invoice.rentPrice : "n/a"} KM
                        </span>
                        <span className="flex gap-1 min-w-[100px]">
                          <i className="bi bi-cash-coin text-green-500" />
                          {invoice.totalAmount ? invoice.totalAmount : "n/a"} KM
                        </span>
                      </div>
                      <div className="flex items-end gap-2 ml-4">
                          <Link
                              className="text-sm text-green-400"
                              onClick={() => calculateInvoice(invoice.invoiceId)}
                            >
                              <i className="bi bi-calculator mr-1"></i> obračunaj
                            </Link>
                      </div>
                      {invoice.status !== 'plaćeno' && (
                        <div className="flex items-end gap-2 ml-4">
                          <Link
                              className="text-sm text-yellow-400"
                              onClick={()=>handleIsEditModalVisible(invoice.invoiceId)}
                            >
                              <i className="bi bi-pencil-square mr-1"></i> izmjeni
                            </Link>
                      </div>
                      )}
                      
                    </div>}
                  >
                      <ScrollShadow
                      hideScrollBar 
                      offset={100}
                      orientation="horizontal" 
                      className=" max-h-[70vh]">

                        <Table isCompact isStriped removeWrapper>
                          <TableHeader columns={columns}>
                            {(column) => (
                              <TableColumn key={column.key}>{column.label}</TableColumn>
                            )}
                          </TableHeader>
                          <TableBody isLoading={loadingPrintersCounts} loadingContent={<Spinner label="Učitavanje..." />} items={rows}>
                            {(item) => (
                              <TableRow key={item.printerId}>
                                {(columnKey) => (
                                  <TableCell className="whitespace-nowrap">{getKeyValue(item, columnKey)}</TableCell>
                                )}
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                        </ScrollShadow>
                  </AccordionItem>
                ))}
              </Accordion>
              <Toast variant={message.message.variant} message={message.message.message} onClose={resetMessage} />
            </div>
        )}
        {isInvoiceEditModalVisible && (
          <Modal
            size="lg"
            backdrop="blur"
            scrollBehavior={"inside"}
            isOpen={isInvoiceEditModalVisible}
            onClose={() => handleIsEditModalVisibleClose()}
            >
              <ModalContent>
                <ModalHeader>
                  Izmjena fakture
                </ModalHeader>
                <ModalBody>
                  <InvoiceForm invoiceId={currentInvoiceId} /> 
                </ModalBody>
              </ModalContent>
            </Modal>
        )}
        
      </div>
    </div>
  );
};

export default SNMPPage;
