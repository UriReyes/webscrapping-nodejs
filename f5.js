const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto('https://support.f5.com/csp/new-updated-articles');

    // await page.waitForSelector('.coveo-results-per-page-list');
    // await page.click('.coveo-results-per-page-list li:nth-child(4) a'); //Seteo a la página para mostrar 100
    await page.waitForTimeout(6000);

    const all_links = [];
    while (await page.$('li[aria-label="Next"]')) {
        const links = await page.evaluate(() => {
            const elements = document.querySelectorAll('div.CoveoResult a');

            const links = [];

            elements.forEach(element => {
                links.push(element.href);
            });

            document.querySelector('li[aria-label="Next"]').click();

            return links;
        });
        await page.waitForTimeout(2000);
        all_links.push(links);
    }


    const notices = [];
    for (const link of all_links.flat()) {
        await page.goto(link);
        await page.waitForSelector('h2');

        const notice = await page.evaluate(() => {
            const tmp = {};

            tmp.title = document.querySelector('h2').innerText;
            if (document.querySelector('.article-content p:nth-child(1)')) {
                let description = "";
                description = document.querySelector('.article-content p:nth-child(1)').innerText;
                if (document.querySelector('.article-content p:nth-child(1)').nextSibling) {
                    if (document.querySelector('.article-content p:nth-child(1)').nextSibling.nodeName == '#text') {
                        description += document.querySelector('.article-content p:nth-child(1)').nextSibling.nodeValue;
                    }
                }

                if (document.querySelector('.article-content p:nth-child(1)').nextElementSibling) {
                    if (document.querySelector('.article-content p:nth-child(1)').nextElementSibling.nodeName == 'UL') {
                        description += `${document.querySelector('.article-content p:nth-child(1)').nextElementSibling.innerText}`;
                    }
                }

                tmp.description = description;
            } else {
                tmp.description = 'No Content';
            }
            return tmp;
        });
        notices.push(notice);
    }

    //    Write JSON File
    const jsonContent = JSON.stringify({ notices });
    fs.writeFile("f5_notices.json", jsonContent, 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }
        console.log("JSON file has been saved.");
    });

    await browser.close();
})();