interface OidData {
  current: { value: number; printerOidId: number | null } | null;
  previous: { value: number; printerOidId: number | null } | null;
}

interface PrinterDTO {
  printerId: number;
  userCode: string | null;
  connection: string | null;
  printerType: string | null;
  serialNumber: string | null;
  activity: string | null;
  rentalType: number;
  ownership: string | null;
  status: 'activated' | 'deactivated' | null;
  counters: {
    oid26: OidData;
    oid27: OidData;
    oid28: OidData;
    oid29: OidData;
  };
}
