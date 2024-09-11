import { createPlaywrightRouter } from "crawlee";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();
export const router = createPlaywrightRouter();

// /**** Scrapping Autotrader Website ****/
router.addHandler("DETAIL", async ({ request, page, log, dataset }) => {
  //when in the detail page
  log.debug(`Extracting data: ${request.url}`);

  const urlParts = request.url.split("/");
  const carManufacturer = urlParts[4] || "Not Available";

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
    carManufacturer,
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

  // this will be useful for the scheduled actor..

  // const existingData = await dataset.getData();
  // const isDuplicate = existingData.items.some(
  //   (item) => item.url === carDetails.url
  // );

  // if (!isDuplicate) {
  //   await dataset.pushData(carDetails);
  //   console.log(carDetails);
  // } else {
  //   log.debug(`Duplicate data found: ${request.url}`);
  // }

  console.log(carDetails);
});

router.addDefaultHandler(
  "CATEGORY",
  async ({ request, page, enqueueLinks, log }) => {
    log.debug(`Enqueueing car listings for: ${request.url}`);

    const productSelector = ".dealer-split-wrapper > a";
    const nextPageSelector = "a.last-page-link";

    await page.waitForSelector(productSelector);
    await enqueueLinks({
      selector: productSelector,
      label: "DETAIL",
    });

    const nextButton = await page.$(nextPageSelector);
    if (nextButton) {
      await enqueueLinks({
        selector: nextPageSelector,
        label: "CATEGORY",
      });
    }
  }
);
