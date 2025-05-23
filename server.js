const express = require("express");
const crypto = require("crypto");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// const corsOptions = {
//   origin: "https://some-love-story.vercel.app/",
//   methods: ["POST", "GET", "OPTIONS"],
//   allowedHeaders: ["Content-Type"],
// };

app.use(cors());
// app.options("*", cors(corsOptions));
app.use(express.static("public"));
app.use(express.json());

const key = Buffer.from(process.env.KEY, "hex");

const message = `My love, every beat of my heart whispers your name. You are not just my woman - you are my best friend, my peace, my home.
I thank the stars every night for blessing me with you.
No matter where life takes us, my soul is forever wrapped around yours.
I love you, now and always, with all that I am. ❤️`;

const encryptMessage = (msg, key) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  let encrypted = cipher.update(msg, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  return {
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
    cipherText: encrypted,
  };
};

const decryptMessage = (payload, key) => {
  const iv = Buffer.from(payload.iv, "hex");
  const authTag = Buffer.from(payload.authTag, "hex");
  const encryptedText = payload.cipherText;

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};

app.get("/encrypt", (req, res) => {
  try {
    const encrypted = encryptMessage(message, key);
    res.json(encrypted);
  } catch (error) {
    res.status(500).send("Encryption failed: " + error.message);
  }
});

app.post("/decrypt", (req, res) => {
  try {
    const decrypted = decryptMessage(req.body, key);
    res.json({ message: decrypted });
  } catch (error) {
    res.status(500).send("Decryption failed: " + error.message);
  }
});

app.listen(port, () => {
  console.log(`This Server running on http://localhost:${port} 🎉`);
});
