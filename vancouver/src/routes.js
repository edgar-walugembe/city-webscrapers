import { createPlaywrightRouter } from "crawlee";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();
export const router = createPlaywrightRouter();

// /**** Scrapping maseratiVancouver Website ****/
router.addHandler("DETAIL", async ({ request, page, log, dataset }) => {
  //when in the detail page
  log.debug(`Extracting data: ${request.url}`);

  const urlPath = new URL(request.url).pathname;

  const carRegex = /\/vehicle\/(\d{4})-(\w+)-(\w+)-/;
  const carMatch = urlPath.match(carRegex);

  //Car Year, Make, and Model
  const year = carMatch ? carMatch[1] : "Year Not Found";
  const make = carMatch ? carMatch[2] : "Make Not Found";
  const model = carMatch ? carMatch[3] : "Model Not Found";

  //Car Price
  const carPrice =
    (await page.locator("span#final-price").textContent()) || "Not Available";

  const carDetails = {
    car_url: request.url,
    car_id: uuidv4(),
    year,
    make,
    model,
    carPrice,
  };

  log.debug(`Saving data: ${request.url}`);
  await dataset.pushData(carDetails);

  console.log(carDetails);

  //Car Name
  // const carNameWithTrim =
  //   (await page.locator("h1.hero-title").textContent()) || "Not Available";

  // const carTrim =
  //   (await page.locator("span#spec-value-2").textContent()) || "Not Available";

  // function getCarName(carNameWithTrim, carTrim) {
  //   const trimIndex = carNameWithTrim.indexOf(carTrim);

  //   if (trimIndex !== -1) {
  //     return carNameWithTrim.substring(0, trimIndex).trim();
  //   } else {
  //     return carNameWithTrim;
  //   }
  // }

  // const carName = getCarName(carNameWithTrim, carTrim);

  // //Car Image
  // const carImage =
  //   (await page.locator("img#mainPhoto.loaded").getAttribute("src")) ||
  //   "Not Available";

  // //Other Images
  // await page.click("img#mainPhoto.loaded");

  // await page.waitForSelector(".gallery-thumbnail img");

  // const otherCarImages = await page.$$eval(".gallery-thumbnail img", (imgs) =>
  //   imgs.map((img) => img.src)
  // );

  // //Car Condition
  // const carStatus =
  //   (await page.locator("span#spec-value-1").textContent()) || "Not Available";

  // //Car Body Type
  // const carBodyType =
  //   (await page.locator("span#spec-value-3").textContent()) || "Not Available";

  // //Car Engine
  // const carEngine =
  //   (await page.locator("span#spec-value-4").textContent()) || "Not Available";

  // //Car DriveTrain
  // const carDrivetrain =
  //   (await page.locator("span#spec-value-7").textContent()) || "Not Available";

  // //Car Mileage
  // const carMileage =
  //   (await page.locator(".ca-current-mileage").textContent()) ||
  //   "Not Available";

  // //Number of Car Doors
  // const carDoors =
  //   (await page.locator("span#spec-value-12").textContent()) || "Not Available";

  // //Car Color
  // const carExteriorColor =
  //   (await page.locator("span#spec-value-9").textContent()) || "Not Available";

  // const carInteriorColor =
  //   (await page.locator("span#spec-value-10").textContent()) || "Not Available";

  // //Car Fuel Type
  // const carFuelType =
  //   (await page.locator("span#spec-value-13").textContent()) || "Not Available";

  // //Car Transmission
  // const carTransmission =
  //   (await page.locator("span#spec-value-6").textContent()) || "Not Available";

  // //Car Description
  // const carDescription =
  //   (await page.locator("div#vdp-collapsible-short-text").textContent()) ||
  //   "Not Available";

  // const carDetails = {
  //   car_url: request.url,
  //   car_id: uuidv4(),
  //   carManufacturer,
  //   carName,
  //   carYear,
  //   carImage,
  //   otherCarImages,
  //   carStatus,
  //   carMileage,
  //   carPrice,
  //   carBodyType,
  //   carTrim,
  //   carEngine,
  //   carDrivetrain,
  //   carDoors,
  //   carExteriorColor,
  //   carInteriorColor,
  //   carFuelType,
  //   carTransmission,
  //   carDescription,
  // };

  // log.debug(`Saving data: ${request.url}`);

  // await dataset.pushData(carDetails);

  // // this will be useful for the scheduled actor..

  // // const existingData = await dataset.getData();
  // // const isDuplicate = existingData.items.some(
  // //   (item) => item.url === carDetails.url
  // // );

  // // if (!isDuplicate) {
  // //   await dataset.pushData(carDetails);
  // //   console.log(carDetails);
  // // } else {
  // //   log.debug(`Duplicate data found: ${request.url}`);
  // // }

  // console.log(carDetails);
});

router.addHandler("CATEGORY", async ({ page, enqueueLinks, request, log }) => {
  //when in the bodyType page
  log.debug(`Enqueueing pagination for: ${request.url}`);

  const carSelector = ".item.active > a";
  await page.waitForSelector(carSelector);

  await enqueueLinks({
    selector: carSelector,
    label: "DETAIL",
  });

  // Handle endless scroll
  let previousHeight;
  let newHeight = await page.evaluate(() => document.body.scrollHeight);

  while (previousHeight !== newHeight) {
    previousHeight = newHeight;

    // Scroll down
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));

    // Wait for new content to load
    await page.waitForTimeout(3000); // Adjust this delay as needed

    // Recalculate the page height
    newHeight = await page.evaluate(() => document.body.scrollHeight);

    await enqueueLinks({
      selector: carSelector,
      label: "DETAIL",
    });
  }
});

router.addDefaultHandler(async ({ request, page, enqueueLinks, log }) => {
  log.debug(`Enqueueing categories from page: ${request.url}`);

  const newCarLink = ".menu-item-5260 > a";

  await page.waitForSelector(newCarLink);
  await enqueueLinks({
    selector: newCarLink,
    label: "CATEGORY",
  });
});
