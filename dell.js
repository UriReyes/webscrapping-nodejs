const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        await page.goto('https://www.dell.com/support/security/es-mx');
        // await page.waitForSelector('#tblSLPGrid a');
        await page.waitForTimeout(6000);
        await page.waitForSelector('a[aria-disabled=false].next-btn');

        const all_links = [];
        while (await page.$('a[aria-disabled=false].next-btn')) {
            const links = await page.evaluate(() => {
                const elements = document.querySelectorAll('#tblSLPGrid a');

                const links = [];

                elements.forEach(element => {
                    links.push(element.href);
                });

                return links;
            });
            all_links.push(links);
            await page.waitForTimeout(1000);
            await page.click('a[aria-disabled=false].next-btn');
        }

        const notices = [];
        for (const link of all_links.flat()) {
            await page.goto(link);
            await page.waitForSelector('#detailTitle');

            const notice = await page.evaluate(() => {
                const tmp = {};
                tmp.title = document.querySelector('#detailTitle') ? document.querySelector('#detailTitle').innerText : 'No Content';
                tmp.resume = document.querySelector('#summaryFullContent') ? document.querySelector('#summaryFullContent').innerText : 'No Content';

                return tmp;
            });

            notices.push(notice);
        }

        //    Write JSON File
        const jsonContent = JSON.stringify({ notices });
        fs.writeFile("dell_notices.json", jsonContent, 'utf8', function (err) {
            if (err) {
                console.log("An error occured while writing JSON Object to File.");
                return console.log(err);
            }
            console.log("JSON file has been saved.");
        });


        await browser.close();
    } catch (error) {
        console.log(error);
    }
})();