import { PlaywrightCrawler, log } from "crawlee";
import { Actor, Dataset } from "apify";

import { router } from "./routes.js";
// import { removeDuplicatesFromDataset } from "./deduplicate.js";

import dotenv from "dotenv";

dotenv.config();

await Actor.init();

log.setLevel(log.LEVELS.DEBUG);

log.debug("Setting up crawler.");

//Initialize a default dataset where data wil be stored
const dataset = await Dataset.open(process.env.DATASET_NAME_SEATTLE);

const crawler = new PlaywrightCrawler({
  requestHandler: async ({ request, page, log, enqueueLinks }) => {
    await router({ request, page, log, enqueueLinks, dataset });
  },
});

await crawler.run(["https://www.maseratiofseattle.com/"]);

// this will be useful for the scheduled actor..
// await removeDuplicatesFromDataset(dataset);

await Actor.exit();
