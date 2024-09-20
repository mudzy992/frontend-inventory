import { Button, Checkbox, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, useDisclosure } from "@nextui-org/react";
import React, { useState } from "react";
import * as XLSX from "xlsx";
import RoledMainMenu from "../../RoledMainMenu/RoledMainMenu";

interface RowData {
  [key: string]: string | number | boolean;
}

type SheetData = { sheetName: string; data: RowData[] };

interface TableData {
  [key: string]: string | number | null;
}


const TelecomInvoice: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [sheets, setSheets] = useState<string[]>([]);
  const [selectedSheets, setSelectedSheets] = useState<string[]>([]);
  const [data, setData] = useState<SheetData[] | null>(null);
  const [tableData, setTableData] = useState<TableData[]>([]); 
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const [fieldChecks, setFieldChecks] = useState<Record<string, boolean>>({}); 
  const [fieldValues, setFieldValues] = useState<Record<string, string | number>>({});
  const [loading, setLoading] = useState<boolean>(false)


  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      handleFileUpload(selectedFile);
    }
  };

  // Handle sheet selection
  const handleSheetSelection = (sheet: string) => {
    if (selectedSheets.includes(sheet)) {
      setSelectedSheets(selectedSheets.filter((s) => s !== sheet));
    } else {
      setSelectedSheets([...selectedSheets, sheet]);
    }
  };

  const handleOpenDialog = () => {
    onOpen();

    const initialChecks: Record<string, boolean> = {};
    const initialValues: Record<string, string | number> = {};

    tableData.forEach((row, rowIndex) => {
      Object.keys(row).forEach((colKey) => {
        const checkKey = `${rowIndex}-${colKey}`; // Kombinuj indeks reda i kolonu
        initialChecks[checkKey] = true; // Inicijalno postavi sve na true
        if (!row[colKey]) {
          initialValues[checkKey] = ''; // Inicijalizuj prazne inpute za prazna polja
        }
      });
    });

    setFieldChecks(initialChecks);
    setFieldValues(initialValues);
  };

  const handleSaveDialog = () => {
    const updatedData = tableData.filter((row, rowIndex) => {
      const checkKey = `${rowIndex}`; // Kombinuj indeks reda i kolonu
      return !fieldChecks[checkKey]; // Zadrži red ako nije čekiran
    }).map((row, rowIndex) => {
      const updatedRow: TableData = {};
      Object.keys(row).forEach((colKey) => {
        const checkKey = `${rowIndex}-${colKey}`; // Kombinuj indeks reda i kolonu
        updatedRow[colKey] = fieldValues[checkKey] !== undefined ? fieldValues[checkKey] : row[colKey];
      });
      return updatedRow; // Vraća ažurirani red
    });

    setTableData(updatedData); // Ažuriraj stanje sa novim redovima
  };

  const handleDeleteCheckedRows = () => {
    const updatedData = tableData.filter((_, rowIndex) => !fieldChecks[`${rowIndex}`]);
    setTableData(updatedData);
    setFieldChecks({}); // Resetuj sve čekirane vrednosti
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const binaryStr = e.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetNames = workbook.SheetNames;
      setSheets(sheetNames);
      setSelectedSheets(sheetNames); // Initially select all sheets
    };
    reader.readAsBinaryString(file);
  };

  // Show data from selected sheets
  const handleShowData = () => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const binaryStr = e.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });

      const filteredData: SheetData[] = selectedSheets.map((sheet) => {
        const sheetData: RowData[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]) as RowData[];

        // Filter rows to include only those starting with "Za priključak:"
        const filteredRows = sheetData.filter((row: RowData) =>
          Object.values(row).some((value) => typeof value === 'string' && value.startsWith("Za priključak:"))
        );

        // Define columns to exclude
        const columnsToExclude = ['Ukupno za priključak', '__EMPTY_9', '__EMPTY_18'];

        // Filter rows to include only allowed columns
        const filteredData = filteredRows.map(row => {
          const filteredRow: RowData = {};
          Object.keys(row).forEach(key => {
            if (!columnsToExclude.some(col => key.includes(col))) {
              filteredRow[key] = row[key];
            }
          });
          return filteredRow;
        });

        return {
          sheetName: sheet,
          data: filteredData,
        };
      });

      setData(filteredData);
    };
    reader.readAsBinaryString(file);
  };

  // Funkcija za prebacivanje podataka iz tabele u stanje
  const handleSaveTableData = () => {
    const rows = document.querySelectorAll<HTMLTableRowElement>('table tbody tr');
    const rowData: TableData[] = [];

    rows.forEach((row, index) => {
      const cells = row.querySelectorAll<HTMLTableCellElement>('td');

      // Pretpostavimo da je prva ćelija broj, a druga iznos
      const amount = cells[1]?.innerText || ''; 
      const number = cells[0]?.innerText || ''; 

      const rowObject: TableData = {
        name: number, // Broj reda kao string
        amount: amount,
      };

      rowData.push(rowObject);
    });
    setTableData(rowData);
  };

  const handleExportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Table Data");
  
    // Preimenuj datoteku i pokreni preuzimanje
    XLSX.writeFile(workbook, "faktura-radna.xlsx");
  };

  return (
    <>
    <RoledMainMenu />
    {loading ? (
      <div className="container mx-auto flex items-center justify-center">
      <Spinner label="Učitavanje..." labelColor="warning" color="warning" />
    </div>
    ) : (
      <div className="container  mx-auto mt-3 h-max">
      <h1 className="text-xl font-bold mb-4">Telekom faktura</h1>

      {/* Input for file selection */}
      <div className="mb-4">
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          className="mb-2"
        />
      </div>

      {sheets.length > 0 && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Select Sheets:</h2>
          <div className="flex flex-wrap space-x-4">
            {sheets.map((sheet) => (
              <div key={sheet} className="flex items-center">
                <Checkbox
                  aria-label={`Select ${sheet}`}
                  checked={selectedSheets.includes(sheet)}
                  onChange={() => handleSheetSelection(sheet)}
                  className="mr-2"
                >
                  {sheet}
                </Checkbox>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-row gap-2">
        <Button
          onClick={handleShowData}
          color="primary"
        >
          Show Data
        </Button>
        <Button
        onClick={handleSaveTableData}
        color="secondary"
      >
        Prebaci podatke u stanje
      </Button>

      {tableData.length > 0 && (
        <Button
          onClick={handleOpenDialog}
          color="warning"
        >
          Validiraj podatke
        </Button>
      )}
      </div>

      {isOpen && (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} scrollBehavior={"inside"} aria-label="modal">
          <ModalContent aria-label="modal-content">
            {(onClose) => (
              <>
                <ModalHeader aria-label="modal-header">Validacija podataka</ModalHeader>
                <ModalBody aria-label="modal-body">
                  <div>
                    <Table className="min-w-full" removeWrapper aria-label="tabela">
                      <TableHeader aria-label="tabela-header">
                        <TableColumn>Označi</TableColumn>
                        <TableColumn>Broj</TableColumn>
                        <TableColumn>Trošak</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {tableData.map((row, rowIndex) => (
                          <TableRow key={rowIndex} aria-label={`Red-tabela ${rowIndex}`}>
                            <TableCell >
                              <Checkbox
                                aria-label={`Select row ${rowIndex}`} // Dodano aria-label
                                checked={fieldChecks[`${rowIndex}`] || false}
                                onChange={() =>
                                  setFieldChecks((prev) => ({
                                    ...prev,
                                    [`${rowIndex}`]: !prev[`${rowIndex}`],
                                  }))
                                }
                              />
                            </TableCell>
                            <TableCell>{row.name}</TableCell>
                            <TableCell>
                              <Input
                                aria-label={`Input for amount in row ${rowIndex}`} // Dodano aria-label
                                type="text"
                                value={fieldValues[`${rowIndex}-${"amount"}`] !== undefined ? fieldValues[`${rowIndex}-${"amount"}`].toString() : (row.amount !== null && row.amount !== undefined ? row.amount.toString() : '')}
                                onChange={(e) =>
                                  setFieldValues((prev) => ({
                                    ...prev,
                                    [`${rowIndex}-${"amount"}`]: e.target.value,
                                  }))
                                }
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </ModalBody>

                <ModalFooter>
                  <Button color="danger" onClick={handleDeleteCheckedRows}>
                    Obriši označene
                  </Button>
                  <Button color="primary" onClick={handleSaveDialog}>
                    Snimi
                  </Button>
                  <Button onClick={handleExportToExcel} color="success">
                    Export to Excel
                  </Button>
                  <Button color="primary" onPress={onClose}>
                    Izadji
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
      
      {data && (
        <div>
          {data.map((sheetData: SheetData, idx: number) => (
            <div key={idx}>
              <h3 className="text-lg font-bold mt-4">{sheetData.sheetName}</h3>
              <table className="text-small min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th>
                      Broj
                    </th>
                    <th>
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody >
                  <tr>
                    {Object.keys(sheetData.data[0] || {}).map((col, index) => {
                      if (col.includes('Ukupno za priključak') || col === '__EMPTY_9' || col === '__EMPTY_18') {
                        return null;
                      }

                      return (
                        <td key={index} className="px-4 py-2 border border-gray-300">
                          {col.replace('Za priključak: ', '')}
                        </td>
                      );
                    })}
                  </tr>
                  {sheetData.data.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {Object.keys(row).map((colKey, colIndex) => {
                        const value = row[colKey];
                        if (typeof value === 'string' && value.includes('Ukupno za priključak')) {
                          return null;
                        }
                        return (
                          <td key={colIndex} className="px-4 py-2 border border-gray-300">
                            {typeof value === 'string' ? value.replace('Za priključak: ', '') : value}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          
        </div>
      )}
    </div>
    )
  }
    </>
    
  );
};

export default TelecomInvoice;
