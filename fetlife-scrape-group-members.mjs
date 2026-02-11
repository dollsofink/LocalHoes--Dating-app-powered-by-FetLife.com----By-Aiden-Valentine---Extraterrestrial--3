import puppeteer from 'puppeteer'
import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from "node:fs"
import path from "node:path"
import { insert } from "./classes/users.mjs"
import Cookies from "./classes/cookies.mjs"
import injectJquery from "./classes/jquery.mjs"

// Add the stealth plugin to puppeteer-extra
puppeteerExtra.use(StealthPlugin());

/*
const argv = require('yargs')
.options({
  'url': {
    alias: 'u',
    describe: 'URL to scrape',
    default: "https://fetlife.com/p/united-states/georgia/atlanta/kinksters?page=1",
  }
})
*/

// (async() => {
	
const browser = await puppeteerExtra.launch({
	headless: false,
	devtools: true
})

/* COOKIES */
var cookies = new Cookies()
cookies.setPageCookies(browser)

var currentPage = 149
const origin = `https://fetlife.com`
const groupId = 24057
var url = `${origin}/groups/${groupId}/members`

async function scrapePage(url, currentPage) {
	console.log(`Loading: ${url}`);

	// await page.goto(`${url}?page=${currentPage}`, {waitUntil: 'networkidle2'})
	
	await sleep(2000)
	await injectJquery(page)
	await sleep(3000)
	
	// Add the script file to the page
    // await page.addScriptTag({path: './classes/users.mjs'});
	// Expose a specific function to the browser context under a global name
    await page.exposeFunction('insert', insert);


	  // Scrape users from "Search Kinksters" page
	var users = await page.evaluate(async () => {
		var users = []
		async function scrapeProfileInfo(element) {
			var user = $(element).data("member-card")
			console.log(user)
			var profileUrl = `https://fetlife.com/${user}`
			var role = $(element).find("span:first").text()
			var ageGender = role.slice(0, 4).trim()
			var gender = role.split(" ")[0].replace(/[^a-zA-Z]/g, "")
			var age = role.split(" ")[0].replace(/\D/g, "")
			role = role.split(" ")[1].toLowerCase() // Trim off Age/Gender from role
			// var location = $(element).find("div > div > div > div > div.text-sm")
			var location = $(element).find("div > div > div > div.truncate:nth-child(2)").text()
			var city = location.split(",")[0].trim().toLowerCase()
			var state = location.split(",")[1].trim().toLowerCase()
			var picturesCount = Number($(element).find("div > div > div > div:nth-child(3) > a:nth-child(1)").text().replace(/\D/g, ""))
			var videosCount = Number($(element).find("div > div > div > div:nth-child(3) > a:nth-child(2)").text().replace(/\D/g, ""))
			// var postsCount = Number($(element).find("div > div > div > div:nth-child(3) > a:nth-child(3)").text().replace(/\D/g, ""))
			console.log(`${role} | Age: ${age} Gender: ${gender}`)
			return {
				user: user,
				age: age,
				role: role,
				gender: gender,
				city: city,
				state: state,
				picturesCount: picturesCount,
				videosCount: videosCount,
				links: {
					profile: profileUrl,
					pictures: profileUrl + "/pictures",
					videos: profileUrl + "/videos",
					posts: profileUrl + "/posts",
				}
			}
		}

		// Follow any Kinksters w/ a "Female" gender
		$("[data-member-card]").each( async (i, elem) => {
			console.log(elem)
			var profileInfo = await scrapeProfileInfo($(elem))
			console.log(profileInfo)
			
			// profileInfo.user = $(elem).data("member-card")

			// Harass any users matching criteria
			if (profileInfo.gender === "F") {
				// $(elem).find("div > div > div > a > button").click()
				users.push(profileInfo.user)
				
				/*
				 * SEND TO DATABASE
				 */
				delete profileInfo.links
				await window.insert(profileInfo)
			}

			if (profileInfo.gender !== "F") {
				$(elem).parent().hide()
			}

		})
		
		return users
	});
	
	await sleep(3000) // Sleep so we can see the men get eliminated
	
	// FIX: script crashing w/ error.
	page.removeExposedFunction('insert')
	
	return users

}

/*
 * Pagination
 */

/*
async function scrapeNextPageUrl(page) {
	var nextPage = await page.evaluate(() => {
		return $(".next_page").prop("href")
	})
	return nextPage
}
*/

// Goto next page (pagination)
async function gotoNextPage(page, url) {
	await page.goto(url, {waitUntil: 'networkidle2'})
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

const page = await browser.newPage();

// Enable CSP bypassing
await page.setBypassCSP(true);
// Set a realistic user-agent to match the IP’s region and browser version
await page.setUserAgent(
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
);

// await page.exposeFunction('insert', insert);

/* DOWNLOAD IMAGES */
/*
page.on('response', async response => {
	const url = response.url();
	if (response.request().resourceType() === 'image') {
		response.buffer().then(file => {
			console.log(url)
			const fileName = url.split('/').pop();
			const filePath = path.resolve("files/thumbnails", fileName);
			const writeStream = fs.createWriteStream(filePath);
			writeStream.write(file);
		});
	}
});
*/

/*
 * PAGINATION
 */
// Check the Search Kinksters page for result count and pagination
await page.goto(`${url}?page=${currentPage}`, {waitUntil: 'networkidle2'})
await injectJquery(page)
// await page.exposeFunction('insert', insert);
await sleep(3000)


var pagination = await page.evaluate(() => {
	const limit = 20
	var paginationInfo = $("main > div > div > p").text()
	var resultCount = Number(paginationInfo.replace(/members/, "").replace(",", "").trim())
	var pageCount = resultCount / limit
	return {
		pageCount,
		resultCount,
		limit
	}
})
console.log(pagination)

var results = []
// Loop as long as pageCount > 0
while (currentPage < pagination.pageCount) {
	console.log(`Fetching page: ${currentPage} / ${pagination.pageCount}`, `Results: ${pagination.resultCount}`);

	// Await the API call for the current page
	var result = await scrapePage(url)
	results.push(result)
	console.log(`Data:`, result);
	
	// Pagination
	currentPage++
	// var nextPageUrl = await scrapeNextPageUrl(page)
	await gotoNextPage(page, `${url}?page=${currentPage}`)
}
