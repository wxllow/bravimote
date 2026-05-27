export type Device = {
    id: string;
    displayName: string; // `{NAME [Always BRAVIA]} {MODEL}`
    model: string;
    hostname: string; // IP Address
};

export type SavedDevice = {
    id: string; // Client ID
    displayName: string; // `{NAME [Always BRAVIA]} {MODEL}`
    model: string;
    hostname: string; // IP Address
    macAddress?: string; // MAC Address for Wake-on-LAN
    cookie: string[] | string; // Auth cookie
};
