import puppeteer, { Browser, ElementHandle } from "puppeteer";
import jimp from "jimp";
const { join } = require("path");
const fs = require("fs");
const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let searchKeyword: string;
rl.question("SEARCH KEYWORD: ", async (input: string) => {
    searchKeyword = input;
    await crawl();
    rl.close();
});

const crawl = async () => {
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
    page.goto(`https://google.com/search?q=${searchKeyword}${parameter}`);
    
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
        console.log(url);
        if(url) {
            try {
                const buffer = Buffer.from(await (await fetch(url).catch()).arrayBuffer());
                fs.createWriteStream(`./images/${imagesCount++}.png`).write(buffer);
            } catch (e) {
                // UNABLE_TO_VERIFY_LEAF_SIGNATURE
                console.log(e);
            }
        }
    }
    page.close();
}