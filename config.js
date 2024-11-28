import express from "express";
import { engine } from "express-handlebars";
import pg from "pg";
const { Pool } = pg;
import cookieParser from "cookie-parser";
import multer from "multer";
import sessions from "express-session";
import bcrypt from "bcrypt";
import bbz307 from "bbz307";
import path from "path";

// Configure multer for file uploads

const storage = multer.diskStorage({
  destination: "public/uploads", // Directory for uploads
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/heic"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error("Invalid file type. Only images are allowed."), false); // Reject the file
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

// Main function to create the Express app
export function createApp(dbconfig) {
  const app = express();

  // Configure the PostgreSQL pool
  const pool = new Pool(dbconfig);
  const login = new bbz307.Login("users", ["users", "passwort"], pool);

  // Configure Handlebars as the view engine
  app.engine("handlebars", engine());
  app.set("view engine", "handlebars");
  app.set("views", "./views");

  // Middleware
  app.use(express.static("public")); // Serve static files
  app.use(express.json()); // Parse JSON bodies
  app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
  app.use(cookieParser()); // Parse cookies

  // Session configuration
  app.use(
    sessions({
      secret: "thisismysecrctekeyfhrgfgrfrty84fwir767", // Change to a secure secret in production
      saveUninitialized: true,
      cookie: { maxAge: 86400000, secure: false }, // 1-day session
      resave: false,
    })
  );

  // Set database pool for reuse across routes
  app.locals.pool = pool;

  // User registration
  app.get("/register", (req, res) => {
    res.render("register");
  });

  app.post("/register", async (req, res) => {
    try {
      const hashedPassword = bcrypt.hashSync(req.body.passwort, 10);
      await pool.query("INSERT INTO users (email, passwort) VALUES ($1, $2)", [
        req.body.email,
        hashedPassword,
      ]);
      res.redirect("/login");
    } catch (error) {
      console.error("Error registering user:", error.message);
      res.status(500).send("Error registering user.");
    }
  });

  // User login
  app.get("/login", (req, res) => {
    res.render("login");
  });

  app.post("/login", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM users WHERE email = $1", [
        req.body.email,
      ]);
      if (result.rows.length === 0) {
        return res.redirect("/login");
      }

      const user = result.rows[0];
      if (bcrypt.compareSync(req.body.passwort, user.passwort)) {
        req.session.userid = user.id;
        res.redirect("/");
      } else {
        res.redirect("/login");
      }
    } catch (error) {
      console.error("Error logging in:", error.message);
      res.status(500).send("Error logging in.");
    }
  });

  // Middleware for file uploads
  app.post("/new-post", upload.single("file-upload"), async (req, res) => {
    const { titel, beschreibung } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    if (!titel || !beschreibung) {
      return res.status(400).send("Title and description are require.");
    }

    try {
      await pool.query(
        "INSERT INTO posts (titel, beschreibung, image_path) VALUES ($1, $2, $3)",
        [titel, beschreibung, imagePath]
      );
      res.status(200).send("Post created successfully.");
    } catch (error) {
      console.error("Error saving post:", error.message);
      res.status(500).send("Error saving post.");
    }
  });

  // Global error handler for file upload errors
  app.use((err, req, res, next) => {
    if (
      err instanceof multer.MulterError ||
      err.message.includes("Invalid file type")
    ) {
      return res.status(400).send(err.message);
    }
    next(err);
  });

  return app;
}

export { upload };
