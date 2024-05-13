export interface Printer {
    id: number,
    name: string,
    ip: string,
    port: number,
    hidden: boolean
}

export enum ScanResult { New, Found, NotFound, NotScanned }
  
export interface PrinterExtra extends Printer {
  scanResult: ScanResult
}


export function initEmptyPrinter(): Printer {
    return { id: 0, name: 'ND', ip: '0.0.0.0', port: 0, hidden: false }
}

export function arePrintersEqual(a: Printer, b: Printer): boolean {
    return a.id === b.id && a.name === b.name && a.ip === b.ip && a.port === b.port && a.hidden === b.hidden
}
