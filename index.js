import { createApp, upload } from "./config.js";

const app = createApp({
  user: "lively_rain_5690",
  host: "bbz.cloud",
  database: "lively_rain_5690",
  password: "7dca85686bc7c4ce24acc6635f4ef4af",
  port: "30211",
});

/* Startseite */
app.get("/", async function (req, res) {
  const events = await app.locals.pool.query("select * from  posts");
  res.render("start", {});
});

app.get("/profil", async function (req, res) {
  res.render("profil", {});
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

app.get("/newposts", (req, res) => {
  res.sendFile(__dirname + "/path/to/newposts.html");
});

app.post("/new-post", upload.single("file-upload"), async function (req, res) {
  await app.locals.pool.query("INSERT INTO posts (text) VALUES ($1)", [
    req.body.text,
  ]);
  res.redirect("/");
});

/* Wichtig! Diese Zeilen müssen immer am Schluss der Website stehen! */
app.listen(3010, () => {
  console.log(`Example app listening at http://localhost:3010`);
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
