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

	const table = $("#users").DataTable({
	  processing: true,
	  ajax: {
		url: "/api/users",
		data: function () {
		  return { q: search.value };
		},
		dataSrc: ""   // 🔥 THIS IS THE FIX
	  },
	  columns: [
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
		{ title: "Vids", data: "videosCount" }
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
      table.ajax.reload();
    });
  }

  /* =========================
     GRID VIEW
     ========================= */
  if (document.getElementById("grid")) {
    const grid = document.getElementById("grid");
    const toggle = document.getElementById("toggleText");

    const hideText = params.get("hideText") === "1";
    if (hideText) grid.classList.add("hidden-text");

    toggle.onclick = () => {
      const hidden = grid.classList.toggle("hidden-text");
      setParam("hideText", hidden ? "1" : "0");
    };

    async function renderGrid() {
      const users = await fetchUsers(search.value);
      grid.innerHTML = users.map(u => `
        <div class="card">
          <img src="${u.profilePicture || "https://via.placeholder.com/100"}">
          <p>${u.user}</p>
          <p>${u.age}</p>
          <p>${u.role}</p>
          <p>${u.gender}</p>
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
