import { createPlaywrightRouter } from "crawlee";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();
export const router = createPlaywrightRouter();

/**** Scrapping Autotrader Website ****/
router.addHandler("DETAIL", async ({ request, page, log, dataset }) => {
  //when in the detail page
  log.debug(`Extracting data: ${request.url}`);

  const urlParts = request.url.split("/");
  const Make = urlParts[4] || "Not Available";

  //Car Name
  const carNameWithTrim =
    (await page.locator("h1.hero-title").textContent()) || "Not Available";

  const Trim =
    (await page.locator("span#spec-value-2").textContent()) || "Not Available";

  function getCarName(carNameWithTrim, Trim) {
    const trimIndex = carNameWithTrim.indexOf(Trim);

    if (trimIndex !== -1) {
      return carNameWithTrim.substring(0, trimIndex).trim();
    } else {
      return carNameWithTrim;
    }
  }

  const carName = getCarName(carNameWithTrim, Trim);

  //Car Year
  const pattern = /\b\d{4}\b/;
  const match = carName.match(pattern);
  const Year = match ? match[0] : "No Year Found";

  //Car Model
  function getCarModel(carNameWithTrim, Trim) {
    const carNameNoYear = carNameWithTrim.replace(/\b\d{4}\b/, "").trim();

    const words = carNameNoYear.split(" ");

    const brand = words[0];
    const model = words.slice(1, words.indexOf(Trim)).join(" ");

    return model || "Model Not Found";
  }

  const Model = getCarModel(carNameWithTrim, Trim);

  //Car Location
  const Location = "Calgary";

  //Car Image
  const CoverImage =
    (await page.locator("img#mainPhoto.loaded").getAttribute("src")) ||
    "Not Available";

  //Other Images
  await page.click("img#mainPhoto.loaded");

  await page.waitForSelector(".gallery-thumbnail img");

  const otherCarImages = await page.$$eval(".gallery-thumbnail img", (imgs) =>
    imgs.map((img) => img.src)
  );

  //Car Condition
  const Status =
    (await page.locator("span#spec-value-1").textContent()) || "Not Available";

  //Car Body Type
  const BodyType =
    (await page.locator("span#spec-value-3").textContent()) || "Not Available";

  //Car Engine
  const Engine =
    (await page.locator("span#spec-value-4").textContent()) || "Not Available";

  //Car DriveTrain
  const Drivetrain =
    (await page.locator("span#spec-value-7").textContent()) || "Not Available";

  //Car Price
  const price =
    (await page.locator(".hero-price").textContent()) || "Not Available";

  const Price = `$${price}`;

  //Car Mileage
  const Mileage =
    (await page.locator("span#spec-value-0").textContent()) || "Not Available";

  //Number of Car Doors
  const Doors =
    (await page.locator("span#spec-value-11").textContent()) || "Not Available";

  //Car Color
  const ExteriorColor =
    (await page.locator("span#spec-value-9").textContent()) || "Not Available";

  const InteriorColor =
    (await page.locator("span#spec-value-10").textContent()) || "Not Available";

  //Car Fuel Type
  const FuelType =
    (await page.locator("span#spec-value-12").textContent()) || "Not Available";

  //Car Transmission
  const Transmission =
    (await page.locator("span#spec-value-6").textContent()) || "Not Available";

  //Car Transmission
  const Stock_Number =
    (await page.locator("span#spec-value-8").textContent()) || "Not Available";

  //Car Description
  const Description =
    (await page.locator("div#vdp-collapsible-short-text").textContent()) ||
    "Not Available";

  const carDetails = {
    car_url: request.url,
    car_id: uuidv4(),
    Location,
    Make,
    Model,
    Trim,
    Mileage,
    BodyType,
    Year,
    Status,
    Price,
    ExteriorColor,
    InteriorColor,
    Transmission,
    CoverImage,
    otherCarImages,
    Engine,
    Drivetrain,
    FuelType,
    Stock_Number,
    Doors,
    Description,
  };

  log.debug(`Saving data: ${request.url}`);
  await dataset.pushData(carDetails);

  console.log(carDetails);

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
});

router.addDefaultHandler(async ({ request, page, enqueueLinks, log }) => {
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
    });
  }
});
