// Not meant to be used for database related items.
import moment from "moment";
import fs from "fs";
import path from "path";
import config from "../config/config";
import jwt from "jsonwebtoken";
import saltedSha256 from "salted-sha256";
import { ObjectId } from "mongodb";
import puppeteer from "puppeteer";
import crypto from "crypto";

export default class Utility {
  public signJwt = (data: any): string => {
    return jwt.sign(data, config.secret, {
      expiresIn: config.tokenLife,
    });
  };

  public dir = (path): Promise<string> => {
    const dest = global["appRoot"] + global["config"].uploads.path + path;
    fs.mkdirSync(dest, { recursive: true });
    return dest;
  };

  public async uploadFile(file, types: string[], path, extraVar = "") {
    if (file) {
      const originalFileName = file.file[0].originalname.split(".");
      const ext = originalFileName[originalFileName.length - 1];
      if (types.indexOf(ext) === -1) {
        return null;
      }
      const dest = this.dir(path);
      const fileName =
        (extraVar ? extraVar + "_" : "") +
        this.randomString(10) +
        moment().format("x") +
        "." +
        ext;
      fs.renameSync(file.file[0].path, dest + fileName);
      return global["config"].uploads.path + path + fileName;
    }
  }
  public async uploadFiles(file, types: string[], path, extraVar = "") {
    if (file.length > 0) {
      const images: any[] = [];
      file.forEach((el) => {
        const originalFileName = el.originalname.split(".");
        const ext = originalFileName[originalFileName.length - 1];
        if (types.indexOf(ext) === -1) {
          return null;
        }
        const dest = this.dir(path);
        const fileName =
          (extraVar ? extraVar + "_" : "") +
          this.randomString(10) +
          moment().format("x") +
          "." +
          ext;
        fs.renameSync(el.path, dest + fileName);
        images.push({
          name: el.originalname,
          url: global["config"].uploads.path + path + fileName,
        });
      });
      return images;
    }
  }

  public uploadBase64File = (base64Image, dir, extraVar = "") => {
    base64Image = base64Image.split(";base64,");
    let filePath;
    if (base64Image.length === 2) {
      const ext = base64Image[0].split("/").pop();
      const dest = this.dir(dir);
      const fileName =
        (extraVar ? extraVar + "_" : "") +
        this.randomString(10) +
        moment().format("x") +
        "." +
        ext;
      filePath = global["config"].uploads.path + dir + fileName;
      fs.writeFileSync(dest + fileName, base64Image[1], { encoding: "base64" });
    } else {
      filePath = base64Image[0];
    }
    return filePath;
  };

  public deleteFile(path) {
    const fullpath = global["appRoot"] + path;
    if (fs.existsSync(fullpath)) {
      fs.unlinkSync(fullpath);
    }
  }

  public randomString = (length, noOnly = false): string => {
    let result = "";
    let characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    if (noOnly) {
      characters = "0123456789";
    }
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };

  protected salt = (): string => {
    const numberPart = Math.floor(Math.random() * 9) + 1;
    const firstString =
      this.randomString(39 - numberPart) + this.randomString(numberPart, true);
    const number = Math.floor(Math.random() * 30) + 10;
    const secondString =
      this.randomString(numberPart, true) + this.randomString(39 - numberPart);
    return firstString + number + secondString;
  };

  private readonly secretSalt = (salt: string): string => {
    const saltN = parseInt(salt.substring(39, 41));
    return config.secret.substring(saltN, 100);
  };

  public passwordEn = (
    password: string,
    salt?: string,
  ): { password: string; salt: string } => {
    const RO = { password: "", salt: "" };
    if (!salt) {
      salt = this.salt();
    }
    RO.salt = salt;
    const enpass = saltedSha256(password, salt);
    RO.password = saltedSha256(enpass, this.secretSalt(salt));
    return RO;
  };

  public generateNumber = (prefix = "APP") => {
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");

    const randomPart = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0");

    return `${prefix}-${datePart}-${randomPart}`;
  };

  public toObjectId = (value: string | ObjectId): ObjectId => {
    if (value instanceof ObjectId) return value;
    return new ObjectId(value);
  };

  public compareChanges = (newData: any, oldData: any, fields: string[]) => {
    const changed: any = {};

    if (!oldData) {
      fields.forEach((field) => {
        if (newData[field] !== undefined) {
          changed[field] = newData[field];
        }
      });
      return changed;
    }

    const normalize = (val: any): any => {
      if (!val) return val;

      // MongoDB ObjectId
      if (val instanceof ObjectId) return val.toString();

      // Extended JSON { $oid: "..." }
      if (typeof val === "object" && val.$oid) return val.$oid;

      // Array
      if (Array.isArray(val)) return val.map(normalize);

      // Plain object
      if (typeof val === "object") {
        const copy: any = {};
        for (const k of Object.keys(val)) {
          copy[k] = normalize(val[k]);
        }
        return copy;
      }

      return val;
    };

    const deepCompare = (newVal: any, oldVal: any): any => {
      const nVal = normalize(newVal);
      const oVal = normalize(oldVal);

      // Arrays
      if (Array.isArray(nVal) && Array.isArray(oVal)) {
        if (nVal.length !== oVal.length) return newVal;
        const same = nVal.every(
          (v, i) => JSON.stringify(v) === JSON.stringify(oVal[i]),
        );
        return same ? undefined : newVal;
      }

      // Objects
      if (
        nVal &&
        oVal &&
        typeof nVal === "object" &&
        typeof oVal === "object"
      ) {
        const diff: any = {};
        for (const key of Object.keys(nVal)) {
          const subChange = deepCompare(newVal[key], oldVal[key]);
          if (subChange !== undefined) diff[key] = subChange;
        }
        return Object.keys(diff).length > 0 ? diff : undefined;
      }

      // Primitives
      if (nVal !== oVal) return newVal;

      return undefined;
    };

    for (const field of fields) {
      const diff = deepCompare(newData[field], oldData[field]);
      if (diff !== undefined) changed[field] = diff;
    }

    return changed;
  };
  public replaceTemplateData = (template: string, data: any) => {
    return template.replace(/{{(.*?)}}/g, (_, key) => data[key.trim()] || "");
  };

  public generatePdf = async (html: string, name: string, dir: string) => {
    const contractsDir = path.join(process.cwd(), "files", dir);

    // ✅ ensure directory exists
    if (!fs.existsSync(contractsDir)) {
      fs.mkdirSync(contractsDir, { recursive: true });
    }
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // Wrap HTML properly
    await page.setContent(`
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        ${html}
      </body>
    </html>
  `);

    const filePath = path.join(contractsDir, `${dir}_${name}`);
    await page.pdf({
      path: filePath,
      format: "A4",
      printBackground: true,
      margin: {
        top: "40px",
        bottom: "40px",
        left: "40px",
        right: "40px",
      },
    });

    await browser.close();
    return global["config"].uploads.path + `${dir}/` + `${dir}_${name}`;
  };

  public appendSignatures(html: string, data: any): string {
    let signHtml = "";

    if (data.adminSign || data.userSign) {
      signHtml += `
    <div style="display: flex; justify-content: space-between; margin-top: 50px;">
      ${
        data.adminSign
          ? `
        <div style="flex: 1; margin-right: 20px;">
          <strong>Admin Signature:</strong><br/>
          <img src="${data.adminSign}" width="150" /><br/>
          <small>Date: ${new Date(data.adminSignDate).toLocaleDateString()}</small>
        </div>
      `
          : ""
      }

      ${
        data.userSign
          ? `
        <div>
          <strong>User Signature:</strong><br/>
          <img src="${data.userSign}" width="150" /><br/>
          <small>Date: ${new Date(data.userSignDate).toLocaleDateString()}</small>
        </div>
      `
          : ""
      }
    </div>
  `;
    }

    return html + signHtml;
  }

  public generateSlots =(
    date: string,
    testTypeId: ObjectId,
  ) => {
    const baseDate = new Date(date);

    const times = [10, 11, 12, 13, 14, 15, 16, 17, 18];

    return times.map((hour) => {
      const slotDateTime = new Date(baseDate);
      slotDateTime.setHours(hour, 0, 0, 0);

      return {
        _id: new ObjectId(),
        date: new Date(baseDate), // full date
        startTime: slotDateTime, // exact time
        testTypeId,
        isBooked: false,
      };
    });
  }

   private getKey(key) {
    const bufferKey = Buffer.from(key, 'utf8');
    if (bufferKey.length > 32) {
      return Buffer.alloc(32, bufferKey.subarray(0, 32));
    }
    return Buffer.concat([bufferKey, Buffer.alloc(32 - bufferKey.length)]);
  }

  public encryptData = (data: string): any => {
    const key = config.secret
    const iv = crypto.randomBytes(16); // Initialization vector (should be random)
    const cipher = crypto.createCipheriv('aes-256-cbc', this.getKey(key), iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  };

  public decryptData = (data: any): any => {
    const key = config.secret
    const textParts = data.split(':');
    const iv = Buffer.from(textParts[0], 'hex');
    const encrypted = textParts[1];
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.getKey(key), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  };
}
