import express from "express"
import fs from "fs-extra"
import path from "path"
import vhost from "vhost"
import livereload from "livereload"
import connectLivereload from "connect-livereload"
import router from "./routes.js"
import cors from "cors"

const app = express()
const adminApp = express() // TODO -- this is to show vhost capability
const PORT = 6969

// Only use livereload in development
if (process.env.NODE_ENV === 'development') {
    const liveReloadServer = livereload.createServer();
    liveReloadServer.watch(path.join(".", 'public')); // Watch public directory

    // Ping the browser once the server has restarted
    liveReloadServer.server.once('connection', () => {
        setTimeout(() => {
            liveReloadServer.refresh('/');
        }, 100);
    });

    // Inject the livereload script into served HTML
    app.use(connectLivereload());
}

// Set EJS as the view engine
app.set("view engine", "ejs")
app.set('layout', 'layout/full-width')
app.use(cors())
app.use(express.json())
app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }))

// Use vhost middleware to route requests
app.use(vhost('admin.localhoes.org', adminApp))
app.use(vhost('fetlife.localhoes.org', adminApp))
app.use(router)

if (process.argv[2] === "export") {
  await fs.remove("./export")
  await fs.copy("./public", "./export")
  console.log("🔥 Static site exported to /export")
  process.exit(0);
}

app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
)

export const QUEUE_COOLDOWN_MINUTES = Number(
  process.env.QUEUE_COOLDOWN_MINUTES || 5
)
