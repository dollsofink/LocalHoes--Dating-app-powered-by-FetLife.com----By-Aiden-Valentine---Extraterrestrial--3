async function fetchUsers(q = "") {
  const res = await fetch(`/api/users?q=${encodeURIComponent(q)}`);
  return res.json();
}

document.addEventListener("DOMContentLoaded", async () => {
  const search = document.getElementById("search");

  if (document.getElementById("users")) {
    const table = $("#users").DataTable({
      ajax: async (_, cb) => cb({ data: await fetchUsers(search.value) }),
      columns: [
        { title: "User", data: "user" },
        { title: "Age", data: "age" },
        { title: "Role", data: "role" },
        { title: "Gender", data: "gender" },
        { title: "City", data: "city" }
      ]
    });

    search.oninput = () => table.ajax.reload();
  }

  if (document.getElementById("grid")) {
    const grid = document.getElementById("grid");
    const toggle = document.getElementById("toggleText");

    async function render() {
      const users = await fetchUsers(search.value);
      grid.innerHTML = users.map(u => `
        <div class="card">
          <img src="${u.profilePicture || 'https://via.placeholder.com/100'}">
          <p>${u.user}</p>
          <p>${u.age}</p>
          <p>${u.role}</p>
          <p>${u.gender}</p>
        </div>
      `).join("");
    }

    toggle.onclick = () => grid.classList.toggle("hidden-text");
    search.oninput = render;
    render();
  }
});
