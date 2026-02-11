async function injectJquery(page) {
	// await page.addScriptTag({ url: 'https://code.jquery.comjquery-3.7.1.min.js' });
	  // Use the latest version from the official [jQuery CDN](https://code.jquery.com)
	await page.evaluate(() => {
		(function() {
			// Check if jQuery is already loaded
			if (typeof jQuery === 'undefined') {
				var script = document.createElement('script');
				script.type = 'text/javascript';
				script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js'; // Use the latest stable version
				document.head.appendChild(script);

				// Optional: Add a mechanism to wait for jQuery to load
				script.onload = function() {
					console.log('jQuery ' + jQuery.fn.jquery + ' injected and loaded!');
					// Your jQuery code can go here or in a separate script that waits for it
				};
			} else {
				console.log('jQuery is already present (version ' + jQuery.fn.jquery + ')');
			}
		})();
	});
}

export default injectJquery