import { JobsEnum } from "@roshi/shared";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import PgBoss from "pg-boss";
import { CONFIG } from "./config";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const server = app.listen(CONFIG.PORT, () => {
  console.log(`App listening on port ${CONFIG.PORT}`);
});

export const boss = new PgBoss({
  connectionString: CONFIG.JOBS_DATABASE_URL,
  //Disable ssl for localhost
  ssl: CONFIG.JOBS_DATABASE_URL.includes("localhost") ? false : true,
});

(async () => {
  await boss.start();
  await boss.createQueue(JobsEnum.WA_MESSAGE_RECEIVED);
  await boss.createQueue(JobsEnum.WA_EVENT_RECEIVED);
  app.post("/whatsapp/:id", async (req, res) => {
    if (req.params.id !== CONFIG.TOKEN) return res.sendStatus(401);
    try {
      boss.send(JobsEnum.WA_MESSAGE_RECEIVED, req.body);
      res.sendStatus(200);
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  });
  app.post("/whatsapp-event/:id", async (req, res) => {
    if (req.params.id !== CONFIG.TOKEN) return res.sendStatus(401);
    try {
      boss.send(JobsEnum.WA_EVENT_RECEIVED, req.body);
      res.sendStatus(200);
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  });
})();

// Graceful shutdown
const gracefulShutdown = async () => {
  try {
    console.log("Shutting down gracefully...");
    server.close(() => {
      console.log("Closed out remaining connections.");
      process.exit(0);
    });

    await boss.stop();
    console.log("pg-boss stopped successfully.");
  } catch (error) {
    console.error("Error during pg-boss shutdown:", error);
  }

  // If server close takes too long, force exit
  setTimeout(() => {
    console.error("Forcing shutdown...");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
