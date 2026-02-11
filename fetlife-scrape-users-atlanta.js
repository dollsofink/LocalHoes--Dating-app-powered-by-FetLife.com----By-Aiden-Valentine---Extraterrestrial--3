const puppeteer = require('puppeteer')
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

(async() => {

	const browser = await puppeteer.launch({
		headless: false,
	})

	// Define the cookies as an array of objects
	const myCookies = [{
	  name: '_fl_sessionid',
	  value: 'dcfbe608f69f237dafd53a289577b2c9',
	  domain: 'fetlife.com',
	  path: '/',
	}]

	// Set the cookies using browser.setCookie()
	// Note the spread operator (...) to pass array elements as individual arguments
	await browser.setCookie(...myCookies);

	async function scrapePage(url) {
		console.log(`Loading: ${url}`);

		await page.goto(url, {waitUntil: 'networkidle2'})
		  
		  // Inject jQuery
		await page.addScriptTag({ url: 'https://code.jquery.comjquery-3.7.1.min.js' });
		  // Use the latest version from the official [jQuery CDN](https://code.jquery.com)


		  // Scrape users from "Search Kinksters" page
		var users = await page.evaluate(() => {
			var users = []
			function scrapeProfileInfo(element) {
				var user = $(element).data("member-card")
				var profileUrl = `https://fetlife.com/${user}`
				var role = $(element).find("span:first").text()
				var ageGender = role.slice(0, 4).trim()
				var gender = ageGender.replace(/[^a-zA-Z]/g, "")
				var age = ageGender.replace(/\D/g, "")
				console.log(`${role} | Age: ${age} Gender: ${gender}`)
				return {
					user: user,
					age: age,
					role: role,
					gender: gender,
					links: {
						profile: profileUrl,
						pictures: profileUrl + "/pictures",
						videos: profileUrl + "/videos",
						posts: profileUrl + "/posts",
					}
				}
			}

			// Follow any Kinksters w/ a "Female" gender
			$("[data-member-card]").each( (i, elem) => {
				var profileInfo = scrapeProfileInfo($(elem))
				profileInfo.user = $(elem).data("member-card")
				console.log(profileInfo)

				// Harass any users matching criteria
				if (profileInfo.gender === "F") {
					// $(elem).find("div > div > div > a > button").click()
					users.push(profileInfo.user)
				}

				if (profileInfo.gender !== "F") {
					$(elem).hide()
				}

			})	
			
			return users
		});

	}

	/*
	 * Pagination
	 */
	 
	async function scrapeNextPageUrl(page) {
		var nextPage = await page.evaluate(() => {
			return $(".next_page").prop("href")
		})
		return nextPage
	}

	// Goto next page (pagination)
	async function gotoNextPage(page, url) {
		await page.goto(url, {waitUntil: 'networkidle2'})
	}

	// function run() {
		const page = await browser.newPage();
		await scrapePage("https://fetlife.com/p/united-states/georgia/atlanta/kinksters?page=1")
		var nextPageUrl = await scrapeNextPageUrl(page)
		await gotoNextPage(page, nextPageUrl)
	// }

})