import { createPlaywrightRouter } from "crawlee";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();
export const router = createPlaywrightRouter();

// /**** Scrapping maseratiVictoria Website ****/
router.addHandler("DETAIL", async ({ request, page, log, dataset }) => {
  //when in the detail page
  log.debug(`Extracting data: ${request.url}`);

  const urlPath = new URL(request.url).pathname;

  const carRegex = /\/vehicle\/(\d{4})-(\w+)-(\w+)-/;
  const carMatch = urlPath.match(carRegex);

  //Car Make, Model, and Year
  const Make = carMatch ? carMatch[2] : "Make Not Found";
  const Model = carMatch ? carMatch[3] : "Model Not Found";
  const Year = carMatch ? carMatch[1] : "Year Not Found";

  //Car Location
  const Location = "Victoria";

  //Car Price
  const Price =
    (await page.locator("span#final-price").textContent()) || "Not Available";

  //Car Image
  const Image =
    (await page.locator("img.stat-image-link").getAttribute("src")) ||
    "Not Available";

  const carDetails = {
    car_url: request.url,
    car_id: uuidv4(),
    Make,
    Model,
    Year,
    Location,
    Price,
    Image,
  };

  log.debug(`Saving data: ${request.url}`);
  await dataset.pushData(carDetails);

  console.log(carDetails);
});

router.addHandler("CATEGORY", async ({ page, enqueueLinks, request, log }) => {
  //when in the new cars page
  log.debug(`Enqueueing pagination for: ${request.url}`);

  const carSelector = ".item.active > a";

  await page.waitForSelector(carSelector);
  await enqueueLinks({
    selector: carSelector,
    label: "DETAIL",
  });
});

router.addDefaultHandler(async ({ request, page, enqueueLinks, log }) => {
  log.debug(`Enqueueing categories from page: ${request.url}`);

  const newCarSelector = ".menu-item-2308 > a";

  await page.waitForSelector(newCarSelector);

  await enqueueLinks({
    selector: newCarSelector,
    label: "CATEGORY",
  });
});
