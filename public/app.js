function getParams() {
  return new URLSearchParams(window.location.search);
}

function setParam(key, value) {
  const params = getParams();
  if (value === null || value === "") {
    params.delete(key);
  } else {
    params.set(key, value);
  }
  history.replaceState(null, "", "?" + params.toString());
}

async function fetchUsers(q = "") {
  const res = await fetch(`/api/users?q=${encodeURIComponent(q)}`);
  return res.json();
}

document.addEventListener("DOMContentLoaded", async () => {
  const params = getParams();
  const search = document.getElementById("search");

  const initialQuery = params.get("q") || "";
  search.value = initialQuery;

  /* =========================
     TABLE VIEW (DataTables)
     ========================= */
  if (document.getElementById("users")) {
    const startPage = parseInt(params.get("page") || "1", 10) - 1;

	const table = $("table#users").DataTable({
	  processing: true,
	  responsive: true,
	  dom: 'lrtip', // Hide search box
	  ajax: {
		url: "/api/users",
		data: function () {
		  return { q: search.value };
		},
		dataSrc: ""   // 🔥 THIS IS THE FIX
	  },
	  columns: [
		{ title: "User ID", data: "user_id" },
		{
		  data: "user",
		  title: "User",
		  render: function (data, type) {
			if (type === "display") {
			  return `<a href="https://fetlife.com/${data}" target="_blank">${data}</a>`;
			}
			return data;
		  }
		},
		{ title: "Age", data: "age" },
		{ title: "Role", data: "role" },
		{ title: "Gender", data: "gender" },
		{ title: "City", data: "city" },
		{ title: "Photos", data: "picturesCount" },
		{ title: "Vids", data: "videosCount" },
		{
		  data: "isFriend",
		  title: "isFriend",
		  render: function (data, type, row, meta) {
			var payload = JSON.stringify({ id: data })
			if (type === "display" && data === 0) {
			  return `<button class="api-button" data-endpoint="/api/users/${row.user_id}/friend" data-payload='${payload}'>Add Friend</button>`;
			} else {
			  return `<button lass="api-button" data-endpoint="/api/users/${row.user_id}/friend" data-method="DELETE" data-payload='${payload}'>Unfriend</button>`;
			}
			return data;
		  }
		},
		{
		  data: "isFollowing",
		  title: "isFollowing",
		  render: function (data, type, row) {
			var payload = JSON.stringify({ id: data })
			if (type === "display") {
			  return `<button lass="api-button" data-endpoint="/api/users/${row.user_id}/follow" data-payload='${payload}'>Follow</button>`;
			} else {
			  return `<button lass="api-button" data-endpoint="/api/users/${row.user_id}/unfollow" data-payload="${payload}">Unfollow</button>`;
			}
			return data;
		  }
		},
		{
		  data: "user",
		  title: "User",
		  render: function (data, type) {
			var payload = JSON.stringify({ id: data })
			if (type === "display") {
			  return `<button lass="api-button" data-endpoint="/api/update-user" data-payload='{"id": 123, "action": "activate">Message</button>`;
			}
			return data;
		  }
		}
	  ]
	});

    // Persist page number in query string
    table.on("page.dt", () => {
      const info = table.page.info();
      setParam("page", info.page + 1);
    });

    // Persist search query
    search.addEventListener("input", () => {
      setParam("q", search.value);
      setParam("page", 1);
      setParam("limit", 25);
      table.ajax.reload();
    });
  }

  /* =========================
     GRID VIEW
     ========================= */
  if (document.getElementById("grid")) {
    const grid = document.getElementById("grid");
    const toggle = document.getElementById("toggleText");
    const gridSize = document.getElementById("gridSize");
    const gap = document.getElementById("gap");

    const hideText = params.get("hideText") === "1";
    if (hideText) grid.classList.add("hidden-text");

    toggle.onclick = () => {
      const hidden = grid.classList.toggle("hidden-text");
      setParam("hideText", hidden ? "1" : "0");
    };
	
    gridSize.onclick = () => {
		$(".card, #grid").toggleClass("sm")
		$(".card, #grid").toggleClass("lg")
    };
	
    gap.onclick = () => {
		$("#grid").toggleClass("gap")
    };

    async function renderGrid() {
      const users = await fetchUsers(search.value);
      grid.innerHTML = users.map(u => `
        <div class="card lg" data-is-sexy="${u.isSexy}" data-is-following="${u.isFollowing}" data-is-friend="${u.isFriend}">
          <img src="${u.profilePicture || "https://via.placeholder.com/100"}">
          <img src="${u.profilePicture || "https://placehold.co/100x100"}">
          <p><a href="https://fetlife.com/${u.user}">${u.user}</a></p>
          <p>${u.age} | ${u.role} | ${u.gender}</p>
          <p>${u.city}, ${u.state}</p>
          <p>${u.picturesCount} | ${u.videosCount}</p>
        </div>
      `).join("");
    }

    search.addEventListener("input", () => {
      setParam("q", search.value);
      renderGrid();
    });

    renderGrid();
  }
});

/*
 * ON-PAGE ROUTER
 */
 class ActionRouter {
    constructor() {
        this.init();
    }

    init() {
        // Listen for clicks on buttons with a specific class
        document.addEventListener('click', (e) => {
            if (e.target.matches('.api-button')) {
                this.handleAction(e.target);
            }
        });
    }

    async handleAction(button) {
        // Retrieve data from data-* attributes
        const endpoint = button.dataset.endpoint;
		const method = JSON.parse(button.dataset.method || '{}');
        const payload = JSON.parse(button.dataset.payload || '{}');

        try {
            const response = await fetch(endpoint, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            console.log('Success:', result);
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

// Initialize the router
new ActionRouter();
