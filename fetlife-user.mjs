import puppeteer from 'puppeteer'
import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import Cookies from "./classes/cookies.mjs"
import injectJquery from "./classes/jquery.mjs"
import fs from "fs/promises"

// export async function fetlifeUser(user) {}

export async function saveThumbnail(user) {
	// Add the stealth plugin to puppeteer-extra
	puppeteerExtra.use(StealthPlugin());

	const browser = await puppeteerExtra.launch({
		headless: false,
		devtools: true
	})

	/* COOKIES */
	var cookies = new Cookies()
	cookies.setPageCookies(browser)

	const page = await browser.newPage();
	await page.goto(`https://fetlife.com/${user}`, {waitUntil: 'networkidle0'})
	// await injectJquery(page)
	
	// page.on('response', async (response) => {
		// console.log(response.url())
		// if (/picture\/attachments/.test(response.url())) {
			// const buffer = await response.buffer();
			// await fs.writeFile(`files/thumbnails/${user}-u500.jpg`, buffer);
		// }
	// });

    // var imageUrl = 'https://example.com/image.png';
	// var imageUrl = await page.evaluate(() => {
		// // return $("img.ipp")
		// return document.querySelectorAll("img.ipp")[0]
	// })
	// const imageUrls = await page.$$eval('img.ipp', images => {
		// return images.map(img => img.src);
	// });
	// console.log(imageUrls[0])
	// await page.waitForSelector('img.ipp');
	// const element = await page.$('img.ipp');
	// console.log(element)
	// const buffer = await element.screenshot();
	// const buffer = await page.goto(imageUrls[0]);
	// await fs.writeFileSync(`files/thumbnails/${user}.jpg`, buffer, () => console.log('Image Downloaded!'));
    // const response = await page.goto(imageUrl);

    // if (response.ok()) {
        // const imageBuffer = await response.buffer();
        // await fs.writeFile(`files/thumbnails/${user}.jpg`, imageBuffer);
    // }
	// console.log(imageUrl)
	
	const elem = await page.$$('main > div > div > div > div > a > div > img');
	console.log(elem)
    const img = elem[0];
	console.log(img)
    var res = await img.screenshot({ path: `files/thumbnails/${user}.jpg` });
	browser.close()
	return {
		message: "Image saved"
	}
}

export async function getProfileInfo() {
	var user = {}
	
	user.userId = $("small.text-sm").text().replace("#", "")*1
	
	user.friends = $("div.block > div.text-center > a > div.block").eq(0).text().replace(",", "")*1
	user.followers = $("div.block > div.text-center > a > div.block").eq(1).text().replace(",", "")*1
	user.following = $("div.block > div.text-center > a > div.block").eq(2).text().replace(",", "")*1
	
	user.groups = $("#main-content  div.block .link.text-base.mt-3").text().replace(/\D/g, "")*1
	
	/* BIO */
	user.bio = $(".story__copy > div").text()
	
	/* RELATIONSHIPS */
	user.relationships = []
	$("div.text-base > .flex-auto a.link.underline").each((i, elem) => {
		var user = $(elem).text()
		user.relationships.push(user)
	})
	
	/* WEBSITES */
	user.websites = []
	$("#websites > p > div > a").each((i, elem) => {
		var url = $(elem).attr("href")
	})
	
	return user
}