import axios from "axios";

export class sendSMS {
  sendSmsUsingApi = async (to: string, message: string) => {
    const SMS_API_USERNAME = global["config"].sms.username;
    const SMS_API_PASSWORD = global["config"].sms.password;

    if (!SMS_API_USERNAME || !SMS_API_PASSWORD) {
      throw new Error(
        "Missing SMS_API_USERNAME or SMS_API_PASSWORD in config variables"
      );
    }

    try {
      const params = new URLSearchParams({
        action:"message_send",
        username: SMS_API_USERNAME,
        password: SMS_API_PASSWORD,
        from: "Online Application",
        text: message,
        to
      });

      const url = `https://sms-api.saicom.co.za/json?${params.toString()}`;

      const { data } = await axios.get(url, { timeout: 10000 });

      console.log("✅ SMS sent:", data);
      return { success: true, data };
    } catch (error: any) {
      console.error("❌ Failed to send SMS:", error.message);
      return { success: false, error: error.message };
    }
  };
}
