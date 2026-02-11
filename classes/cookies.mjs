class Cookies {
	constructor(sessionId) {
		// Define the cookies as an array of objects
		this.data = [{
		  name: '_fl_sessionid',
		  value: sessionId || 'dcfbe608f69f237dafd53a289577b2c9',
		  domain: 'fetlife.com',
		  path: '/',
		}]
	}

	// Set the cookies using browser.setCookie()
	async setPageCookies(browser) {
		// Note the spread operator (...) to pass array elements as individual arguments
		await browser.setCookie(...this.data);
	}
}
/*
export {
	cookies as "cookies",
	setPageCookies
}
*/
export default Cookies