import axios, { AxiosInstance } from 'axios';
import axiosTauriApiAdapter from 'axios-tauri-api-adapter';
import config from './config';
import { Code } from './ircc-codes';

export class RestAPI {
    private axiosInstance: AxiosInstance;
    public mode: 'pin' | 'psk';
    private psk?: string;

    constructor(hostname: string, mode: 'pin' | 'psk', psk?: string) {
        if (mode === 'psk' && !psk) {
            throw new Error('PSK must be provided when mode is "psk".');
        }

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

    async post(
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
                        ...(this.mode === 'psk'
                            ? { 'X-Auth-PSK': this.psk }
                            : {}),
                        ...headers
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('POST request failed:', error);
            throw error;
        }
    }

    async connect(pin: string) {
        if (this.mode !== 'pin') {
            throw new Error('Connect method is only available in "pin" mode.');
        }

        return await this.post(
            'accessControl',
            {
                method: 'actRegister',
                params: [
                    {
                        clientid: 'bravimote',
                        nickname: 'Bravimote',
                        level: 'private'
                    },
                    [
                        {
                            value: 'yes',
                            function: 'WOL'
                        }
                    ]
                ]
            },
            pin
                ? {
                      Authorization: `Basic ${btoa(`:${pin}`)}`
                  }
                : {}
        );
    }

    async getPowerStatus() {
        return ((await this.post('system', { method: 'getPowerStatus' }))
            .result || [{ status: 'off' }])[0];
    }

    async setPowerStatus(status: boolean) {
        return await this.post('system', {
            method: 'setPowerStatus',
            params: [{ status }]
        });
    }

    async sendIRCC(code: Code) {
        axios.post(
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
                    ...(this.mode === 'psk' ? { 'X-Auth-PSK': this.psk } : {}),
                    SOAPAction:
                        '"urn:schemas-sony-com:service:IRCC:1#X_SendIRCC"'
                }
            }
        );
    }

    // Insecure, TODO: encrypt (https://pro-bravia.sony.net/develop/integrate/rest-api/spec/service/appcontrol/v1_1/setTextForm/index.html)
    async setTextForm(text: string) {
        // todo: error handling
        return await this.post('appControl', {
            method: 'setTextForm',
            params: [text]
        });
    }
}

export default RestAPI;
