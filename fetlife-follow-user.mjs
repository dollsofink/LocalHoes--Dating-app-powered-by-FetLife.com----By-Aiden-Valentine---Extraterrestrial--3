class User {
	constructor(user, userId, csrfToken) {
		this.user = user
		this.userId = userId
		this.headers = {
			"accept": "application/json",
			"content-type": "application/json",
			"sec-fetch-dest": "empty",
			"sec-fetch-mode": "cors",
			"sec-fetch-site": "same-origin",
			"x-csrf-token": csrfToken
		}
		this.referrer = "https://fetlife.com"
		
		this.request = {
			headers: this.headers,
			referrer: this.referrer,
			method: "POST",
			mode: "cors",
			credentials: "include"
		}
	}

	getUserId() {
		var req {
			...this.request
		}
		req.method = "GET"
		var response = await fetch(`https://fetlife.com/${this.user}`)
		console.log(response)
	}
	
	follow() {
		var body = {origin: null}
		var req {
			...this.request,
			body: body
		}
		req.method = "PUT"
		var response = await fetch(`https://fetlife.com/requests?user_id=${this.userId}`, req)
	}
	
	unfollow() {
		var body = {origin: null}
		var req {
			...this.request,
			body: body
		}
		req.method = "DELETE"
		var response = await fetch(`https://fetlife.com/${this.user}/unfollow`, req)
	}
	
	favorite() {
		var body = {
			target_user_id: this.userId,
			source: "profile"
		}
		var req = {
			...this.request,
			body: body
		}
		var response = fetch("https://fetlife.com/favorite_members", req)
	}
}
new User(15470348).getUserId()

/*
var userId = 15470348
var body = JSON.stringify({origin: null})
var csrfToken = document.getElementsByName("csrf-token")[0].content
var response = await fetch(`https://fetlife.com/requests?user_id=${userId}`, {
  "headers": {
    "accept": "application/json",
    "content-type": "application/json",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-csrf-token": csrfToken
  },
  "referrer": "https://fetlife.com",
  "body": body,
  "method": "POST",
  "mode": "cors",
  "credentials": "include"
});
console.log(response)
*/