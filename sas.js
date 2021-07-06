const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto('https://support.sas.com/en/security-bulletins.html#vulnerability-notes');
    await page.waitForTimeout(6000);
    await page.waitForSelector('a.next');

    const all_links = [];
    while (await (await page.$$('.next:not(.disabled)')).length > 1) {
        const links = await page.evaluate(() => {
            const elements = document.querySelectorAll('tr td a');

            const links = [];

            elements.forEach(element => {
                links.push(element.href);
            });
            document.querySelectorAll('a.next')[1].click();
            return links;
        });
        all_links.push(links);
    }
    const sanitizedLinks = all_links.flat().filter(link => link.includes('kb'));
    const notices = [];
    for (const link of sanitizedLinks) {
        await page.goto(link);
        // await page.waitForSelector('#content2');

        const notice = await page.evaluate(() => {
            const tmp = {};
            tmp.title = document.querySelector('#content2') != null ? document.querySelector('#content2 h2').innerText : 'No Content';
            tmp.severity = document.querySelector('#tab_details p:nth-child(1)') != null ? document.querySelector('#tab_details p:nth-child(1)').innerText : 'No Content';
            tmp.description = document.querySelector('#tab_details p:nth-child(2)') != null ? document.querySelector('#tab_details p:nth-child(2)').innerText : 'No Content';
            tmp.impact = document.querySelector('#tab_details p:nth-child(3)') != null ? document.querySelector('#tab_details p:nth-child(3)').innerText : 'No Content';
            return tmp;
        });

        notices.push(notice);
    }

    //    Write JSON File
    const jsonContent = JSON.stringify({ notices });
    fs.writeFile("sas_notices.json", jsonContent, 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }
        console.log("JSON file has been saved.");
    });


    await browser.close();
})();