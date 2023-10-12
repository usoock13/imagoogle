"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const { join } = require("path");
const fs = require("fs");
const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
let searchKeyword;
rl.question("SEARCH KEYWORD: ", (input) => __awaiter(void 0, void 0, void 0, function* () {
    searchKeyword = input;
    yield crawl();
    rl.close();
}));
const crawl = () => __awaiter(void 0, void 0, void 0, function* () {
    const browser = yield puppeteer_1.default.launch({
        headless: false,
    });
    const page = (yield browser.pages())[0];
    let count = 0;
    let imagesCount = 0;
    yield fs.readdir("./images", (err, files) => {
        imagesCount = files.length;
    });
    const parameter = "&tbm=isch";
    page.goto(`https://google.com/search?q=${searchKeyword}${parameter}`);
    yield new Promise((resolve) => setTimeout(resolve, 1000));
    yield page.waitForNavigation({ waitUntil: "networkidle2" });
    const anchors = yield page.$$(".islrc .isv-r a.islib");
    console.log(anchors.length);
    for (let i = 0; i < anchors.length; i++) {
        yield anchors[i].click();
        let href = "";
        do {
            href = yield (yield anchors[i].getProperty("href")).jsonValue();
            yield new Promise((resolve) => setTimeout(resolve, 100));
        } while (href == "");
        const url = new URL(href).searchParams.get("imgurl");
        console.log(url);
        if (url) {
            try {
                const buffer = Buffer.from(yield (yield fetch(url).catch()).arrayBuffer());
                fs.createWriteStream(`./images/${imagesCount++}.png`).write(buffer);
            }
            catch (e) {
                // UNABLE_TO_VERIFY_LEAF_SIGNATURE
                console.log(e);
            }
        }
    }
    page.close();
});
