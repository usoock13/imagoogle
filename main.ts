import puppeteer, { Browser, ElementHandle } from "puppeteer";
import jimp from "jimp";
const { join } = require("path");
const fs = require("fs");
// const fetch = require("fetch");

(async () => {
    const browser: Browser = await puppeteer.launch({
        headless: false,
    });
    const page = (await browser.pages())[0];
    let count = 0;
    let imagesCount = 0;
    await fs.readdir("./images", (err: NodeJS.ErrnoException, files: string[]) => {
        imagesCount = files.length;
    });
    
    const parameter = "&tbm=isch";
    page.goto(`https://google.com/search?q=Fu+Xuan${parameter}`);
    
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await page.waitForNavigation({ waitUntil: "networkidle2" });
    const anchors: ElementHandle<HTMLAnchorElement>[] = await page.$$(".islrc .isv-r a.islib");
    console.log(anchors.length);
    for(let i=0; i<anchors.length; i++) {
        await anchors[i].click();
        let href = "";
        do {
            href = await(await anchors[i].getProperty("href")).jsonValue();
            await new Promise((resolve) => setTimeout(resolve, 100));
        } while(href == "");
        const url = new URL(href).searchParams.get("imgurl");
        if(url) {
            const buffer = Buffer.from(await (await fetch(url)).arrayBuffer());
            fs.createWriteStream(`./images/${imagesCount++}.png`).write(buffer);
        }
    }
    page.close();
})();