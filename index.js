const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: true });

    const page = await browser.newPage();

    await page.goto('https://www.amazon.com.mx/');
    await page.screenshot({ path: 'amazon.jpg' });

    await page.type('#twotabsearchtextbox', 'xbox series');
    await page.screenshot({ path: 'amazon2.jpg' });

    await page.waitForTimeout(2000);

    await page.click('.nav-search-submit input');
    await page.waitForSelector('[data-component-type=s-search-result]');
    await page.screenshot({ path: 'amazon3.jpg' });

    const enlaces = await page.evaluate(() => {
        const elements = document.querySelectorAll('[data-component-type=s-search-result] h2 a');

        const links = [];

        elements.forEach(element => {
            links.push(element.href);
        });

        return links;
    });

    const xboxs = [];
    for (let enlace of enlaces) {
        await page.goto(enlace);
        await page.waitForSelector('#productTitle');

        const xbox = await page.evaluate(() => {
            const tmp = {};

            tmp.title = document.querySelector('#productTitle').innerText;
            tmp.price = document.querySelector('#priceblock_ourprice_row span#priceblock_ourprice') ? document.querySelector('#priceblock_ourprice_row span#priceblock_ourprice').innerHTML : 'Sin Precio';
            return tmp;
        });
        xboxs.push(xbox);
    }
    console.log(xboxs);
    await browser.close();
})();
