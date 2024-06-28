interface OidData {
  current: { value: number; printerOidId: number | null } | null;
  previous: { value: number; printerOidId: number | null } | null;
}

interface PrinterDTO {
  printerId: number;
  user: string;
  printerType: string | null;
  serialNumber: string | null;
  ownership: string | null;
  connection: string;
  rentType: string;
  counters: {
    oid27: OidData;
    oid28: OidData;
    oid29: OidData;
  };
}
