import puppeteer from 'puppeteer'
import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import Cookies from "./classes/cookies.mjs"

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
await page.goto(`https://fetlife.com/conversations/new?source=profile`, {waitUntil: 'networkidle2'})

const MAX_LENGTH_USER_IDS = 10
var userIds = [17108733]
var subject = "Local photographer wants to shoot with you. Can we talk?"
var body = "Hi -- I've been in the Fetish community for 12 years doing pro-am movies. I've shot with 100+ models in the Tampa area, and travel across the U.S.A.\n\nI am a Director and videographer that can help you.\n*I'd like to take some photos together.\n\nYou look like you're ready for camera. Let me come shoot with you!\nI'm in Atlanta, GA close to the city. You only need to bring yourself and your fashionable clothing garments with you. (they're gonna be coming off)\n\nI normally charge for my services. BUT I made an exception to work with you. I'd like you in my portfolio.\n\nPlease let me know.\nSincerely,\nMrValentine XOXO"

var message = await page.evaluate(async (userIds, subject, body, source="profile") => {
	var request = {
		"with": userIds,
		"subject": subject,
		"body": body,
		"source": source
	}
	var csrfToken = document.getElementsByName("csrf-token")[0].content
	
	try {
		var response = await fetch("https://fetlife.com/conversations", {
		  "headers": {
			"accept": "application/json",
			"content-type": "application/json",
			"sec-fetch-dest": "empty",
			"sec-fetch-mode": "cors",
			"sec-fetch-site": "same-origin",
			"x-csrf-token": csrfToken
		  },
		  "referrer": "https://fetlife.com/conversations/new?source=profile",
		  "body": JSON.stringify(request),
		  "method": "POST",
		  "mode": "cors",
		  "credentials": "include"
		});
		// Await the parsing of the response body (e.g., as JSON) and store it in a variable
		const data = await response.json();
		return data
	} catch (error) {
		console.error("Fetch failed:", error);
		// You can handle the error as needed
		throw error; // Re-throw the error if necessary
	}
}, userIds, subject, body)

console.log(message)