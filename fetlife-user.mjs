import puppeteer from 'puppeteer'
import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import Cookies from "./classes/cookies.mjs"
import injectJquery from "./classes/jquery.mjs"
import fs from "fs/promises"
import { insert } from "./classes/users.mjs"

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Extracts all URLs from a given text string.
 * @param {string} text The string to extract URLs from.
 * @returns {string[]} An array of found URLs.
 */
function extractUrls(text) {
    // Regular expression to find URLs starting with http or https
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    // Use the match() method to get all instances
    const matches = text.match(urlRegex);
    
    // Return the matches array (or an empty array if none found)
    return matches || [];
}

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

export async function getUserInfo(user) {
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
	await injectJquery(page)
	await sleep(3000)
	
	var data = page.evaluate(() => {
		var user = {}
		user.user = $("main h1 span.mr-1").text()
		user.user_id = $("small.text-sm").text().replace("#", "")*1
		var role = $("main h1 span.inline-block").text()
		user.gender = role.split(" ")[0].replace(/[^a-zA-Z]/g, "")
		user.age = role.split(" ")[0].replace(/\D/g, "")
		user.role = role.split(" ")[1].toLowerCase() // Trim off Age/Gender from role
		var location = $("main p.text-center").text()
		// var city = location.split(",")[0].trim().toLowerCase()
		user.state = location.split(",")[0].trim().toLowerCase()
		var picturesCount = Number($(element).find("div > div > div > div:nth-child(3) > a:nth-child(1)").text().replace(/\D/g, ""))
		var videosCount = Number($(element).find("div > div > div > div:nth-child(3) > a:nth-child(2)").text().replace(/\D/g, ""))
		
		
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
			user.websites.push(url)
		})
		var urlsFromBio = extractUrls(user.bio)
		user.websites.concat(urlsFromBio)

		browser.close()
		return user
	}, extractUrls)
	return data
}

export async function saveUserInfo(user) {
	insert(user)
}