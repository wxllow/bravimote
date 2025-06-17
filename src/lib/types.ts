export interface Device {
    id: string;
    displayName: string; // Usually `{PRODUCT} {MODEL}`
    product: string;
    model: string;
    hostname: string; // IP Address
}
