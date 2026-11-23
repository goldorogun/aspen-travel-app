const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

if (menuBtn && navLinks) {
  menuBtn.addEventListener("click", () => {
    // Toggle the animation on the hamburger icon
    menuBtn.classList.toggle("active");

    // Toggle the visibility of the nav links
    navLinks.classList.toggle("open");
  });
}

// this is for the list of recipes
// ==========================================
// SEARCH & BOOKMARK SAVING
// ==========================================
const input = document.getElementById("searchInput");
const resultsList = document.getElementById("searchResultsList");
const bookmarkSection = document.getElementById("bookmarkSection");
const savedSearchesList = document.getElementById("savedSearchesList");
const clearBookmarksBtn = document.getElementById("clearBookmarksBtn");
const bookmarkNavBtn = document.getElementById("bookmarkNavBtn") || document.querySelector('a[aria-label="Saved"]');
const homeNavBtn = document.getElementById("homeNavBtn") || document.querySelector('a[aria-label="Home"]');

const recipes = [
  { name: "Jollof Rice" },
  { name: "Fried Rice"},
  { name: "Jambalaya Rice" },
  { name: "Coconut Rice"},
  { name: "Pineapple Rice"},
  { name: "Shrimp Fried Rice" },
  { name: "Chinese Rice" },
  { name: "Ofada Rice"}
];

let savedSearches = JSON.parse(localStorage.getItem("recipeSearches")) || [];

function saveSearchTerm(term) {
  const cleanTerm = (term || "").trim();
  if (cleanTerm !== "" && !savedSearches.includes(cleanTerm)) {
    savedSearches.push(cleanTerm);
    localStorage.setItem("recipeSearches", JSON.stringify(savedSearches));
    renderBookmarks();
  }
}

function filterRecipes() {
  if (!input || !resultsList) return;
  const query = (input.value || "").toLowerCase().trim();
  resultsList.innerHTML = "";

  if (query === "") {
    resultsList.style.display = "none";
    return;
  }

  const matches = recipes.filter(item =>
    (item.name || "").toLowerCase().includes(query)
  );

  resultsList.style.display = "block";

  if (matches.length === 0) {
    resultsList.innerHTML = `<li style="color: #888;">No matching recipes found</li>`;
    return;
  }

  matches.forEach(recipe => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${recipe.name}</strong>`;

    li.addEventListener("click", () => {
      input.value = recipe.name;
      resultsList.style.display = "none";
      saveSearchTerm(recipe.name);
    });

    resultsList.appendChild(li);
  });
}

if (input) {
  input.addEventListener("input", filterRecipes);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      saveSearchTerm(input.value);
      if (resultsList) resultsList.style.display = "none";
    }
  });
}

function renderBookmarks() {
  if (!savedSearchesList) return;
  savedSearchesList.innerHTML = "";

  if (savedSearches.length === 0) {
    savedSearchesList.innerHTML = `<li style="color: #888; cursor: default;">No saved searches yet.</li>`;
    return;
  }

  savedSearches.forEach((term, index) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${term}</span> <span class="delete-item" title="Remove">×</span>`;

    li.addEventListener("click", (e) => {
      if (e.target.classList.contains("delete-item")) {
        savedSearches.splice(index, 1);
        localStorage.setItem("recipeSearches", JSON.stringify(savedSearches));
        renderBookmarks();
      } else if (input) {
        if (bookmarkSection) bookmarkSection.style.display = "none";
        input.value = term;
        filterRecipes();
      }
    });

    savedSearchesList.appendChild(li);
  });
}

if (clearBookmarksBtn) {
  clearBookmarksBtn.addEventListener("click", () => {
    savedSearches = [];
    localStorage.removeItem("recipeSearches");
    renderBookmarks();
  });
}

if (bookmarkNavBtn && bookmarkSection) {
  bookmarkNavBtn.addEventListener("click", (e) => {
    e.preventDefault();
    bookmarkSection.style.display = "block";
    bookmarkSection.scrollIntoView({ behavior: "smooth" });
    bookmarkNavBtn.classList.add("active");
    if (homeNavBtn) homeNavBtn.classList.remove("active");
    renderBookmarks();
  });
}

if (homeNavBtn && bookmarkSection) {
  homeNavBtn.addEventListener("click", (e) => {
    e.preventDefault();
    bookmarkSection.style.display = "none";
    homeNavBtn.classList.add("active");
    if (bookmarkNavBtn) bookmarkNavBtn.classList.remove("active");
  });
}

renderBookmarks();

// ==========================================
//  TOGGLE HEARTS ON/OFF & SYNC WITH fav.html
// ==========================================
let favoriteRecipes = JSON.parse(localStorage.getItem("favoriteRecipes")) || [];

const heartButtons = document.querySelectorAll(".recipe-item .heart-btn");

heartButtons.forEach((btn) => {
  const card = btn.closest(".recipe-item");
  if (!card) return;

  const title = card.querySelector(".recipe-title")?.innerText.trim();
  const benefit = card.querySelector(".benefit-row span")?.innerText.trim() || "";
  const img = card.querySelector(".recipe-img")?.getAttribute("src") || "";

  // Set initial filled/unfilled state when page loads
  if (favoriteRecipes.some((item) => item.title === title)) {
    btn.classList.add("liked");
    btn.innerText = "♥";
  } else {
    btn.classList.remove("liked");
    btn.innerText = "♡";
  }

  // Toggle ON and OFF when tapped (stays on home page)
  btn.addEventListener("click", (e) => {
    e.stopPropagation();

    const existingIndex = favoriteRecipes.findIndex((item) => item.title === title);

    if (existingIndex === -1) {
      favoriteRecipes.push({ title, benefit, img });
      btn.classList.add("liked");
      btn.innerText = "♥";
    } else {
      favoriteRecipes.splice(existingIndex, 1);
      btn.classList.remove("liked");
      btn.innerText = "♡";
    }

    localStorage.setItem("favoriteRecipes", JSON.stringify(favoriteRecipes));
  });
});

// Render saved favorites inside fav.html
const favoritesList = document.getElementById("favoritesList");

function renderFavoritesPage() {
  if (!favoritesList) return;

  favoriteRecipes = JSON.parse(localStorage.getItem("favoriteRecipes")) || [];

  if (favoriteRecipes.length === 0) {
    favoritesList.innerHTML = `<p style="text-align:center; color:#888; padding:20px;">No favorite recipes yet.</p>`;
    return;
  }

  favoritesList.innerHTML = favoriteRecipes.map((item, index) => `
    <div class="recipe-item">
      <img src="${item.img}" alt="${item.title}" class="recipe-img">
      <div class="recipe-details">
        <h3 class="recipe-title">${item.title}</h3>
        <div class="benefit-row">
          <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
          <span>${item.benefit}</span>
        </div>
      </div>
      <button type="button" class="heart-btn liked" data-index="${index}" aria-label="Remove from favorites">♥</button>
    </div>
  `).join("");

  // Allow unliking directly inside fav.html
  favoritesList.querySelectorAll(".heart-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const idx = Number(btn.dataset.index);
      favoriteRecipes.splice(idx, 1);
      localStorage.setItem("favoriteRecipes", JSON.stringify(favoriteRecipes));
      renderFavoritesPage();
    });
  });
}

renderFavoritesPage();


// ==========================================
// 3. INTERACTIVE CARDS -> OPEN recipe.html
// ==========================================

// 1. Add Jollof Rice and Fried rice to your fullRecipeData object
const jollofRecipe = {
  time: "50 mins",
  servings: "5 servings",
  ingredients: [
    "3 cups long-grain parboiled rice",
    "6 large plum tomatoes, 3 red bell peppers (tatashe), 2 scotch bonnets",
    "2 large red onions (1 blended, 1 sliced)",
    "3 tbsp tomato paste",
    "2.5 cups rich chicken or beef stock",
    "1/2 cup vegetable oil",
    "2 tsp curry powder, 2 tsp dried thyme, 2 bay leaves, seasoning cubes & salt"
  ],
  steps: [
    "Blend the tomatoes, bell peppers, scotch bonnets, and 1 onion into a smooth puree, then boil down until thick.",
    "Heat vegetable oil in a heavy pot, fry the sliced onion for 2 minutes, then stir in tomato paste and fry for 5 minutes.",
    "Pour in the reduced pepper puree, curry, thyme, bay leaves, and seasoning. Fry for 10–12 minutes until oil floats to the top.",
    "Add the chicken stock and washed rice. Stir once, cover tightly with foil and a lid, and steam on low heat for 25–30 minutes until smoky and tender."
  ]
};

const friedRiceRecipe = {
  time: "40 mins",
  servings: "4 servings",
  ingredients: [
    "3 cups parboiled long-grain rice (cooked in seasoned stock)",
    "1 cup diced carrots, sweet corn, and green peas",
    "1/2 cup diced green bell pepper & 1/2 cup diced liver or chicken",
    "2 cups chicken stock",
    "1 tbsp curry powder, 1 tsp thyme, 1 tsp garlic powder",
    "3 tbsp vegetable oil & salt to taste"
  ],
  steps: [
    "Parboil washed rice in seasoned chicken stock with curry and thyme until 85% cooked, then spread on a tray to cool completely.",
    "Heat oil in a wide wok or pan, stir-fry the diced carrots, peas, sweet corn, and bell peppers for 3 minutes, then set aside.",
    "Toss the cooled rice in batches on high heat with a splash of oil for 3–4 minutes.",
    "Fold the stir-fried vegetables and diced liver/chicken back into the rice, toss together for 2 minutes, and serve hot."
  ]
};

const fullRecipeData = {
  "Jambalaya Rice": {
    time: "45 mins",
    servings: "4 servings",
    ingredients: [
      "2 cups long-grain parboiled rice",
      "300g diced chicken breast & smoked sausage",
      "1 cup shrimp, peeled and deveined",
      "1 red bell pepper, 1 green bell pepper, 1 onion (diced)",
      "3 cloves garlic (minced) & 1 tbsp tomato paste",
      "2.5 cups chicken stock",
      "1 tsp Cajun seasoning, thyme, paprika, salt & black pepper"
    ],
    steps: [
      "Season the chicken and shrimp with Cajun spice, salt, and pepper. Sear in a pot with 2 tbsp oil until browned, then set aside.",
      "Sauté onions, bell peppers, and garlic in the same pot for 4 minutes. Stir in tomato paste and cook for 2 minutes.",
      "Add washed rice, chicken stock, thyme, and paprika. Bring to a boil, then cover and simmer on low heat for 20 minutes.",
      "Fold in the cooked chicken, sausage, and shrimp. Cover for 5 more minutes until the shrimp turn pink and the rice is tender."
    ]
  },
  "Coconut Rice": {
    time: "40 mins",
    servings: "4 servings",
    ingredients: [
      "2 cups long-grain rice, rinsed",
      "1 can (400ml) rich coconut milk",
      "1.5 cups chicken or vegetable stock",
      "1 medium onion (chopped) & 2 cloves garlic (minced)",
      "1 scotch bonnet pepper (optional)",
      "1 tsp curry powder, 1 tsp thyme, salt to taste"
    ],
    steps: [
      "Heat 1 tbsp oil in a pot and sauté chopped onions and garlic until fragrant.",
      "Pour in the coconut milk and stock, then add curry powder, thyme, scotch bonnet, and salt. Bring to a gentle boil.",
      "Stir in the rinsed rice, reduce heat to low, cover tightly, and cook for 20–25 minutes until all liquid is absorbed.",
      "Fluff with a fork and serve warm with fried plantains or grilled chicken."
    ]
  },
  "Pineapple Rice": {
    time: "30 mins",
    servings: "3 servings",
    ingredients: [
      "3 cups cooked and cooled jasmine or basmati rice",
      "1 cup fresh pineapple chunks",
      "1/2 cup diced red bell pepper & 1/2 cup green peas",
      "2 spring onions (sliced) & 2 cloves garlic (minced)",
      "2 tbsp soy sauce & 1 tbsp sesame or vegetable oil",
      "1/4 cup roasted cashews (optional)"
    ],
    steps: [
      "Heat oil in a wok or wide pan over medium-high heat. Sauté garlic, bell pepper, and peas for 2 minutes.",
      "Add the pineapple chunks and stir-fry for 2 minutes until lightly caramelized.",
      "Toss in the cooked rice and drizzle soy sauce over the top, stirring continuously for 4–5 minutes.",
      "Garnish with sliced spring onions and roasted cashews before serving."
    ]
  },
  "Shrimp Fried Rice": {
    time: "25 mins",
    servings: "3 servings",
    ingredients: [
      "3 cups cold cooked white rice",
      "250g raw shrimp, peeled and deveined",
      "2 eggs, lightly beaten",
      "1 cup mixed carrots, sweet corn, and green peas",
      "2 tbsp soy sauce & 1 tsp oyster sauce",
      "2 tbsp vegetable oil & 2 cloves minced garlic"
    ],
    steps: [
      "Heat 1 tbsp oil in a skillet, cook the shrimp for 2 minutes per side until pink, then remove.",
      "Pour beaten eggs into the pan, scramble quickly, and set aside with the shrimp.",
      "Add remaining oil, garlic, and mixed vegetables; stir-fry for 3 minutes.",
      "Add the cold rice, soy sauce, and oyster sauce. Toss over high heat for 4 minutes, then fold the shrimp and eggs back in."
    ]
  },
  "Chinese Rice": {
    time: "20 mins",
    servings: "3 servings",
    ingredients: [
      "3 cups day-old cooked long-grain rice",
      "3 large eggs, beaten with a pinch of salt",
      "3 stalks spring onion (chopped)",
      "2 tbsp light soy sauce",
      "1 tsp sesame oil & 2 tbsp cooking oil",
      "1/2 tsp white pepper"
    ],
    steps: [
      "Heat cooking oil in a wok until shimmering. Pour in the beaten eggs and stir softly into large curds.",
      "Add the cold rice directly over the eggs, breaking up any clumps with a spatula.",
      "Drizzle soy sauce, sesame oil, and white pepper around the edges of the pan and toss for 3–4 minutes.",
      "Turn off the heat, fold in the chopped spring onions, and serve hot."
    ]
  },
  "Ofada Rice": {
  time: "55 mins",
  servings: "4 servings",
  ingredients: [
    "2.5 cups local Ofada rice, thoroughly rinsed",
    "8 large green bell peppers (tatashe/green peppers) & 4 green scotch bonnets",
    "2 large red onions (1 blended with peppers, 1 sliced)",
    "1/2 cup bleached palm oil",
    "2 tbsp fermented locust beans (iru)",
    "300g assorted cooked meats (beef, shaki, ponmo) & 4 boiled eggs",
    "2 tbsp ground crayfish, 2 seasoning cubes & salt to taste"
  ],
  steps: [
    "Roughly blend the green bell peppers, scotch bonnets, and 1 onion, then boil in a pot until excess water evaporates.",
    "In a separate pot, bleach the palm oil over medium heat for 5–7 minutes (with the lid on), then let it cool slightly before adding sliced onions and iru.",
    "Pour in the reduced green pepper blend, ground crayfish, seasoning cubes, and salt. Fry for 10 minutes until the oil floats to the surface.",
    "Fold in the assorted meats and boiled eggs, simmer for 5 minutes, and serve hot alongside boiled Ofada rice."
  ]
 }
};

fullRecipeData["Jollof Rice"] = jollofRecipe;
fullRecipeData["Fried rice"] = friedRiceRecipe;
fullRecipeData["Fried Rice"] = friedRiceRecipe;

// Navigate to recipe.html when any card (except its heart button) is tapped
document.addEventListener("click", (e) => {
  // Ignore heart button taps on .recipe-item cards
  if (e.target.closest(".heart-btn")) return;

  // Check if user tapped either a horizontal card (.recipe-item) or a featured card (.recipe-card)
  const card = e.target.closest(".recipe-item, .recipe-card");
  if (!card) return;

  const title = card.querySelector(".recipe-title, .title")?.innerText.trim();
  const benefit = card.querySelector(".benefit-row span, .subtitle")?.innerText.trim() || "";
  const img = card.querySelector(".recipe-img, .food-img")?.getAttribute("src") || "";

  if (title) {
    localStorage.setItem("selectedRecipe", JSON.stringify({ title, benefit, img }));
    window.location.href = "recipe.html";
  }
});

// Render selected recipe inside recipe.html
const recipeDetailContainer = document.getElementById("recipeDetailContainer");

if (recipeDetailContainer) {
  const selected = JSON.parse(localStorage.getItem("selectedRecipe"));

  if (!selected) {
    recipeDetailContainer.innerHTML = `<p style="text-align:center; color:#888; padding:30px;">No recipe selected. Go back and tap a recipe card.</p>`;
  } else {
    const details = fullRecipeData[selected.title] || {
      time: "35 mins",
      servings: "4 servings",
      ingredients: ["2 cups rice", "Fresh vegetables & seasoning", "Stock or water", "Cooking oil & spices"],
      steps: ["Prepare and wash all ingredients.", "Sauté aromatics and spices in oil.", "Add rice and liquid, then simmer until tender."]
    };

    recipeDetailContainer.innerHTML = `
      <img src="${selected.img}" alt="${selected.title}" class="detail-hero-img">
      <div class="detail-card">
        <h1 class="detail-title">${selected.title}</h1>
        <p class="detail-subtitle">${selected.benefit}</p>

        <div class="detail-meta">
          <span class="meta-pill">⏱ ${details.time}</span>
          <span class="meta-pill">🍽 ${details.servings}</span>
        </div>

        <h2 class="detail-section-title">Ingredients</h2>
        <ul class="detail-ingredients">
          ${details.ingredients.map(ing => `<li>${ing}</li>`).join("")}
        </ul>

        <h2 class="detail-section-title">Instructions</h2>
        <ol class="detail-steps">
          ${details.steps.map(step => `<li>${step}</li>`).join("")}
        </ol>
      </div>
    `;
  }
}

// Link the "Start cook" button to Ofada Rice in recipe.html
const startCookBtn = document.getElementById("startCookBtn");

if (startCookBtn) {
  startCookBtn.addEventListener("click", (e) => {
    e.preventDefault();

    // Automatically grabs the banner image if it's an <img> inside the same container, or falls back to "ofada.jpg"
    const bannerContainer = startCookBtn.parentElement;
    const bannerImg = bannerContainer?.querySelector("img")?.getAttribute("src") || "ofada.jpg";

    localStorage.setItem("selectedRecipe", JSON.stringify({
      title: "Ofada Rice",
      benefit: "Weekly Pick Special — Authentic Ayamase & Local Rice",
      img: bannerImg
    }));

    window.location.href = "recipe.html";
  });
}

// for the register button
const openRegisterBtn = document.getElementById("openRegisterBtn");
const registerModal = document.getElementById("registerModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const registerForm = document.getElementById("registerForm");

if (openRegisterBtn && registerModal) {
  
  openRegisterBtn.addEventListener("click", () => {
    registerModal.style.display = "flex";
  });

  closeModalBtn?.addEventListener("click", () => {
    registerModal.style.display = "none";
  });

  registerModal.addEventListener("click", (e) => {
    if (e.target === registerModal) registerModal.style.display = "none";
  });

  registerForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    localStorage.setItem("chefRegistered", "true");
    
    registerModal.style.display = "none";
    alert("Welcome! You're registered for the Master Chef class.");
  });
}

// this is the menu page (menu.html)

const recipesList = [
  { name: "Jollof Rice", desc: "The Smoky Party Rice", img: "jollof.jpg" },
  { name: "Fried Rice", desc: "Rice With Veggies", img: "Fried.jpg" },
  { name: "Jambalaya Rice", desc: "A Fusion Of African, Spanish And French Taste", img: "jambalaya.jpg" },
  { name: "Coconut Rice", desc: "Rice Cooked In Coconut Milk", img: "coconut.jpg" },
  { name: "Pineapple Rice", desc: "Rice Mixed With Pineapple Chunks", img: "pineapple.jpg" },
  { name: "Shrimp Fried Rice", desc: "Rice Stir-fried With Shrimp", img: "shrimp.jpg" },
  { name: "Chinese Rice", desc: "Rice Fried With Eggs", img: "Chinese.jpg" },
  { name: "Ofada Rice", desc: "Authentic Ayamase & Local Rice", img: "ofada.jpg" }
];

const fullMenuContainer = document.getElementById("fullMenuContainer");

function renderFullMenu() {
  if (!fullMenuContainer) return;

  let favorites = JSON.parse(localStorage.getItem("favoriteRecipes")) || [];
  fullMenuContainer.innerHTML = "";

  recipesList.forEach(recipe => {
    const isFav = favorites.some(fav => fav.title === recipe.name);

    const card = document.createElement("div");
    card.className = "recipe-item";
    card.innerHTML = `
      <img src="${recipe.img}" alt="${recipe.name}" class="recipe-img">
      <div class="recipe-details">
        <h3 class="recipe-title">${recipe.name}</h3>
        <div class="benefit-row">
          <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
          <span>${recipe.desc}</span>
        </div>
      </div>
      <button type="button" class="heart-btn ${isFav ? "liked" : ""}" aria-label="Favorite">
        ${isFav ? "♥" : "♡"}
      </button>
    `;

    const heartBtn = card.querySelector(".heart-btn");
    heartBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      favorites = JSON.parse(localStorage.getItem("favoriteRecipes")) || [];
      const existingIndex = favorites.findIndex(item => item.title === recipe.name);

      if (existingIndex === -1) {
        favorites.push({ title: recipe.name, benefit: recipe.desc, img: recipe.img });
        heartBtn.classList.add("liked");
        heartBtn.innerText = "♥";
      } else {
        favorites.splice(existingIndex, 1);
        heartBtn.classList.remove("liked");
        heartBtn.innerText = "♡";
      }

      localStorage.setItem("favoriteRecipes", JSON.stringify(favorites));
    });

    fullMenuContainer.appendChild(card);
  });
}

if (fullMenuContainer) {
  renderFullMenu();
}
