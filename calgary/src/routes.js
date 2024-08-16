import { createPlaywrightRouter } from "crawlee";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();
export const router = createPlaywrightRouter();

// /**** Scrapping maseratiCalgary Website ****/
router.addHandler("DETAIL", async ({ request, page, log, dataset }) => {
  //when in the detail page
  log.debug(`Extracting data: ${request.url}`);

  const urlPath = new URL(request.url).pathname;

  const carRegex = /\/vehicle\/(\d{4})-(\w+)-(\w+)-/;
  const carMatch = urlPath.match(carRegex);

  const year = carMatch ? carMatch[1] : "Year Not Found";
  const make = carMatch ? carMatch[2] : "Make Not Found";
  const model = carMatch ? carMatch[3] : "Model Not Found";

  console.log(`Year: ${year}`);
  console.log(`Make: ${make}`);
  console.log(`Model: ${model}`);

  //Car Name
  const carNameWithTrim =
    (await page.locator("h1.hero-title").textContent()) || "Not Available";

  const carTrim =
    (await page.locator("span#spec-value-2").textContent()) || "Not Available";

  function getCarName(carNameWithTrim, carTrim) {
    const trimIndex = carNameWithTrim.indexOf(carTrim);

    if (trimIndex !== -1) {
      return carNameWithTrim.substring(0, trimIndex).trim();
    } else {
      return carNameWithTrim;
    }
  }

  const carName = getCarName(carNameWithTrim, carTrim);

  //Car Year
  const pattern = /\b\d{4}\b/;
  const match = carName.match(pattern);
  const carYear = match ? match[0] : "No Year Found";

  //Car Image
  const carImage =
    (await page.locator("img#mainPhoto.loaded").getAttribute("src")) ||
    "Not Available";

  //Other Images
  await page.click("img#mainPhoto.loaded");

  await page.waitForSelector(".gallery-thumbnail img");

  const otherCarImages = await page.$$eval(".gallery-thumbnail img", (imgs) =>
    imgs.map((img) => img.src)
  );

  //Car Condition
  const carStatus =
    (await page.locator("span#spec-value-1").textContent()) || "Not Available";

  //Car Body Type
  const carBodyType =
    (await page.locator("span#spec-value-3").textContent()) || "Not Available";

  //Car Engine
  const carEngine =
    (await page.locator("span#spec-value-4").textContent()) || "Not Available";

  //Car DriveTrain
  const carDrivetrain =
    (await page.locator("span#spec-value-7").textContent()) || "Not Available";

  //Car Price
  const carPrice =
    (await page.locator(".pa-current-asking-price").textContent()) ||
    "Not Available";

  //Car Mileage
  const carMileage =
    (await page.locator(".ca-current-mileage").textContent()) ||
    "Not Available";

  //Number of Car Doors
  const carDoors =
    (await page.locator("span#spec-value-12").textContent()) || "Not Available";

  //Car Color
  const carExteriorColor =
    (await page.locator("span#spec-value-9").textContent()) || "Not Available";

  const carInteriorColor =
    (await page.locator("span#spec-value-10").textContent()) || "Not Available";

  //Car Fuel Type
  const carFuelType =
    (await page.locator("span#spec-value-13").textContent()) || "Not Available";

  //Car Transmission
  const carTransmission =
    (await page.locator("span#spec-value-6").textContent()) || "Not Available";

  //Car Description
  const carDescription =
    (await page.locator("div#vdp-collapsible-short-text").textContent()) ||
    "Not Available";

  const carDetails = {
    car_url: request.url,
    car_id: uuidv4(),
    carMake,
    carName,
    carYear,
    carImage,
    otherCarImages,
    carStatus,
    carMileage,
    carPrice,
    carBodyType,
    carTrim,
    carEngine,
    carDrivetrain,
    carDoors,
    carExteriorColor,
    carInteriorColor,
    carFuelType,
    carTransmission,
    carDescription,
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
