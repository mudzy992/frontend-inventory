import { Button, Checkbox, Input, Modal, Table, Spin, Row, Col } from "antd";
import React, { useState } from "react";
import * as XLSX from "xlsx";

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
  const [fieldChecks, setFieldChecks] = useState<Record<string, boolean>>({});
  const [fieldValues, setFieldValues] = useState<Record<string, string | number>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      handleFileUpload(selectedFile);
    }
  };

  const handleSheetSelection = (sheet: string) => {
    if (selectedSheets.includes(sheet)) {
      setSelectedSheets(selectedSheets.filter((s) => s !== sheet));
    } else {
      setSelectedSheets([...selectedSheets, sheet]);
    }
  };

  const handleOpenDialog = () => {
    setIsModalOpen(true);
    const initialChecks: Record<string, boolean> = {};
    const initialValues: Record<string, string | number> = {};

    tableData.forEach((row, rowIndex) => {
      Object.keys(row).forEach((colKey) => {
        const checkKey = `${rowIndex}-${colKey}`;
        initialChecks[checkKey] = true;
        if (!row[colKey]) {
          initialValues[checkKey] = '';
        }
      });
    });

    setFieldChecks(initialChecks);
    setFieldValues(initialValues);
  };

  const handleSaveDialog = () => {
    const updatedData = tableData.filter((row, rowIndex) => {
      const checkKey = `${rowIndex}`;
      return !fieldChecks[checkKey];
    }).map((row, rowIndex) => {
      const updatedRow: TableData = {};
      Object.keys(row).forEach((colKey) => {
        const checkKey = `${rowIndex}-${colKey}`;
        updatedRow[colKey] = fieldValues[checkKey] !== undefined ? fieldValues[checkKey] : row[colKey];
      });
      return updatedRow;
    });

    setTableData(updatedData);
  };

  const handleDeleteCheckedRows = () => {
    const updatedData = tableData.filter((_, rowIndex) => !fieldChecks[`${rowIndex}`]);
    setTableData(updatedData);
    setFieldChecks({});
  };

  const handleFileUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const binaryStr = e.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetNames = workbook.SheetNames;
      setSheets(sheetNames);
      setSelectedSheets(sheetNames);
    };
    reader.readAsBinaryString(file);
  };

  const handleShowData = () => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const binaryStr = e.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });

      const filteredData: SheetData[] = selectedSheets.map((sheet) => {
        const sheetData: RowData[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]) as RowData[];

        const filteredRows = sheetData.filter((row: RowData) =>
          Object.values(row).some((value) => typeof value === 'string' && value.startsWith("Za priključak:"))
        );

        const columnsToExclude = ['Ukupno za priključak', '__EMPTY_9', '__EMPTY_18'];

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

  const handleSaveTableData = () => {
    const rows = document.querySelectorAll<HTMLTableRowElement>('table tbody tr');
    const rowData: TableData[] = [];

    rows.forEach((row, index) => {
      const cells = row.querySelectorAll<HTMLTableCellElement>('td');

      const amount = cells[1]?.innerText || '';
      const number = cells[0]?.innerText || '';

      const rowObject: TableData = {
        name: number,
        amount: amount,
      };

      rowData.push(rowObject);
    });
    setTableData(rowData);
  };

  const handleExportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vrijednosti tabele");
    XLSX.writeFile(workbook, "faktura-radna.xlsx");
  };

  return (
    <div className="container mx-auto mt-6 p-4 bg-white rounded shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center">Telekom faktura</h1>

      {/* Input for file selection */}
      <div className="mb-4">
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          className="w-full p-2 border rounded-md"
        />
      </div>

      {sheets.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Odaberi tabele:</h2>
          <div className="flex flex-wrap gap-4">
            {sheets.map((sheet) => (
              <Checkbox
                key={sheet}
                checked={selectedSheets.includes(sheet)}
                onChange={() => handleSheetSelection(sheet)}
                className="mb-2"
              >
                {sheet}
              </Checkbox>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between mb-4">
        <Button onClick={handleShowData} type="primary">Prikaži vrijednosti</Button>
        <Button onClick={handleSaveTableData} type="default">Prebaci podatke u stanje</Button>

        {tableData.length > 0 && (
          <Button onClick={handleOpenDialog} type="primary">Validiraj podatke</Button>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <Modal
          title="Validacija podataka"
          visible={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
        >
          <Table
            dataSource={tableData}
            columns={[
              {
                title: "Označi",
                dataIndex: "check",
                render: (_, __, rowIndex) => (
                  <Checkbox
                    checked={fieldChecks[`${rowIndex}`] || false}
                    onChange={() =>
                      setFieldChecks((prev) => ({
                        ...prev,
                        [`${rowIndex}`]: !prev[`${rowIndex}`],
                      }))
                    }
                  />
                ),
              },
              { title: "Broj", dataIndex: "name" },
              {
                title: "Trošak",
                dataIndex: "amount",
                render: (_, record, rowIndex) => (
                  <Input
                    value={fieldValues[`${rowIndex}-${"amount"}`] ?? record.amount ?? ''}
                    onChange={(e) =>
                      setFieldValues((prev) => ({
                        ...prev,
                        [`${rowIndex}-${"amount"}`]: e.target.value,
                      }))
                    }
                  />
                ),
              },
            ]}
          />
          <div className="flex gap-2 mt-4">
            <Button onClick={handleDeleteCheckedRows} danger>Obriši označene</Button>
            <Button onClick={handleSaveDialog} type="primary">Snimi</Button>
            <Button onClick={handleExportToExcel} type="default">Export to Excel</Button>
          </div>
        </Modal>
      )}

      {/* Display data */}
      {loading ? (
        <div className="flex justify-center">
          <Spin tip="Učitavanje..." />
        </div>
      ) : (
        <div>
          {data && data.map((sheetData, idx) => (
            <div key={idx} className="mb-6">
              <h3 className="text-lg font-semibold mb-4">{sheetData.sheetName}</h3>
              <table className="w-full border-collapse table-auto">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="px-4 py-2 text-left">Broj</th>
                    <th className="px-4 py-2 text-left">Vrijednost</th>
                  </tr>
                </thead>
                <tbody>
                  {sheetData.data.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-b hover:bg-gray-50">
                      {Object.keys(row).map((colKey, colIndex) => {
                        const value = row[colKey];
                        if (typeof value === 'string' && value.includes('Ukupno za priključak')) {
                          return null;
                        }
                        return (
                          <td key={colIndex} className="px-4 py-2">
                            {value}
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
  );
};

export default TelecomInvoice;
