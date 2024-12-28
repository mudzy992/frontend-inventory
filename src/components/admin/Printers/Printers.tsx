import { useState, useEffect } from 'react';
import RoledMainMenu from '../../RoledMainMenu/RoledMainMenu';
import { useParams } from 'react-router-dom';
import api from '../../../API/api';
import { Input, message, Table, Tag } from 'antd';
import { useUserContext } from '../../UserContext/UserContext';

const Printers = () => {
    const { role } = useUserContext();
    const { invoiceId } = useParams();
    const [loading, setLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const [printers, setPrinters] = useState<PrinterDTO[]>([]);
    const [searchText, setSearchText] = useState<string>('');
    const [filteredData, setFilteredData] = useState<PrinterDTO[]>([]);

    useEffect(() => {
        fetchPrinterDataByInvoiceId()
        if(printers){
            console.log(printers)
        }
      }, [invoiceId]);

    useEffect(() => {
        // Filter printers based on search text
        if (searchText === '') {
            setFilteredData(printers);
        } else {
            setFilteredData(
                printers.filter((printer) => {
                    return (
                        printer.user.toLowerCase().includes(searchText.toLowerCase()) ||
                        printer.serialNumber!.toLowerCase().includes(searchText.toLowerCase()) ||
                        printer.connection?.toLowerCase().includes(searchText.toLowerCase())
                    );
                })
            );
        }
    }, [searchText, printers]);

    const fetchPrinterDataByInvoiceId = async () => {
        setLoading(true);
        try {
            const response = await api(`api/invoice/${invoiceId}/printers/`, "get", {});
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
                messageApi.open({content:'Greška prilikom dohvaćanja podataka', type:'error'});
            }
        } catch (error) {
            messageApi.open({content:'Greška prilikom dohvaćanja podatak', type:'error'});
        } finally {
            setLoading(false);
        }
    };

    const updatePrinterOid = async (printerOidId: number, updateData: any) => {
        try {
            const response = await api(`api/printer-oid/${printerOidId}`, "put", updateData, role);
            if (response.status === "ok") {
                messageApi.open({content:'Printer OID updated successfully', type:'success'});
            } else {
                messageApi.open({content:'Greška prilikom izmjene podataka', type:'error'});
            }
        } catch (error) {
            messageApi.open({content:'Greška prilikom izmjene podataka', type:'error'});
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
                                  current: {
                                      value: Number(value),
                                      printerOidId: printer.counters[oidKey].current?.printerOidId || null,
                                  },
                              },
                          },
                      }
                    : printer
            )
        );
    };
    
    const handleInputBlur = (
        e: React.FocusEvent<HTMLInputElement>,
        printerId: number,
        oidKey: keyof PrinterDTO["counters"]
    ) => {
        const { value } = e.target;
        const numericValue = Number(value);
    
        // Pozivanje API metode za ažuriranje samo kada korisnik napusti polje
        const printerOidId = printers.find((p) => p.printerId === printerId)?.counters[oidKey].current?.printerOidId;
        if (printerOidId) {
            updatePrinterOid(printerOidId, { value: numericValue });
        }
    };
    
    
    const columns = [
        { key: "printerId", dataIndex: "printerId", title: "ID"},
        { key: "user", dataIndex: "user", title: "Korisnik"},
        { key: "printerType", dataIndex: "printerType", title: "Model" },
        { key: "serialNumber", dataIndex: "serialNumber", title: "Serijski broj"},
        { key: "connection", dataIndex: "connection", title: "Veza" },
        { key: "ownership", dataIndex: "ownership", title: "Vlasništvo" },
        { key: "rentType", dataIndex: "rentType", title: "Rent Tip" },
        {
            key: "oid28_values",
            title: "BW Vrijednosti",
            render: (record: PrinterDTO) => {
                const previous = record.counters.oid28.previous?.value;
                const current = record.counters.oid28.current?.value;
                const printerOidId = record.counters.oid28.current?.printerOidId;
                if (previous === 0 && current === 0) {
                    return null;
                }
        
                return (
                    <div>
                        {previous !== 0 && (
                            <div className="text-gray-500">Prethodno: {previous}</div>
                        )}
                        <Input
                            value={current ?? ""}
                            disabled={previous === 0}
                            placeholder={
                                previous !== 0
                                    ? "Unesite trenutnu vrijednost"
                                    : "N/A"
                            }
                            onChange={(e) =>
                                handleInputChange(e, record.printerId, "oid28")
                            }
                            onBlur={(e) =>
                                handleInputBlur(e, record.printerId, "oid28")
                            }
                        />
                    </div>
                );
            },
        },
        {
            key: "oid28_difference",
            title: "BW Razlika",
            render: (record: PrinterDTO) => {
                const previous = record.counters.oid28.previous?.value;
                const current = record.counters.oid28.current?.value;
    
                if (previous === 0 || current === 0) {
                    return null;
                }
    
                const difference = current! - previous!;
                return (
                    <Tag color={difference >= 0 ? "success" : "error"}>
                        {difference}
                    </Tag>
                );
            },
        },
        
        {
            key: "oid27_values",
            title: "Kolor Vrijednosti",
            render: (record: PrinterDTO) => {
                const previous = record.counters.oid27.previous?.value;
                const current = record.counters.oid27.current?.value;
    
                if (previous === 0 && current === 0) {
                    return null;
                }
    
                return (
                    <div>
                        {previous !== 0 && previous !== 0 && (
                            <div className="text-gray-500">Prethodno: {previous}</div>
                        )}
                        <Input
                            value={current ?? ""}
                            disabled={previous === 0}
                            placeholder={
                                previous !== 0
                                    ? "Unesite trenutnu vrijednost"
                                    : "N/A"
                            }
                            onChange={(e) =>
                                handleInputChange(e, record.printerId, "oid27")
                            }
                            onBlur={(e) =>
                                handleInputBlur(e, record.printerId, "oid27")
                            }
                        />
                    </div>
                );
            },
        },
        {
            key: "oid27_difference",
            title: "Kolor Razlika",
            render: (record: PrinterDTO) => {
                const previous = record.counters.oid27.previous?.value;
                const current = record.counters.oid27.current?.value;
    
                if (previous === 0 || current === 0) {
                    return null;
                }
    
                const difference = current! - previous!;
                return (
                    <Tag color={difference >= 0 ? "success" : "error"}>
                        {difference}
                    </Tag>
                );
            },
        },

        {
            key: "oid29_values",
            title: "Sken. Vrijednosti",
            render: (record: PrinterDTO) => {
                const previous = record.counters.oid29.previous?.value;
                const current = record.counters.oid29.current?.value;
    
                if (previous === 0 && current === 0) {
                    return null;
                }
    
                return (
                    <div>
                        {previous !== 0 && previous !== 0 && (
                            <div className="text-gray-500">Prethodno: {previous}</div>
                        )}
                        <Input
                            value={current ?? ""}
                            disabled={previous === 0}
                            placeholder={
                                previous !== 0
                                    ? "Unesite trenutnu vrijednost"
                                    : "N/A"
                            }
                            onChange={(e) =>
                                handleInputChange(e, record.printerId, "oid29")
                            }
                            onBlur={(e) =>
                                handleInputBlur(e, record.printerId, "oid29")
                            }
                        />
                    </div>
                );
            },
        },
        {
            key: "oid29_difference",
            title: "Sken. Razlika",
            render: (record: PrinterDTO) => {
                const previous = record.counters.oid29.previous?.value;
                const current = record.counters.oid29.current?.value;
    
                if (previous === 0 || current === 0) {
                    return null;
                }
    
                const difference = current! - previous!;
                return (
                    <Tag color={difference >= 0 ? "success" : "error"}>
                        {difference}
                    </Tag>
                );
            },
        },
    ];
    return (
        <div>
            {contextHolder}
            <RoledMainMenu />
            <div className="p-3">
            
                <div className="overflow-auto scrollbar-hide bg-white rounded-md text-black">
                    <Table 
                    loading={loading} 
                    size='small' 
                    dataSource={filteredData} 
                    columns={columns} 
                    title={() => <Input
                        placeholder="Pretraga po korisniku, serijskom broju, vezi..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ marginBottom: 20 }}
                    />}
                    />
                        
                </div>
            </div>
        </div>
    );
};

export default Printers;
