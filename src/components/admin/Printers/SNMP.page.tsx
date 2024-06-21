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
  Selection
} from "@nextui-org/react";

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
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set(null));
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api("api/invoice", "get", {}, role);
        if (response.status === "ok") {
          setInvoices(response.data as InvoiceType[]);
        } else {
          setErrorMessage("Failed to fetch invoices", "error");
        }
      } catch (error) {
        setErrorMessage("Failed to fetch invoices", "error");
      }
    };
    fetchData();
  }, [role]);

  useEffect(()=> {
    const currentKey = Array.from(selectedKeys)[0];
    const fetchPrinterDataByInvoiceId = async () => {
      setLoading(true);
      try {
        const response = await api(`api/invoice/${currentKey}/printers/`, "get", {}, role);
        if (response.status === "ok") {
          setPrinters(response.data as PrinterDTO[]);
        } else {
          setErrorMessage("Failed to fetch printers1", "error");
        }
      } catch (error) {
        setErrorMessage("Failed to fetch printers", "error");
      } finally {
        setLoading(false);
      }
    };
    if(currentKey !== undefined) {
      fetchPrinterDataByInvoiceId()
    }
  }, [role, selectedKeys])

  

  const setErrorMessage = (message: string, variant: string) => {
    setMessage((prev) => ({
      ...prev,
      message: { message, variant },
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
    { key: "printerId", label: "Printer ID" },
    { key: "userCode", label: "User Code" },
    { key: "connection", label: "Connection" },
    { key: "printerType", label: "Printer Type" },
    { key: "serialNumber", label: "Serial Number" },
    { key: "rentalType", label: "Rental Type" },
    //{ key: "ownership", label: "Ownership" },
    { key: "oid28_previous", label: "B/W Previous" },
    { key: "oid28_current", label: (<div className="flex justify-between"><span>B/W Current</span><span>Total</span></div>) },
    { key: "oid27_previous", label: "Color Previous" },
    { key: "oid27_current", label:  (<div className="flex justify-between"><span>Color Current</span><span>Total</span></div>) },
    { key: "oid29_previous", label: "Scan Previous" },
    { key: "oid29_current", label:  (<div className="flex justify-between"><span>Scan Current</span><span>Total</span></div>) },
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
    <>
      <RoledMainMenu />
      
      <div className="container mx-auto mt-3 h-max lg:px-4">
      {message.message.message && (
        <div className={`message ${message.message.variant}`}>
          {message.message.message}
        </div>
      )}
      <Accordion variant="splitted" selectedKeys={selectedKeys} onSelectionChange={setSelectedKeys}>
        {invoices.map((invoice) => (
          <AccordionItem
            key={invoice.invoiceId}
            title={`Invoice Number: ${invoice.invoiceNumber}`}
          >

              <Table isCompact isStriped removeWrapper>
                <TableHeader columns={columns}>
                  {(column) => (
                    <TableColumn key={column.key}>{column.label}</TableColumn>
                  )}
                </TableHeader>
                <TableBody isLoading={loading} loadingContent={<Spinner label="Učitavanje..." />} items={rows}>
                  {(item) => (
                    <TableRow key={item.printerId}>
                      {(columnKey) => (
                        <TableCell className="whitespace-nowrap">{getKeyValue(item, columnKey)}</TableCell>
                      )}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
          </AccordionItem>
        ))}
      </Accordion></div>
    </>
  );
};

export default SNMPPage;
