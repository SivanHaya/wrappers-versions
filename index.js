const fs = require('fs');
const path = require('path');
const express = require('express');
const gplay = require('google-play-scraper');
const appStore = require('app-store-scraper');
const brands = require('./config.json');

const app = express();

const getGoogleVersion = (appId) => {
  return new Promise((resolve) => {
    gplay.app({ appId, lang: 'en', country: 'uk' }).then((res) => {
      resolve(res.version);
    }).catch((e) => {
      console.log(e);
      getGoogleVersion(appId).then((res) => {
        resolve(res.version);
      });
    });
  });
};

const getAppleVersion = (id) => {
  return new Promise((resolve) => {
    appStore.app({ id, country: 'gb' }).then((res) => {
      resolve(res.version);
    }).catch((e) => {
      console.log(e);
      getAppleVersion(id).then((res) => {
        resolve(res.version);
      });
    });
  });
};

const getObj = (brand) => {
  return new Promise((resolve) => {
    Promise.all([
      getGoogleVersion(brand.googleID),
      getAppleVersion(brand.appleVersion)
    ]).then((versions) => {
      resolve({
        brand: brand.label,
        googleVersion: versions[0],
        appleVersion: versions[1]
      });
    });
  });
};

const str1 = "{\"brands\":";
const str2 = "}";

const writeBrandsJSON = () => {
  Promise.all(brands.map((brand) => {
    return getObj(brand)
  })).then((res) => {
    fs.unlink('./public/brandsVersions.json', (a) => {
      fs.writeFile('./public/brandsVersions.json', str1 + JSON.stringify(res, null, 2) + str2, 'utf8', () => {
        console.log('Operation finished successfully');
      });
    });
  });
};

writeBrandsJSON();

setInterval(() => {
  writeBrandsJSON();
}, 1000 * 60 * 5);

const publicPath = path.join(__dirname, 'public');
const port = process.env.PORT || 3000;

app.use(express.static(publicPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.listen(port, () => { console.log('server is up'); });
