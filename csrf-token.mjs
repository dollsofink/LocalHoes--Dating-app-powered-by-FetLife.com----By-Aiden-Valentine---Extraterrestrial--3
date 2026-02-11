import puppeteer from 'puppeteer'
import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import Cookies from "./classes/cookies.mjs"

export async function getCsrfToken() {
	// Add the stealth plugin to puppeteer-extra
	puppeteerExtra.use(StealthPlugin());

	const browser = await puppeteerExtra.launch({
		headless: true
	})

	/* COOKIES */
	var cookies = new Cookies()
	cookies.setPageCookies(browser)

	const page = await browser.newPage()

	var url = "https://fetlife.com"
	await page.goto(url, {waitUntil: 'networkidle2'})

	await page.setUserAgent(
	  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
	)

	// var csrf = $("csrf-token").attr("content")
	var csrfToken = await page.evaluate(async () => {
		return document.getElementsByName("csrf-token")[0].content
	})
	console.log(csrfToken)
	browser.close()

	return {
		data: {
			csrfToken
		}
	}
}