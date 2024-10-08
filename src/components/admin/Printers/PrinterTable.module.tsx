import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Chip,
  Spinner,
  getKeyValue,
} from "@nextui-org/react";

interface PrinterTableProps {
  printers: PrinterDTO[];
  loading: boolean;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    printerId: number,
    oidKey: keyof PrinterDTO["counters"]
  ) => void;
  handleInputKeyPress: (
    e: React.KeyboardEvent<HTMLInputElement>,
    printerId: number,
    oidKey: keyof PrinterDTO["counters"]
  ) => void;
}

const PrinterTable: React.FC<PrinterTableProps> = ({
  printers,
  loading,
  handleInputChange,
  handleInputKeyPress,
}) => {
  const columns = [
    { key: "printerId", label: "Printer ID" },
    { key: "userCode", label: "User Code" },
    { key: "connection", label: "Connection" },
    { key: "printerType", label: "Printer Type" },
    { key: "serialNumber", label: "Serial Number" },
    { key: "rentalType", label: "Rental Type" },
    //{ key: "ownership", label: "Ownership" },
    { key: "oid28_previous", label: "B/W Previous" },
    {
      key: "oid28_current",
      label: (
        <div className="flex justify-between">
          <span>B/W Current</span>
          <span>Total</span>
        </div>
      ),
    },
    { key: "oid27_previous", label: "Color Previous" },
    {
      key: "oid27_current",
      label: (
        <div className="flex justify-between">
          <span>Color Current</span>
          <span>Total</span>
        </div>
      ),
    },
    { key: "oid29_previous", label: "Scan Previous" },
    {
      key: "oid29_current",
      label: (
        <div className="flex justify-between">
          <span>Scan Current</span>
          <span>Total</span>
        </div>
      ),
    },
  ];

  function oduzimanje(a: number, b: number) {
    const rezultat: number = a - b;
    return rezultat === 0 ? (
      <Chip size="sm" variant="flat" color="warning">
        {rezultat}
      </Chip>
    ) : rezultat < 0 || !rezultat ? (
      <Chip variant="flat" color="danger">
        {rezultat}
      </Chip>
    ) : rezultat > 0 ? (
      <Chip size="sm" variant="flat" color="success">
        {rezultat}
      </Chip>
    ) : null;
  }

  const rows = printers.map((printer) => ({
    ...printer,
    oid28_previous: printer.counters.oid28.previous?.value || "",
    oid28_current: printer.counters.oid28.previous?.value ? (
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
          {oduzimanje(
            printer.counters.oid28.current?.value ?? 0,
            printer.counters.oid28.previous?.value ?? 0
          ) || ""}
        </div>
      </div>
    ) : (
      ""
    ),
    oid27_previous: printer.counters.oid27.previous?.value || "",
    oid27_current: printer.counters.oid27.previous?.value ? (
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
          {oduzimanje(
            printer.counters.oid27.current?.value ?? 0,
            printer.counters.oid27.previous?.value ?? 0
          ) || ""}
        </div>
      </div>
    ) : (
      ""
    ),
    oid29_previous: printer.counters.oid29.previous?.value || "",
    oid29_current: printer.counters.oid29.previous?.value ? (
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
          {oduzimanje(
            printer.counters.oid29.current?.value ?? 0,
            printer.counters.oid29.previous?.value ?? 0
          ) || ""}
        </div>
      </div>
    ) : (
      ""
    ),
  }));

  return (
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
              <TableCell>{getKeyValue(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default PrinterTable;
