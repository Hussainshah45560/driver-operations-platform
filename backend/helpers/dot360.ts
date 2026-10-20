import axios from "axios";

export class Dot360 {
    private CLIENT_ID = global["config"].dot360.client_id;
    private CLIENT_SECRET = global["config"].dot360.client_secret;
    private BASE_URL = global["config"].dot360.url;
    private getAccessToken = async () => {
        try {
            const payload = {
                client_id: this.CLIENT_ID,
                client_secret: this.CLIENT_SECRET,
                grant_type: "client_credentials",
            }
            const data = await axios.post("https://sandbox-auth.dots.africa/realms/dots360/protocol/openid-connect/token", payload, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });
            return data.data.access_token;
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    performVerification = async (
        data: any
    ) => {
        try {
            const accessToken = await this.getAccessToken();
            const res = await axios.post(
                this.BASE_URL + "/verifications",
                data,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                },
            );
           return res.data;
        } catch (error: any) {
            console.error(
                "Error performing verification:",
                error.response?.data || error.message,
            );
            throw new Error(
                "Failed to perform verification: " +
                (error.response?.data?.message || error.message),
            );
        }
    };

    getResults = async (reference: string) => {
        try {
            const accessToken = await this.getAccessToken();
            const res = await axios.get(
                `${this.BASE_URL}/verifications/${reference}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                },
            );
            return res.data;
        }   catch (error: any) {   
            console.error(
                "Error fetching verification results:",
                error.response?.data || error.message,
            );
            throw new Error(
                "Failed to fetch verification results: " +
                (error.response?.data?.message || error.message),
            );
        }
    };

}
