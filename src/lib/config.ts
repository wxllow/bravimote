type ConfigFields = {
    hostname: string | null;
    key: string | null;
    setup: boolean;
};

const defaultConfig: ConfigFields = {
    hostname: null,
    key: null,
    setup: false
};

class ConfigAPI {
    private storageKey = 'appConfig';

    constructor() {
        if (!localStorage.getItem(this.storageKey)) {
            this.saveConfig(defaultConfig);
        }
    }

    private loadConfig(): ConfigFields {
        const config = localStorage.getItem(this.storageKey);
        return config ? JSON.parse(config) : { ...defaultConfig };
    }

    private saveConfig(config: ConfigFields): void {
        localStorage.setItem(this.storageKey, JSON.stringify(config));
    }

    get(field: keyof ConfigFields): string | null {
        const config = this.loadConfig();
        return config[field];
    }

    set(field: keyof ConfigFields, value: string | null): void {
        const config = this.loadConfig();
        config[field] = value;
        this.saveConfig(config);
    }

    reset(): void {
        this.saveConfig(defaultConfig);
    }
}

export default new ConfigAPI();
