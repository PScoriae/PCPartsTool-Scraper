require("dotenv").config();
const axios = require("axios");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { MongoClient } = require("mongodb");

// pauses execution in milliseconds
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getPopularCPUGPU() {
  const searchTerms = {}
  const urls = [
    "https://www.techpowerup.com/cpu-specs/?sort=name&ajax=1",
    "https://www.techpowerup.com/gpu-specs/?sort=name&ajax=1",
  ];
  const keys = ['cpu', 'gpu']
  for (let i = 0; i < urls.length; i++) {
    const currSearchTerms = new Set();
    const config = {
      method: "get",
      url: urls[i],
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:106.0) Gecko/20100101 Firefox/106.0",
        Cookie:
          "botcheck2=1; botcheck=83b726e0cec79f59a40e3874315b9b1e; xffrom_search=google; xfcsrf=xGHt6ZEmlH-Z-9SS",
      },
    };
    // fetch data
    await axios(config)
      .then(function (response) {
        const dom = new JSDOM(response.data.list);
        const data = dom.window.document.querySelectorAll("a");
        for (const datapoint in data) {
          if (
            typeof data[datapoint].textContent !== "undefined" &&
            data[datapoint].textContent.length > 9
          )
            currSearchTerms.add(encodeURIComponent(data[datapoint].textContent));
        }
        searchTerms[keys[i]] = currSearchTerms
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  return searchTerms;
}

async function getSearchTerms() {
  const searchTerms = await getPopularCPUGPU();
  searchTerms['motherboard'] = ["intel motherboard", "amd motherboard"]
  searchTerms['memory'] = ["ddr3 ram", "ddr4 ram", "ddr5 ram"]
  searchTerms['psu'] = ["atx power supply", "sfx power supply"]
  searchTerms['cooling'] = ["cpu cooler", "cpu liquid cooler", "pc fans", "pc case fans"]
  searchTerms['case'] = ["pc case", "atx pc case", "micro atx pc case", "mini itx pc case"]
  searchTerms['storage'] = ["ssd", "nvme", "internal hard drive"]
  return searchTerms;
}

async function main() {
  let failCount = 0;
  const searchTerms = await getSearchTerms();
  for (let i = 1; i <= 3; i++) {
    for (const [key, values] of Object.entries(searchTerms)) {
      for (const value of values) {
        console.log(`${value}: page ${i}`)
        const config = {
          method: "get",
          url: `https://www.lazada.com.my/catalog/?ajax=true&page=${i}&q=${value}`,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:106.0) Gecko/20100101 Firefox/106.0",
            Accept: "application/json, text/plain, */*",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate, br",
            "X-CSRF-TOKEN": "5eebfee8a319b",
            "X-Requested-With": "XMLHttpRequest",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            Referer:
              "https://www.lazada.com.my/catalog/?q=rtx+3080+ti&_keyori=ss&from=input&spm=a2o4k.searchlist.search.go.44cd28b9EHMiBH",
            Connection: "keep-alive",
            Cookie:
              "__wpkreporterwid_=2630b6dd-7f13-4e34-08a2-62c8546c6d8b; lzd_cid=b0db399a-2c52-4bca-b3da-a391f190c413; t_uid=b0db399a-2c52-4bca-b3da-a391f190c413; t_fv=1660376845807; _bl_uid=06lLe69draXlktiz65R2nn6rnXtL; isg=BPb2GH9DiRz9AXwcHTRuijAVRCz4FzpRU3snFGDf4ll0o5Y9yKeKYVyVu_fPEDJp; l=eBMIpH8nL3bcwqofmOfahurza77OSIOYYuPzaNbMiOCPOJ1H5HaCW6yIp7YMC31Nh6kXR3SVgl72BeYBqj02zHUD1Y9tnxDmn; miidlaz=miidgg5oku1gecha4uiule; lzd_click_id=clkgg5oku1gecha4uduld; _m_h5_tk=417f776803a0cb617826c95006cb9b7a_1667065766897; _m_h5_tk_enc=5ffb73d99515f6b36c88209f1e566d9a; lzd_sid=12faae431b1fbf5e81e5fb00f6e5d242; _tb_token_=5eebfee8a319b; lzd_uid=300000374110; lzd_uti=%7B%22fpd%22%3A%222021-01-08%22%2C%22lpd%22%3A%222021-01-12%22%2C%22cnt%22%3A%2221%22%7D; exlaz=c_lzd_byr:mm_159370573_52051064_2011001151!my1230001:clkgg5oku1gecha4uduld::; hng=MY|en-MY|MYR|458; userLanguageML=en; t_sid=FEgMmJINDMtgXJKzfRRzVaxHj80yUduq; utm_channel=NA; hng=MY|en-MY|MYR|458; hng.sig=3PRPmcBmKLS4UwrxxIzxYKE2BjFcClNbRbYGSaUai_0",
            TE: "trailers",
          },
        };
        // fetch data
        axios(config)
          .then(function (response) {
            const data = massageData(response.data.mods?.listItems, key);
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

// format lazada data for webapp to use
function massageData(listItems, type) {
  const formattedList = listItems.map((obj) => {
    const newObj = {};

    newObj.name = obj.name;
    newObj.imgUrl = obj.image;
    newObj.itemUrl = `https://${obj.itemUrl.slice(2)}`;
    newObj.price = obj.price;
    newObj.desc = obj.description;
    newObj.sellerName = obj.sellerName;
    newObj.sellerId = obj.sellerId;
    newObj.skuId = obj.skuId;
    newObj.type = type

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
          price: datapoint.price,
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

main().catch(console.error);
