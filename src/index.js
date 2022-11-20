require("dotenv").config();
const axios = require("axios");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { MongoClient } = require("mongodb");
const cron = require("node-cron");
const searchTermFile = require("./searchTerms.json");
const headersFile = require("./headers.json");

// pauses execution in milliseconds
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getPopularCPUGPU() {
  const searchTerms = {};
  const urls = [
    "https://www.techpowerup.com/cpu-specs/?sort=name&ajax=1",
    "https://www.techpowerup.com/gpu-specs/?sort=name&ajax=1",
  ];
  const keys = ["cpu", "gpu"];
  for (let i = 0; i < urls.length; i++) {
    const currSearchTerms = new Set();
    const config = {
      method: "get",
      url: urls[i],
      headers: headersFile.techPowerUp,
    };
    // fetch trending cpu and gpu skus
    await axios(config)
      .then(function (response) {
        const dom = new JSDOM(response.data.list);
        const data = dom.window.document.querySelectorAll("a");
        for (const datapoint in data) {
          if (
            typeof data[datapoint].textContent !== "undefined" &&
            data[datapoint].textContent.length > 9 &&
            data[datapoint].textContent.toLowerCase() !== "polaris"
          )
            currSearchTerms.add(
              encodeURIComponent(data[datapoint].textContent)
            );
        }
        searchTerms[keys[i]] = currSearchTerms;
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  return searchTerms;
}

async function getSearchTerms() {
  const searchTerms = await getPopularCPUGPU();
  searchTerms["motherboard"] = searchTermFile.motherboard;
  searchTerms["memory"] = searchTermFile.memory;
  searchTerms["psu"] = searchTermFile.psu;
  searchTerms["cooling"] = searchTermFile.cooling;
  searchTerms["case"] = searchTermFile.case;
  searchTerms["storage"] = searchTermFile.storage;
  return searchTerms;
}

async function main() {
  let failCount = 0;
  const searchTerms = await getSearchTerms();
  for (let i = 1; i <= 5; i++) {
    for (const [key, values] of Object.entries(searchTerms)) {
      for (const value of values) {
        console.log(`${value}: page ${i}`);
        const config = {
          method: "get",
          url: `https://www.lazada.com.my/catalog/?ajax=true&page=${i}&q=${value}`,
          headers: headersFile.lazada,
        };
        // fetch data
        axios(config)
          .then(function (response) {
            const data = massageData(
              filterData(response.data.mods?.listItems),
              key
            );
            pushData(data);
          })
          .catch(function (error) {
            console.log(error);
            if (error instanceof TypeError) failCount += 1;
            if (failCount === 5) {
              console.error("seems to be rate limited. exiting program");
              process.exit();
            }
          });
        // prevent hitting servers too often
        await delay(10000);
      }
    }
  }
}

// filter parts with banned words
function filterData(listItems) {
  bannedWords = ["laptop", "custom", "budget"];
  const filteredData = listItems.filter((obj) => {
    for (const bannedWord of bannedWords) {
      return !obj.name.toLowerCase().includes(bannedWord);
    }
  });
  return filteredData;
}

// format lazada data for webapp to use
function massageData(listItems, type) {
  const formattedList = listItems.map((obj) => {
    const newObj = {};

    newObj.name = obj.name;
    newObj.imgUrl = obj.image;
    newObj.itemUrl = `https://${obj.itemUrl.slice(2)}`;
    newObj.price = obj.price;
    newObj.sellerName = obj.sellerName;
    newObj.sellerId = obj.sellerId;
    newObj.skuId = obj.skuId;
    newObj.type = type;

    return newObj;
  });

  return formattedList;
}

// upsert data into mongodb
async function pushData(data) {
  const client = new MongoClient(process.env.MONGO_URL);
  try {
    console.log("connecting...");
    await client.connect();
    console.log("connected");

    const pcParts = client.db().collection("pc-parts");
    for (const datapoint of data) {
      await pcParts.updateOne(
        {
          sellerId: datapoint.sellerId,
          skuId: datapoint.skuId,
        },
        { $set: datapoint },
        { upsert: true }
      );
    }
    console.log("successfully upserted data");
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

console.log("I've started up!");

// run once a day at midnight
cron.schedule("0 0 * * *", () => {
  console.log("Syncing products...");
  main().catch(console.error);
  console.log("Done syncing!");
});
