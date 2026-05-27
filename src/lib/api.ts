import axios, { AxiosInstance } from 'axios';
import axiosTauriApiAdapter from 'axios-tauri-api-adapter';
import { Code } from './ircc-codes';
import { fetch } from '@tauri-apps/plugin-http';
import { SavedDevice } from './types';
import { invoke } from '@tauri-apps/api/core';

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
            timeout: 3000,
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

        if (!cookie) {
            throw {
                message: 'No cookie received from the TV',
                response: res
            };
        }

        localStorage.setItem(
            `device:${this.hostname}`,
            JSON.stringify({
                id: clientId,
                cookie,
                model: '',
                displayName: '',
                hostname: this.hostname
            } as SavedDevice)
        );

        // Fetch and save system info

        const sysInfo = await this.getSystemInfo();

        localStorage.setItem(
            `device:${this.hostname}`,
            JSON.stringify({
                id: clientId,
                cookie,
                model: sysInfo.model,
                displayName: `${sysInfo.name} ${sysInfo.model}`,
                hostname: this.hostname,
                macAddress: sysInfo.macAddr || undefined
            } as SavedDevice)
        );

        return res;
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
                console.error(error.response?.data);
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

    /// Wake device from LAN if possible and device isn't already on.
    async wakeUp() {
        const device = JSON.parse(
            localStorage.getItem(`device:${this.hostname}`) || 'null'
        ) as SavedDevice | null;

        if (!device?.macAddress) {
            console.warn('No MAC address found for device, cannot wake up.');
            return false;
        }

        let powerStatus = 'active';

        try {
            let ipAddr = (await invoke('lookup_ip', {
                mac: device.macAddress
            })) as string;

            if (ipAddr && ipAddr !== this.hostname) {
                console.debug(
                    `Updating device IP from ${this.hostname} to ${ipAddr}`
                );
                this.hostname = ipAddr;
                this.axiosInstance.defaults.baseURL = `http://${ipAddr}/sony/`;

                localStorage.setItem(
                    `device:${this.hostname}`,
                    JSON.stringify({
                        ...device,
                        hostname: ipAddr
                    } as SavedDevice)
                );
                localStorage.removeItem(`device:${this.hostname}`);
            }
        } catch (e) {
            console.warn('Failed to lookup IP address for device:', e);
        }

        let startTime = Date.now();

        for (;;) {
            if (Date.now() - startTime > 15000) {
                console.warn('WOL timeout reached, giving up.');
                return false;
            }

            try {
                powerStatus = (await this.getPowerStatus()).status;

                console.debug('WOL Got', powerStatus);

                if (powerStatus === 'active') {
                    return true;
                }

                await this.setPowerStatus(true);

                throw new Error('Device is off, sending WOL');
            } catch (error) {
                console.debug('Sending WOL packet to', device.macAddress);
                await invoke('send_wol', { mac: device.macAddress });
                await new Promise((resolve) => setTimeout(resolve, 100));
            }
        }
    }

    async getSystemInfo() {
        return ((await this._post('system', { method: 'getSystemInformation' }))
            .data.result || [])[0];
    }
}

export default RestAPI;
