import PrinterOidType from "./PrinterOidType";

export default class OidType {
    code?: string;
    name?: string;
    status?:"activated" | "deactivated";
    printerOs?: PrinterOidType[];
  }
  