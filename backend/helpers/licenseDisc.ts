import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import path from "path";

export class LicenseDisk {
  verifyLicenseDisc = async (file: string) => {
    const BASE_URL = global["config"].licenseDisc.url;
    const API_KEY = global["config"].licenseDisc.apiKey;

    const fullpath = global["appRoot"] + file;
    const filePath = path.resolve(fullpath);

    if (!fs.existsSync(filePath)) {
      throw new Error("File not found at: " + filePath);
    }

    if (!BASE_URL || !API_KEY) {
      throw new Error("Missing BASE_URL or API_KEY in config variables");
    }
    try {
      const form = new FormData();
      form.append("license_disk_image", fs.createReadStream(filePath));

      const data = await axios.post(BASE_URL, form, {
        headers: {
          ...form.getHeaders(),
          authorization: "Basic " + API_KEY,
        },
      });
      return  data.data ;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };
}
