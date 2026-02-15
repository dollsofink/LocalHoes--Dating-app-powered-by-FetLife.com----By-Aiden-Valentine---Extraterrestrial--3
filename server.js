import express from "express"
import fs from "fs-extra"
import path from "path"
import vhost from "vhost"
import livereload from "livereload"
import connectLivereload from "connect-livereload"
import AppDAO from './db/database.js';
import FamilyController from './controllers/familyController.js';
import UserController from './controllers/userController.js';
import MessageController from './controllers/messageController.js';
import createRouter from "./routes/index.js";
// import router from "./routes/index.js"
import cors from "cors"

const app = express()
const adminApp = express() // TODO -- this is to show vhost capability
const PORT = 6969
const dao = new AppDAO('./database.sqlite');

/* HELPERS */
function getAllMethods(obj) {
    const methods = new Set();
    let current = obj;
    // Traverse the prototype chain until the top (Object.prototype) is reached
    while (current !== Object.prototype) {
        // Get all property names defined directly on the current object/prototype
        const props = Object.getOwnPropertyNames(current);
        
        for (const prop of props) {
            // Check if the property is a function and not the 'constructor'
            if (typeof current[prop] === 'function' && prop !== 'constructor') {
                methods.add(prop);
            }
        }
        // Move up the prototype chain
        current = Object.getPrototypeOf(current);
    }
    return Array.from(methods);
}


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
app.use(express.static(path.join("files"))) // Static serve images for Chrome extension
app.use(express.urlencoded({ extended: true }))

// Use vhost middleware to route requests
app.use(vhost('admin.localhoes.org', adminApp))
app.use(vhost('fetlife.localhoes.org', adminApp))
// app.use(router)

if (process.argv[2] === "export") {
  await fs.remove("./export")
  await fs.copy("./public", "./export")
  console.log("🔥 Static site exported to /export")
  process.exit(0);
}

/*
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
)
*/

// Connect to DB and start server
async function bootstrap() {
  try {
    await dao.connect();

    const controllers = {
      familyController: new FamilyController(dao),
      userController: new UserController(dao),
      messageController: new MessageController(dao),
    };
	
	console.log(getAllMethods(controllers.familyController))
	console.log(getAllMethods(controllers.userController))
	console.log(getAllMethods(controllers.messageController))

    app.use(createRouter(controllers));

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error("Startup failed:", err);
    process.exit(1);
  }
}

bootstrap();

export const QUEUE_COOLDOWN_MINUTES = Number(
  process.env.QUEUE_COOLDOWN_MINUTES || 5
)
