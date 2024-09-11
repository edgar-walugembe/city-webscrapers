// this will be useful for the scheduled actor..
import { Dataset } from "apify";

export const removeDuplicatesFromDataset = async (dataset) => {
  const data = await dataset.getData();
  const uniqueItems = [];
  const seenUrls = new Set();

  for (const item of data.items) {
    if (!seenUrls.has(item.url)) {
      seenUrls.add(item.url);
      uniqueItems.push(item);
    }
  }

  // clear the dataset
  await dataset.drop();

  // save unique items back to the dataset
  for (const item of uniqueItems) {
    await dataset.pushData(item);
  }

  console.log(
    `Removed duplicates. Original count: ${data.items.length}, Unique count: ${uniqueItems.length}`
  );
};
