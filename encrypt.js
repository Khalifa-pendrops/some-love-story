const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const dotenv = require("dotenv");
// const bodyParser = require("body-parser");
dotenv.config();

const app = express();

app.use(cors());
// app.use(bodyParser.json());
app.use(express.json());

const key = Buffer.from(process.env.KEY, "hex");
// const key = process.env.KEY;
console.log("KEY from .env:", process.env.KEY);

let message = `My love, every beat of my heart whispers your name. You are not just my woman - you are my best friend, my peace, my home. 
  I thank the stars every night for blessing me with you.
  No matter where life takes us, my soul is forever wrapped around yours.
  I love you, now and always, with all that I am. ❤️`;

const encryptMessage = (message, key) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  let encrypted = cipher.update(message, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  const payload = {
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
    cipherText: encrypted,
  };

  return JSON.stringify(payload, null, 2);
};

const decryptMessage = (payload, key) => {
  const iv = Buffer.from(payload.iv, "hex");
  const authTag = Buffer.from(payload.authTag, "hex");
  const encryptedText = Buffer.from(payload.cipherText, "hex");

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};

app.get("/api/encrypt", async (req, res) => {
  try {
    const encryptionResult = encryptMessage(message, key);

    res.json(encryptionResult);
  } catch (error) {
    console.error("Encryption failed:", error);
    res.status(500).send("Encryption failed:" + error.message);
  }
});

app.post("/api/decrypt", async (req, res) => {
  try {
    const decryptedResult = decryptMessage(req.body, key);
    res.send(decryptedResult);
  } catch (error) {
    res.status(500).send("Error decrypting message: " + error.message);
  }
});

const PORT = process.env.PORT || 5000;

// console.log(require("crypto").randomBytes(32).toString("hex"));

app.listen(PORT, () => {
  console.log(`This server is running on port ${PORT} 🚀`);
});
