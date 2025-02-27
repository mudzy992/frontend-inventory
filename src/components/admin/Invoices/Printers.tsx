import { useState, useEffect } from 'react';
import { Input, Table, Tag, Flex, Pagination, Card } from 'antd';
import { useParams } from 'react-router-dom';
import { useUserContext } from '../../Contexts/UserContext/UserContext';
import Link from 'antd/es/typography/Link';
import { useApi } from '../../../API/api';
import { useNotificationContext } from '../../Contexts/Notification/NotificationContext';

type PrinterDTO = {
    printerId: string;
    printerType: string;
    serialNumber: string;
    connection: string | null;
    ownership: string | null;
    rentType: string | null;
    user: string;
    counters: {
        [key: string]: {
            previous?: { value: number };
            current?: { value: number | null; printerOidId: number | null };
        };
    };
}

const Printers = () => {
    const { api } = useApi();
    const { invoiceId } = useParams();
    const { role } = useUserContext();
    const [loading, setLoading] = useState(false);
    const [printers, setPrinters] = useState<PrinterDTO[]>([]);
    const [ invoice, setInvoice ] = useState<InvoiceType>()
    const [isPaid, setIsPaid] = useState<boolean>(true)
    const [searchText, setSearchText] = useState<string>('');
    const [filteredData, setFilteredData] = useState<PrinterDTO[]>([]);
    const {error, success, warning} = useNotificationContext();

    useEffect(() => {
        fetchPrinterDataByInvoiceId();
        fatchInvoice();
    }, [invoiceId]);

    useEffect(() => {
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
    }}, [searchText, printers]);

    const fatchInvoice = async () => {
        try{
            const response = await api(`api/invoice/${invoiceId}`, 'get', undefined, role)
            const status = response.data.status === 'plaćeno' ? true : false
            setInvoice(response.data)
            setIsPaid(status)
        } catch(err:any) {
            error.notification(err.data.message)
        }
    }

    const calculateInvoice = async () => {
        setLoading(true);
        try {
          const response = await api(`api/invoice`, "post", {}, role);
          if (response.status === "ok") {
            success.notification('Faktura uspješno obračunata')
          } else {
            warning.notification('Desila se greška prilikom obračuna fakture, pokušajte ponovo!')
          }
        } catch (err:any) {
            error.notification(err.data.message)
        } finally {
          fatchInvoice()
        }
      };

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
                        counters: printer.counters,
                    };
                });
                setPrinters(mappedPrinters);
                success.message('Podaci o printerima i brojačima uspješno učitani!')
            } else {
                warning.notification('Desila se greška prilikom povlačenja podataka.')
            }
        } catch (err:any) {
            error.notification(err.data.message)
        } finally {
            setLoading(false);
        }
    };

    const renderOidValues = (record: PrinterDTO, oidKey: string) => {
        const previous = record.counters[oidKey]?.previous?.value || 0;
        const current = record.counters[oidKey]?.current?.value || "";

        const difference = current !== "" ? Number(current) - previous : null;

        return (
            <div>
                <div className='text-xs'>
                    <span>{previous === 0 ? '' : "Prethodno: "+ previous}</span>
                </div>
                <div className='flex flex-row flex-nowrap items-center gap-2'>
                    <Input
                        className='w-20 text-center'
                        value={current}
                        hidden={previous === 0}
                        disabled={isPaid || previous === 0}
                        placeholder={previous !== 0 ? "Unesite trenutnu vrijednost" : "N/A"}
                        onChange={(e) => handleInputChange(e, record.printerId, oidKey)}
                        onBlur={(e) => handleInputBlur(e, record.printerId, oidKey)}
                    />
                    {previous !== 0 && (
                        <Tag className='p-1 rounded-lg' color={difference !== null && difference >= 0 ? "lime" : "red"}>
                            {difference !== null ? `${difference}` : "N/A"}
                        </Tag>
                    )}
                </div>
            </div>
        );
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        printerId: string,
        oidKey: string
    ) => {
        const value = e.target.value;

        setPrinters((prev) =>
            prev.map((printer) =>
                printer.printerId === printerId
                    ? {
                          ...printer,
                          counters: {
                              ...printer.counters,
                              [oidKey]: {
                                  ...printer.counters[oidKey],
                                  current: {
                                      value: value === "" ? null : Number(value), // Ažuriranje unosa
                                      printerOidId: printer.counters[oidKey]?.current?.printerOidId || null,
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
        printerId: string,
        oidKey: string
    ) => {
        const value = e.target.value;
        const numericValue = value !== "" ? Number(value) : undefined;
        const printerOidId = printers.find((p) => p.printerId === printerId)?.counters[oidKey]?.current?.printerOidId;

        if (printerOidId) {
            api(`api/printer-oid/${printerOidId}`, "put", { value: numericValue })
                .then((response) => {
                    if (response.status !== "ok") {
                        warning.message('Desila se greška prilikom ažuriranja vrijednosti!')
                    } else {
                        success.message(`Nova vrijednost za printer ID: ${printerId} izmjenjana uspješno`)
                    }
                })
                .catch(() => {
                    error.notification('Desila se greška prilikom ažuriranja vrijednosti!')
                });
        }
    };

    const columns = [
        { key: "printerId", dataIndex: "printerId", title: "ID" },
        { key: "user", dataIndex: "user", title: "Korisnik"},
        { key: "printerType", dataIndex: "printerType", title: "Model" },
        { key: "serialNumber", dataIndex: "serialNumber", title: "Serijski broj" },
        { key: "connection", dataIndex: "connection", title: "Veza" },
        { key: "ownership", dataIndex: "ownership", title: "Vlasništvo" },
        { key: "rentType", dataIndex: "rentType", title: "Rent Tip" },
        {
            key: "oid28_values",
            title: "BW vrijednosti",
            render: (record: PrinterDTO) => renderOidValues(record, "oid28"),
        },
        {
            key: "oid27_values",
            title: "Kolor vrijednosti",
            render: (record: PrinterDTO) => renderOidValues(record, "oid27"),
        },
        {
            key: "oid29_values",
            title: "Sken vrijednosti",
            render: (record: PrinterDTO) => renderOidValues(record, "oid29"),
        },
    ];

    const tableHeader = () => {
        return (
            <div>
                <div className='flex flex-row flex-nowrap overflow-auto'>
                    <div className="flex flex-row gap-2 h-10 items-center">
                        <span className="flex gap-1">
                            <i className="bi bi-printer text-white" />
                            {invoice?.blackAndWhite ? invoice.blackAndWhite.toLocaleString() : "n/a"}
                        </span>
                        <span className="flex gap-1">
                            <i className="bi bi-palette text-danger-500" />
                            {invoice?.color ? invoice.color.toLocaleString() : "n/a"}
                        </span>
                        <span className="flex gap-1">
                            <i className="bi bi-phone-landscape text-secondary-500" />
                            {invoice?.scan ? invoice.scan.toLocaleString() : "n/a"}
                        </span>
                        <span className="flex gap-1 min-w-fit">
                            <i className="bi bi-cash-stack text-primary-500" />
                            {invoice?.rentPrice ? invoice.rentPrice : "n/a"} KM
                        </span>
                        <span className="flex gap-1 min-w-fit">
                            <i className="bi bi-cash-coin text-green-500" />
                            {invoice?.totalAmount ? invoice.totalAmount : "n/a"} KM
                        </span>
                        <div >
                            {!isPaid && (
                                <Link
                                    className="flex flex-row min-w-20"
                                    onClick={() => calculateInvoice()}
                                >
                                    <i className="bi bi-calculator mr-1"></i>obračunaj
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
                <Input
                    placeholder="Pretraga po korisniku, serijskom broju, vezi..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ marginBottom: 20 }}
                />
            </div>
        )
    }

    return (
        <Card>
            <Table
                title={tableHeader}
                loading={loading}
                size='small'
                dataSource={filteredData}
                columns={columns}
                scroll={{ x: "max-content" }}
                pagination={{style:{paddingRight:"20px"}}}
                />
        </Card>
    );
};

export default Printers;
