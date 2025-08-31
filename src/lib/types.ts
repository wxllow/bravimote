export interface Device {
    id: string;
    displayName: string; // `{PRODUCT} {MODEL}`
    product: string;
    model: string;
    hostname: string; // IP Address
}
