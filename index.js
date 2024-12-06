
import { createApp, upload } from "./config.js";
const app = createApp({
  user: "lively_rain_5690",
  host: "bbz.cloud",
  database: "lively_rain_5690",
  password: "7dca85686bc7c4ce24acc6635f4ef4af",
  port: "30211",
});
/* Startseite */
app.get("/", async (req, res) => {
  try {
    const posts = await app.locals.pool.query(
      "SELECT * FROM posts ORDER BY id DESC"
    );
    res.render("start", { posts: posts.rows }); // Pass posts to the template
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading posts");
  }
});
app.get("/profil", async function (req, res) {
  res.render("profil", {});
});
app.get("/create_post", async function (req, res) {
  res.render("create_post", {});
});
app.get("/new-post", async function (req, res) {
  res.render("new-post", {});
});
app.get("/impressum", async function (req, res) {
  res.render("impressum", {});
});
app.get("/favoriten", async function (req, res) {
  res.render("favoriten", {});
});
app.get("/", async (req, res) => {
  try {
    // Beispielhafte Datenbankabfrage (Passe dies je nach Datenbank an)
    const result = await db.query("SELECT email FROM users WHERE id = 1");
    const headlineText = result[0].email || "Fallback-Überschrift";
    // Daten an die Handlebars-Vorlage übergeben
    res.render("index", { email });
  } catch (error) {
    console.error(error);
    res.status(500).send("Fehler beim Abrufen der Daten");
  }
});
app.post("/create_post", upload.single("bild"), async function (req, res) {
  await app.locals.pool.query(
    "INSERT INTO posts (titel, beschreibung, bild) VALUES ($1, $2, $3)",
    [req.body.titel, req.body.beschreibung, req.file.filename]
  );
  res.redirect("/");
});
/* Wichtig! Diese Zeilen müssen immer am Schluss der Website stehen! */
app.listen(3010, () => {
  console.log(`Example app listening at http://localhost:3010`);
});

