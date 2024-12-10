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
      "SELECT  posts.id, posts.titel, posts.bild from posts "
    );
    res.render("start", { posts: posts.rows }); // Pass posts to the template
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading posts");
  }
});
app.get("/post-ansicht", async function (req, res) {
  try {
    const posts = await app.locals.pool.query(
      "SELECT  posts.id, posts.titel, posts.beschreibung, posts.bild from posts "
    );
    res.render("post-ansicht", { posts: posts.rows }); // Pass posts to the template
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading posts");
  }
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

app.get("/profil", async function (req, res) {
  res.render("profil", { email: req.session.email });
  const posts = await app.locals.pool.query(
    "SELECT * FROM posts WHERE user_id = $1",
    [req.session.userid]
  );
});

function isLoggedIn(req, res, next) {
  if (req.session.userid) {
    // Benutzer ist eingeloggt, weiter zur Profilseite
    return next();
  } // Benutzer ist nicht eingeloggt, weiterleiten zur Login-Seite
  else res.redirect("/login");
}

app.post("/create_post", upload.single("bild"), async function (req, res) {
  await app.locals.pool.query(
    "INSERT INTO posts (user_id, titel, beschreibung, bild) VALUES ($1, $2, $3, $4)",
    [
      req.session.userid,
      req.body.titel,
      req.body.beschreibung,
      req.file.filename,
    ]
  );
  res.redirect("/");
});

//likes
app.post("/like/:id", async function (req, res) {
  if (!req.session.userid) {
    res.redirect("/login");
    return;
  }
  await app.locals.pool.query(
    "INSERT INTO favoriten (posts_id, user_id) VALUES ($1, $2)",
    [req.params.id, req.session.userid]
  );
  res.redirect("/");
});

app.get("/posts/:id", async function (req, res) {
  const post = await app.locals.pool.query(
    "SELECT * FROM posts WHERE id = $1",
    [req.params.id]
  );
  const likes = await app.locals.pool.query(
    "SELECT COUNT(user_id) FROM favoriten WHERE posts_id = $1",
    [req.params.id]
  );
  res.render("details", { event: event.rows[0], likes: likes.rows[0] });
});

/* Wichtig! Diese Zeilen müssen immer am Schluss der Website stehen! */
app.listen(3010, () => {
  console.log(`Example app listening at http://localhost:3010`);
});
