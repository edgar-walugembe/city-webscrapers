import { createPlaywrightRouter } from "crawlee";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();
export const router = createPlaywrightRouter();

// /**** Scrapping maseratiCalgary Website ****/
router.addHandler("DETAIL", async ({ request, page, log, dataset }) => {
  //when in the car details page
  log.debug(`Extracting data: ${request.url}`);

  const urlPath = new URL(request.url).pathname;

  const carRegex = /\/vehicle\/(\d{4})-(\w+)-(\w+)-/;
  const carMatch = urlPath.match(carRegex);

  //Car Make, Model and Year
  const Make = carMatch ? carMatch[2] : "Make Not Found";
  const Model = carMatch ? carMatch[3] : "Model Not Found";
  const Year = carMatch ? carMatch[1] : "Year Not Found";

  //Car Location
  const Location = "Calgary";

  //Car Price
  const price =
    (await page.locator("span#final-price").textContent()) || "Not Available";

  const Price = `$${price}`;

  //Car Image
  const CoverImage =
    (await page.locator("img[itemprop='image']").getAttribute("src")) ||
    "Not Available";

  //Other Images
  await page.waitForSelector(".thumb img");

  const otherCarImages = await page.$$eval(".thumb img", (imgs) =>
    imgs.map((img) => img.src)
  );

  //Car Body Type
  const BodyType =
    (await page.locator("td[itemprop='bodyType']").textContent()) ||
    "Not Available";

  //Car Engine
  const Engine =
    (await page.locator("td[itemprop='vehicleEngine']").textContent()) ||
    "Not Available";

  //Car Trim
  const Trim =
    (await page.locator("[itemprop='model'] span").textContent()) ||
    "Not Available";

  //Car Color
  const ExteriorColor =
    (await page.locator("td[itemprop='color']").textContent()) ||
    "Not Available";

  const InteriorColor =
    (await page.locator("td[itemprop='vehicleInteriorColor']").textContent()) ||
    "Not Available";

  //Car DriveTrain
  const Drivetrain =
    (await page
      .locator("div:nth-of-type(3) tr:nth-of-type(3) td.td-odd")
      .textContent()) || "Not Available";

  //Car Fuel Type
  const FuelType =
    (await page.locator("td[itemprop='fuelType']").textContent()) ||
    "Not Available";

  //Car Transmission
  const Transmission =
    (await page.locator("td[itemprop='vehicleTransmission']").textContent()) ||
    "Not Available";

  //Car Stock_Number
  const Stock_Number =
    (await page.locator("td[itemprop='sku']").textContent()) || "Not Available";

  const carDetails = {
    car_url: request.url,
    car_id: uuidv4(),
    Location,
    Make,
    Model,
    Trim,
    BodyType,
    Year,
    Price,
    ExteriorColor,
    InteriorColor,
    Transmission,
    Drivetrain,
    FuelType,
    CoverImage,
    otherCarImages,
    Engine,
    Stock_Number,
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
