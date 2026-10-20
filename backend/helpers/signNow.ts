import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import path from "path";

export class SignNow {
  private BASE_URL = global["config"].signNow.url;
  private API_KEY = global["config"].signNow.apiKey;
  private CALLBACK_URL = global["config"].signNow.callBackURL;
  uploadDocument = async (file: string) => {
    const fullpath = global["appRoot"] + file;
    const filePath = path.resolve(fullpath);

    if (!fs.existsSync(filePath)) {
      throw new Error("File not found at: " + filePath);
    }

    if (!this.BASE_URL || !this.API_KEY) {
      throw new Error("Missing BASE_URL or API_KEY in config variables");
    }
    try {
      const form = new FormData();
      form.append("file", fs.createReadStream(filePath));

      console.log(this.BASE_URL + "/document");
      const data = await axios.post(this.BASE_URL + "/document", form, {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${this.API_KEY}`,
        },
      });
      return data.data;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  addFields = async (documentId: string) => {
    const doc = await axios.get(
      this.BASE_URL + "/document" + `/${documentId}`,
      {
        headers: {
          Authorization: `Bearer ${this.API_KEY}`,
        },
      },
    );

    const pageCount = doc.data.page_count;
    const lastPage = pageCount - 1;
    const pageWidth = doc.data.pages[0].size.width; // e.g. ~612 (PDF points)
    const pageHeight = doc.data.pages[0].size.height;
    console.log("Page dimensions:", pageWidth, "x", pageHeight);
    const leftX = 50;
    const rightX = pageWidth - 170 - 50; // 170 is field width, 50 is margin
    const y = pageHeight - 120; // 120 points from bottom
    const payload = {
      fields: [
        {
          type: "signature",
          x: leftX,
          y: y,
          page_number: lastPage,
          role: "Admin",
          width: 200, // ✅ REQUIRED
          height: 50,
          required: true,
        },
        {
          type: "signature",
          x: rightX,
          y: y,
          page_number: lastPage,
          role: "User",
          width: 200, // ✅ REQUIRED
          height: 50,
          required: true,
        },
      ],
    };
    await axios.put(this.BASE_URL + "/document" + `/${documentId}`, payload, {
      headers: {
        Authorization: `Bearer ${this.API_KEY}`,
      },
    });
  };

  embedInvite = async (
    documentId: string,
    adminEmail: string,
    userEmail: string,
  ) => {
    const payload = {
      invites: [
        {
          email: adminEmail,
          role: "Admin",
          order: 1,
          auth_method: "none",
          delivery_type: "email",
        },
        {
          email: userEmail,
          role: "User",
          order: 2,
          delivery_type: "email",
          auth_method: "none",
        },
      ],
      from_email: global["config"].signNow.senderEmail,
      // subject: "Please sign the contract",
      // message: "Kindly sign this document",
    };
    try {
      const res = await axios.post(
        this.BASE_URL + "/v2/documents" + `/${documentId}/embedded-invites`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.API_KEY}`,
          },
        },
      );
      return res.data;
    } catch (error: any) {
      console.error(
        "Error sending invite:",
        error.response?.data || error.message,
      );
      throw new Error(
        "Failed to send invite: " +
          (error.response?.data?.message || error.message),
      );
    }
  };

  getEmbedInviteLink = async (
    documentId: string,
    inviteId: string,
  ) => {
    const payload = {
      auth_method: "none",
      link_expiration: 45,
      session_expiration: 60,
    };
    try {
      const res = await axios.post(
        this.BASE_URL + "/v2/documents" + `/${documentId}/embedded-invites/` + `${inviteId}/link`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.API_KEY}`,
          },
        },
      );
      return res.data;
    } catch (error: any) {
      console.error(
        "Error sending invite:",
        error.response?.data || error.message,
      );
      throw new Error(
        "Failed to send invite: " +
          (error.response?.data?.message || error.message),
      );
    }
  };

  subscribeForEvents = async (documentId: string) => {
    const events = ["document.fieldinvite.signed", "document.complete"];

    for (const event of events) {
      await axios.post(
        this.BASE_URL + "/v2/event-subscriptions",
        {
          event,
          entity_id: documentId,
          attributes: {
            callback: this.CALLBACK_URL,
            use_tls_12: true,
            docid_queryparam: true,
            headers: {
              string_head: "sample_text",
              int_head: 12,
              bool_head: false,
              float_head: 12.24,
            },
            secret_key: "c8XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
            delay: 0,
            retry_count: 3,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.API_KEY}`,
          },
        },
      );
    }
  };

  downloadDocument = async (documentId: string) => {
    try {
      const response = await axios.post(
        this.BASE_URL + "/document" + `/${documentId}/download/link`,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.API_KEY}`,
          },
        },
      );
      console.log(response.data);
      return response.data.link;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };
}
