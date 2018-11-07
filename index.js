const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: false,
    slowMo: 5
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });

  page.on('requestfailed', (r) => {
    // console.log(`\tRequest failed          ${r.url()}`);
  });

  page._client.on('Network.loadingFailed', (r) => {
    if (r.blockedReason === 'mixed-content') {
      // r = {
      //   requestId: '1000001331.1110',
      //   timestamp: 2789.760458,
      //   type: 'Script',
      //   errorText: '',
      //   canceled: false,
      //   blockedReason: 'mixed-content'
      // }
      console.log(`\tmixed-content         ${r.requestId}`);
    }
  });

  page._client.on('Network.requestWillBeSent', (r) => {
    if (r.request.mixedContentType === 'optionally-blockable') {
      console.log(`\toptionally-blockable: ${r.request.url}`);
    }
  });

  console.log('----------------------------------------goto top');
  await page.goto('https://jquery-workshop.hatenablog.com/');

  let nextPage;

  console.log('----------------------------------------goto first page');
  nextPage = await page.evaluate(() => document.querySelector('#main article:nth-child(1) h1.entry-title a').href);

  do {
    console.log('----------------------------------------do');
    console.log(nextPage);
    await page.goto(nextPage);

    nextPage = await page.evaluate(() => document.querySelector('a[rel="next"]').href);
  } while (nextPage);

  console.log('----------------------------------------close');
  await browser.close();
})();
