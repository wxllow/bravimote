import axios, { AxiosInstance } from 'axios';
import axiosTauriApiAdapter from 'axios-tauri-api-adapter';
import { Code } from './ircc-codes';
import { fetch } from '@tauri-apps/plugin-http';

async function generateRandomHex(byteLength: number): Promise<string> {
    const randomBytes = new Uint8Array(byteLength);
    window.crypto.getRandomValues(randomBytes);
    return Array.from(randomBytes)
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
}

export class RestAPI {
    private axiosInstance: AxiosInstance;
    public mode: 'pin' | 'psk';
    private psk?: string;
    private hostname: string;

    constructor(hostname: string, mode: 'pin' | 'psk', psk?: string) {
        if (mode === 'psk' && !psk) {
            throw new Error('PSK must be provided when mode is "psk".');
        }

        this.hostname = hostname;
        this.mode = mode;
        this.psk = psk;

        const baseURL = `http://${hostname}/sony/`;

        this.axiosInstance = axios.create({
            baseURL,
            timeout: 5000,
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            adapter: axiosTauriApiAdapter
        });
    }

    private _authHeaders() {
        return this.mode === 'pin'
            ? {
                  Cookie:
                      JSON.parse(
                          localStorage.getItem(`device:${this.hostname}`) ||
                              'null'
                      )?.cookie || ''
              }
            : { 'X-Auth-PSK': this.psk };
    }

    private async _post(
        endpoint: string,
        body: Record<string, any>,
        headers?: Record<string, string>
    ) {
        try {
            const response = await this.axiosInstance.post(
                endpoint,
                {
                    id: 1,
                    version: '1.0',
                    params: [],
                    ...body
                },
                {
                    headers: {
                        ...this._authHeaders(),
                        ...headers
                    }
                }
            );
            return response;
        } catch (error) {
            console.error('POST request failed:', error);
            throw error;
        }
    }

    async connect(pin: string = '0000', clientId?: string) {
        if (this.mode !== 'pin') {
            throw new Error('Connect method is only available in "pin" mode.');
        }

        const savedCookie = JSON.parse(
            localStorage.getItem(`device:${this.hostname}`) || 'null'
        );

        if (savedCookie) {
            console.debug('Using saved cookie for authentication.');
            return;
        }

        clientId = clientId || `bravimote-${await generateRandomHex(4)}`;

        const res = await fetch(
            `${this.axiosInstance.defaults.baseURL}accessControl`,
            {
                method: 'POST',
                body: JSON.stringify({
                    id: 13,
                    version: '1.0',
                    method: 'actRegister',
                    params: [
                        {
                            clientid: clientId,
                            nickname: 'Bravimote',
                            level: 'private'
                        },
                        [
                            {
                                clientid: clientId,
                                nickname: 'Bravimote',
                                value: 'yes',
                                function: 'WOL'
                            }
                        ]
                    ]
                }),
                headers: {
                    Authorization: `Basic ${btoa(`:${pin}`)}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Throw error with clientId in it
        if (res.status === 401) {
            throw {
                message: 'Invalid PIN or connection failed',
                clientId,
                response: res
            };
        }

        if (res.status !== 200)
            throw {
                message: 'Failed to connect to the TV',
                response: res
            };

        // Extract and save the cookie
        const cookie = res.headers.getSetCookie();

        if (cookie) {
            localStorage.setItem(
                `device:${this.hostname}`,
                JSON.stringify({
                    id: clientId,
                    cookie,
                    name: 'Name'
                })
            );
        }

        return res;
    }

    async getPowerStatus() {
        return ((await this._post('system', { method: 'getPowerStatus' })).data
            .result || [{ status: 'off' }])[0];
    }

    async setPowerStatus(status: boolean) {
        return (
            await this._post('system', {
                method: 'setPowerStatus',
                params: [{ status }]
            })
        ).data;
    }

    async sendIRCC(code: Code) {
        try {
            return await axios.post(
                `${this.axiosInstance.defaults.baseURL}IRCC`,
                `<?xml version="1.0"?>
                <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
                <s:Body>
                <u:X_SendIRCC xmlns:u="urn:schemas-sony-com:service:IRCC:1">
                    <IRCCCode>${code}</IRCCCode>
                </u:X_SendIRCC>
                </s:Body>
            </s:Envelope>`,
                {
                    headers: {
                        ...this._authHeaders(),
                        'Content-Type': 'text/xml',
                        SOAPAction:
                            '"urn:schemas-sony-com:service:IRCC:1#X_SendIRCC"'
                    },
                    adapter: axiosTauriApiAdapter,
                    responseType: 'text'
                }
            );
        } catch (error) {
            console.error('POST request failed:', error);
            if (axios.isAxiosError(error)) {
                console.log(error.response?.data);
            }
            throw error;
        }
    }

    async setTextForm(text: string) {
        return (
            await this._post('appControl', {
                method: 'setTextForm',
                params: [text]
            })
        ).data;
    }
}

export default RestAPI;
