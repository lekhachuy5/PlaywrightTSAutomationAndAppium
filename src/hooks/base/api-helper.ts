export class ApiService {
    private baseUrl: string;
    private headers?: Record<string, string>;
    private token: string | undefined;
    constructor(baseUrl: string, headers: Record<string, string>) {
        this.baseUrl = baseUrl;
        this.headers = headers;
    }

    public async setHeaders(headers: Record<string, string>) {
        this.headers = headers;
    }

    public async getData(endpoint: string): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, { method: 'Get', headers: this.headers });

            return await response.json();
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    }

    public async postData(endpoint: string, data: any): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(data),
            });
            try {
                return await response.json();
            }
            catch (e) {
                //response status
                return response.status;
            }
        } catch (error) {
            console.error('Error posting data:', error);
            throw error;
        }
    }

    public async getToken(accountId: string, secret: string): Promise<string> {
        try {
            const payload = {
                "accountId": accountId,
                "secret": secret
            };
            const data = await this.postData('/integration/access-token', payload);
            return data.access_token;
        } catch (error) {
            console.error('Error posting data:', error);
            throw error;
        }
    }
}
