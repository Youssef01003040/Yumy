// use var per user preference
var API = "https://www.themealdb.com/api/json/v1/1/";

// helpers
function qs(sel) {
  return document.querySelector(sel);
}
function qsa(sel) {
  return Array.from(document.querySelectorAll(sel));
}

// ====== Meal Card With Overlay Animation (with image loader) ======
function createMealCard(meal) {
  var col = document.createElement("div");
  col.className = "col-sm-6 col-md-4 col-lg-3";

  col.innerHTML = `
    <div class="card meal-card shadow-sm" data-id="${meal.idMeal}">
      <div class="meal-thumb-wrapper position-relative">
        <div class="img-loader position-absolute top-50 start-50 translate-middle">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <img src="${meal.strMealThumb}" class="meal-thumb d-none" alt="${meal.strMeal}">
      </div>
      <div class="meal-overlay">
        <h5>${meal.strMeal}</h5>
      </div>
    </div>
  `;

  var img = col.querySelector(".meal-thumb");
  var loader = col.querySelector(".img-loader");

  // Show image when loaded and hide loader
  img.addEventListener("load", function () {
    loader.style.display = "none";
    img.classList.remove("d-none");
  });

  col.querySelector(".meal-card").addEventListener("click", function () {
    showMealDetails(meal.idMeal);
  });

  return col;
}

// Render meals (limit 20)
function renderMeals(container, meals) {
  container.innerHTML = "";
  if (!meals) {
    container.innerHTML = "<p class='text-muted'>No Results Found</p>";
    return;
  }
  meals.slice(0, 20).forEach(function (m) {
    container.appendChild(createMealCard(m));
  });
}

// ===== Side Nav Open/Close =====
var side = qs("#sideNav");
var openBtn = qs("#openBtn");
var closeBtn = qs("#closeBtn");

openBtn.addEventListener("click", function () {
  side.classList.add("open");
});
closeBtn.addEventListener("click", function () {
  side.classList.remove("open");
});

// ===== Switch Views =====
qsa(".side-item").forEach(function (el) {
  el.addEventListener("click", function () {
    qsa(".side-item").forEach(function (x) {
      x.classList.remove("active");
    });
    el.classList.add("active");
    side.classList.remove("open");
    showView(el.getAttribute("data-view"));
  });
});

function hideAllViews() {
  qsa(".view-pane").forEach(function (v) {
    v.classList.add("d-none");
  });
  qs("#mealsGrid").classList.add("d-none");
}

function showView(name) {
  hideAllViews();

  if (name === "search") {
    qs("#view-search").classList.remove("d-none");
  } else if (name === "categories") {
    qs("#view-categories").classList.remove("d-none");
    loadCategories();
  } else if (name === "area") {
    qs("#view-area").classList.remove("d-none");
    loadAreas();
  } else if (name === "ingredients") {
    qs("#view-ingredients").classList.remove("d-none");
    loadIngredients();
  } else if (name === "contact") {
    qs("#view-contact").classList.remove("d-none");
  }
}

// ===== Initial Meals =====
function loadInitialMeals() {
  fetch(API + "search.php?s=")
    .then(function (r) {
      return r.json();
    })
    .then(function (data) {
      var container = qs("#mealsGrid");
      qs("#mealsGrid").classList.remove("d-none");
      if (data.meals) {
        renderMeals(container, data.meals);
      } else {
        fetch(API + "filter.php?c=Beef")
          .then((r) => r.json())
          .then((d) => {
            renderMeals(container, d.meals);
          });
      }
    })
    .catch(function () {
      qs("#mealsGrid").innerHTML =
        "<p class='text-danger'>Error loading data</p>";
    });
}

// ===== Search =====
var searchByName = qs("#searchByName");
var searchByLetter = qs("#searchByLetter");
var searchResults = qs("#searchResults");

searchByName.addEventListener("input", function () {
  var q = searchByName.value.trim();
  if (q.length === 0) {
    searchResults.innerHTML = "";
    return;
  }
  fetch(API + "search.php?s=" + encodeURIComponent(q))
    .then((res) => res.json())
    .then((data) => renderMeals(searchResults, data.meals));
});

searchByLetter.addEventListener("input", function () {
  var c = searchByLetter.value.trim();
  if (c.length === 0) {
    searchResults.innerHTML = "";
    return;
  }
  fetch(API + "search.php?f=" + encodeURIComponent(c))
    .then((res) => res.json())
    .then((data) => renderMeals(searchResults, data.meals));
});

// ===== Categories =====
var categoriesLoaded = false;

function loadCategories() {
  if (categoriesLoaded) return;
  categoriesLoaded = true;

  var list = qs("#categoriesList");
  list.innerHTML = "<p>Loading...</p>";

  fetch(API + "categories.php")
    .then((res) => res.json())
    .then((data) => {
      list.innerHTML = "";
      data.categories.forEach(function (cat) {
        var col = document.createElement("div");
        col.className = "col-6 col-md-4 col-lg-3";
        col.innerHTML = `
          <div class="card p-2 category-badge" data-cat="${cat.strCategory}">
            <div class="card-body p-2">
              <h6 class="m-0">${cat.strCategory}</h6>
            </div>
          </div>
        `;

        col
          .querySelector(".category-badge")
          .addEventListener("click", function () {
            fetch(API + "filter.php?c=" + encodeURIComponent(cat.strCategory))
              .then((r) => r.json())
              .then((d) => renderMeals(qs("#categoryMeals"), d.meals));
          });

        list.appendChild(col);
      });
    });
}

// ===== Areas =====
var areasLoaded = false;

function loadAreas() {
  if (areasLoaded) return;
  areasLoaded = true;

  var list = qs("#areaList");
  list.innerHTML = "<p>Loading...</p>";

  fetch(API + "list.php?a=list")
    .then((res) => res.json())
    .then((data) => {
      list.innerHTML = "";
      data.meals.forEach(function (a) {
        var col = document.createElement("div");
        col.className = "col-6 col-md-4 col-lg-3";
        col.innerHTML = `
          <button class="btn btn-outline-secondary w-100 text-start area-btn" data-area="${a.strArea}">
            ${a.strArea}
          </button>
        `;

        col.querySelector(".area-btn").addEventListener("click", function () {
          fetch(API + "filter.php?a=" + encodeURIComponent(a.strArea))
            .then((r) => r.json())
            .then((d) => renderMeals(qs("#areaMeals"), d.meals));
        });

        list.appendChild(col);
      });
    });
}

// ===== Ingredients =====
var ingrLoaded = false;

function loadIngredients() {
  if (ingrLoaded) return;
  ingrLoaded = true;

  var list = qs("#ingredientsList");
  list.innerHTML = "<p>Loading...</p>";

  fetch(API + "list.php?i=list")
    .then((res) => res.json())
    .then((data) => {
      list.innerHTML = "";
      data.meals.slice(0, 40).forEach(function (i) {
        var col = document.createElement("div");
        col.className = "col-6 col-md-4 col-lg-3";
        col.innerHTML = `
          <butto class="btn btn-outline-warning w-100 text-start ingredient-btn" data-ing="${i.strIngredient}">
            ${i.strIngredient}
          </butto>
        `;

        col
          .querySelector(".ingredient-btn")
          .addEventListener("click", function () {
            fetch(API + "filter.php?i=" + encodeURIComponent(i.strIngredient))
              .then((r) => r.json())
              .then((d) => renderMeals(qs("#ingredientMeals"), d.meals));
          });

        list.appendChild(col);
      });
    });
}

// ===== Meal Details (modal) =====
function showMealDetails(id) {
  fetch(API + "lookup.php?i=" + id)
    .then((res) => res.json())
    .then((data) => {
      var meal = data.meals && data.meals[0];
      if (!meal) return;

      qs("#modalTitle").textContent = meal.strMeal;

      var ingHtml = "";
      for (var i = 1; i <= 20; i++) {
        var ing = meal["strIngredient" + i];
        var measure = meal["strMeasure" + i];
        if (ing && ing.trim()) {
          ingHtml += `<li>${ing} - ${measure || ""}</li>`;
        }
      }

      var youtube = meal.strYoutube
        ? `<a href="${meal.strYoutube}" target="_blank" class="btn btn-sm btn-danger">YouTube</a>`
        : "";

      var source = meal.strSource
        ? `<a href="${meal.strSource}" target="_blank" class="btn btn-sm btn-outline-primary ms-2">Source</a>`
        : "";

      qs("#modalBodyContent").innerHTML = `
        <div class="row">
          <div class="col-md-5">
            <img src="${meal.strMealThumb}" class="img-fluid rounded" alt="${
        meal.strMeal
      }">
            <div class="mt-2">${youtube} ${source}</div>
          </div>

          <div class="col-md-7">
            <h6>Instructions</h6>
            <p>${
              meal.strInstructions ? meal.strInstructions.slice(0, 500) : ""
            }</p>

            <p><strong>Area:</strong> ${meal.strArea || "-"}  
            <strong class="ms-3">Category:</strong> ${
              meal.strCategory || "-"
            }</p>

            <h6>Ingredients:</h6>
            <ul>${ingHtml}</ul>
          </div>
        </div>
      `;

      var modalEl = document.getElementById("mealModal");
      var modal = new bootstrap.Modal(modalEl);
      modal.show();
    });
}

// ===== Contact Form Validation =====
var nameInput = qs("#nameInput");
var emailInput = qs("#emailInput");
var phoneInput = qs("#phoneInput");
var ageInput = qs("#ageInput");
var passwordInput = qs("#passwordInput");
var repasswordInput = qs("#repasswordInput");
var submitBtn = qs("#submitBtn");

function validateName(v) {
  return /^[A-Za-z ]{2,30}$/.test(v);
}
function validateEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
function validatePhone(v) {
  return /^01[0-9]{9}$/.test(v);
}
function validateAge(v) {
  var n = Number(v);
  return n >= 10 && n <= 100;
}
function validatePassword(v) {
  return /^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(v);
}

function checkForm() {
  var ok =
    validateName(nameInput.value.trim()) &&
    validateEmail(emailInput.value.trim()) &&
    validatePhone(phoneInput.value.trim()) &&
    validateAge(ageInput.value.trim()) &&
    validatePassword(passwordInput.value) &&
    passwordInput.value === repasswordInput.value;

  submitBtn.disabled = !ok;
}

[
  nameInput,
  emailInput,
  phoneInput,
  ageInput,
  passwordInput,
  repasswordInput,
].forEach(function (inp) {
  inp.addEventListener("input", checkForm);
});

// ===== DOM Ready =====
document.addEventListener("DOMContentLoaded", function () {
  loadInitialMeals();
});

window.addEventListener("load", function () {
  var preloader = document.getElementById("preloader");
  preloader.style.opacity = "0";
  preloader.style.transition = "opacity 0.5s ease";
  setTimeout(function () {
    preloader.style.display = "none";
  }, 500);
});















