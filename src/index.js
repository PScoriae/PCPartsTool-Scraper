require('dotenv').config()
const axios = require("axios");
const jsdom = require("jsdom")
const { JSDOM } = jsdom
const { MongoClient } = require("mongodb");

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

async function getPopularCPUGPU() {
  try {
    const searchTerms = new Set()
    const urls = ['https://www.techpowerup.com/cpu-specs/?sort=name&ajax=1', 'https://www.techpowerup.com/gpu-specs/?sort=name&ajax=1']
    for (const url of urls) {
      const config = {
        method: 'get',
        url,
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:106.0) Gecko/20100101 Firefox/106.0', 
          'Accept': 'application/json, text/javascript, */*; q=0.01', 
          'Accept-Language': 'en-US,en;q=0.5', 
          'Accept-Encoding': 'gzip, deflate, br', 
          'X-Requested-With': 'XMLHttpRequest', 
          'Connection': 'keep-alive', 
          'Referer': 'https://www.techpowerup.com/cpu-specs/?released=2021&sort=name', 
          'Cookie': 'botcheck2=1; botcheck=83b726e0cec79f59a40e3874315b9b1e; xffrom_search=google; xfcsrf=xGHt6ZEmlH-Z-9SS', 
          'Sec-Fetch-Dest': 'empty', 
          'Sec-Fetch-Mode': 'cors', 
          'Sec-Fetch-Site': 'same-origin', 
          'TE': 'trailers'
        }
      };
      // fetch data
      axios(config)
      .then(function (response) {
        const dom = new JSDOM(response.data.list)
        const data = dom.window.document.querySelectorAll("a")
        data.forEach((datapoint) => {
          const text = data[datapoint].textContent
          if (typeof text !== 'undefined' || text.length <= 6) return
          searchTerms.add(encodeURIComponent(text))
        })
        // for (const datapoint in data) {
        //   if (typeof data[datapoint].textContent !== 'undefined') searchTerms.add(encodeURIComponent(data[datapoint].textContent))
        // }
      })
      .catch(function (error) {
        console.log(error);
      });
      await delay(1000)
    }
    const uniqueSearchTerms = [...new Set(searchTerms)]
    return searchTerms
  } catch (e) {
    console.error(e);
  }
}



async function main() {
  let failCount = 0
  try {
    const searchTerms = await getPopularCPUGPU()
    for (let i = 1; i < 3; i++) {
      for (const searchTerm of searchTerms) {
        console.log(searchTerm)
        const config = {
          method: 'get',
          url: `https://www.lazada.com.my/catalog/?ajax=true&page=${i}&q=${searchTerm}`,
          headers: { 
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:106.0) Gecko/20100101 Firefox/106.0', 
            'Accept': 'application/json, text/plain, */*', 
            'Accept-Language': 'en-US,en;q=0.5', 
            'Accept-Encoding': 'gzip, deflate, br', 
            'X-CSRF-TOKEN': '5eebfee8a319b', 
            'X-Requested-With': 'XMLHttpRequest', 
            'Sec-Fetch-Dest': 'empty', 
            'Sec-Fetch-Mode': 'cors', 
            'Sec-Fetch-Site': 'same-origin', 
            'Referer': 'https://www.lazada.com.my/catalog/?q=rtx+3080+ti&_keyori=ss&from=input&spm=a2o4k.searchlist.search.go.a5c428b9BoMgTR', 
            'Connection': 'keep-alive', 
            'Cookie': '__wpkreporterwid_=2630b6dd-7f13-4e34-08a2-62c8546c6d8b; lzd_cid=b0db399a-2c52-4bca-b3da-a391f190c413; t_uid=b0db399a-2c52-4bca-b3da-a391f190c413; t_fv=1660376845807; _bl_uid=06lLe69draXlktiz65R2nn6rnXtL; isg=BP39jTNbQkXYr-dJoonVx2egD1n3mjHs5O7cYb9CMdSD9h0oh-hcvtJgoKKw7Umk; l=eBMIpH8nL3bcwMsWXOfahurza77tSIOYYuPzaNbMiOCPOr1e52iAW6ysbJLwCn1Nh6DDR3SVgl72BeYBqjj29GGW1Y9tnxHmn; hng=MY|en-MY|MYR|458; userLanguageML=en; sgcookie=E100Pj6M1%2FSMjgJbcfJOVmyXxK640uUxit5koQv88iNDWZbaRKWM80AC1K4%2FGTu7tJZPYo9xpPdCILNK5Nr7l%2BaL3F4ob%2FhONwjNhiwjd1FY6s8%3D; miidlaz=miidgg5oku1gecha4uiule; lzd_click_id=clkgg5oku1gecha4uduld; _m_h5_tk=c306a9b7230026809d3ddf14181510ff_1666813137073; _m_h5_tk_enc=9e39d0fc45c85ca577b4aaea401dffa1; lzd_sid=12faae431b1fbf5e81e5fb00f6e5d242; _tb_token_=5eebfee8a319b; lzd_uid=300000374110; lzd_uti=%7B%22fpd%22%3A%222021-01-08%22%2C%22lpd%22%3A%222021-01-12%22%2C%22cnt%22%3A%2221%22%7D; exlaz=c_lzd_byr:mm_159370573_52051064_2011001151!my1230001:clkgg5oku1gecha4uduld::; t_sid=c3SprTjcAGhgvH8Zi2GSnQWHWEdJioFt; utm_channel=NA; x5sec=7b22617365727665722d6c617a6164613b32223a223165366662363233663066346533613862376463623836643236363264396563434d6e6e355a6f47454f6162705a7543752b446e2f774561446a4d774d4441774d444d334e4445784d44737a4d4a7a687837494451414d3d227d; hng=MY|en-MY|MYR|458; hng.sig=3PRPmcBmKLS4UwrxxIzxYKE2BjFcClNbRbYGSaUai_0', 
            'TE': 'trailers'
          }
        };
        // fetch data
        axios(config)
        .then(function (response) {
          const data = massageData(response.data.mods?.listItems);
          pushData(data)
        })
        .catch(function (error) {
          console.log(error);
          if (error instanceof TypeError) failCount += 1
          if (failCount === 5) {
            console.error('seems to be rate limited. exiting program')
            process.exit()
          }
        });
        // prevent hitting servers too often
        await delay(5000)
      }
    }
  } catch (e) {
    console.error(e);
  }
}

// format lazada data for webapp to use
function massageData(listItems) {
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

    return newObj;
  });

  return formattedList;
}

// upsert data into mongodb
async function pushData(data) {
  const client = new MongoClient(process.env.MONGO_URL);
  try {
    console.log('connecting...')
    await client.connect();
    console.log('connected')

    const pcParts = client.db().collection('pc-parts')
    for (const datapoint of data) {
      await pcParts.updateOne({"price": datapoint.price, "sellerId": datapoint.sellerId, "skuId": datapoint.skuId}, {$set: datapoint}, { upsert: true })
    }
    console.log('successfully upserted data')
  } catch(e) {
    console.error(e)
  } finally {
    await client.close()
  }
}

main().catch(console.error);
