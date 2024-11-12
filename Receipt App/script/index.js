document.addEventListener('DOMContentLoaded', () => {
    //api 2 
    // const API = "68bf884259f14171aceb105d7ff1d7cc"; 
    const API = "2e7da3aa7d9c424abbb8471593bb5025";
    const randomFoodsURL = `https://api.spoonacular.com/recipes/random?number=50&apiKey=${API}`;
    const searchInput = document.getElementById('search');
    
    const suggestionsList = document.createElement('ul');
    suggestionsList.classList.add('suggestions');
    searchInput.parentNode.insertBefore(suggestionsList, searchInput.nextSibling);

    //get random foods for displaying in main page
    async function getRandomFoods() {
        try {
            const response = await fetch(randomFoodsURL);
            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }
            const data = await response.json();
            console.log(data);
            displayFoods(data.recipes || []);
        } catch (error) {
            console.error('Error fetching random foods:', error);
        }
    }

    //auto suggestion for query
    async function getAutoSuggestions(query) {
        const requestURL = `https://api.spoonacular.com/food/products/suggest?query=${query}&number=5&apiKey=${API}`;
        try {
            const response = await fetch(requestURL);
            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }
            const data = await response.json();
            return data.results || [];
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            return [];
        }
    }

    function displaySuggestions(suggestions) {
        suggestionsList.innerHTML = '';
    
        suggestions.forEach(item => {
            const suggestionItem = document.createElement('li');
            suggestionItem.textContent = item.title;
            suggestionItem.addEventListener('click', () => {
                searchInput.value = item.title;
                suggestionsList.innerHTML = '';
    
                const searchForm = document.querySelector('.form-wrapper');
                searchForm.requestSubmit();
            });
            suggestionsList.appendChild(suggestionItem);
        });
    }
    
    //auto suggestion work only searchInput has more than 2 characters
    searchInput.addEventListener('input', async () => {
        const query = searchInput.value.trim().toLowerCase();
        if (query.length > 2) {
            const suggestions = await getAutoSuggestions(query);
            displaySuggestions(suggestions);
        } else {
            suggestionsList.innerHTML = '';
        }
    });

    document.addEventListener('click', (event) => {
        if (!suggestionsList.contains(event.target) && event.target !== searchInput) {
            suggestionsList.innerHTML = '';
        }
    });

    //get foods
    async function getRequest(query, filters) {
        let request = `https://api.spoonacular.com/food/menuItems/search?query=${query}&number=50&apiKey=${API}`;
        if (filters.calories) request += `&maxCalories=${filters.calories}`;
        if (filters.cuisine) request += `&cuisine=${filters.cuisine}`;
        if (filters.sugar) request += `&maxSugar=${filters.sugar}`;
        if (filters.minFat) request += `&minFat=${filters.minFat}`;
        if (filters.minAlcohol) request += `&minAlcohol=${filters.minAlcohol}`;
        if (filters.maxReadyTime) request += `&maxReadyTime=${filters.maxReadyTime}`;
        if (filters.diet) request += `&diet=${filters.diet}`;

        try {
            const response = await fetch(request);
            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }
            const data = await response.json();
            return data.menuItems || [];
        } catch (error) {
            console.error('Error fetching data:', error);
            return [];
        }
    }

    // show foods
    function displayFoods(foods) {
        console.log(foods);
        const foodList = document.querySelector('.food__list');
        if (!foodList) {
            console.error("Element 'food__list' not found in the DOM.");
            return;
        }
        foodList.innerHTML = "";
    
        if (foods.length === 0) {
            foodList.innerHTML = "<p>No results found. Try adjusting your filters.</p>";
            return;
        }
    
        foods.forEach(foodData => {
            if (!foodData.image || foodData.image.trim() === '') {
                return;
            }
    
            const foodItem = document.createElement('div');
            foodItem.classList.add('food');
    
            foodItem.innerHTML = `
                <div class="food__image">
                    <img src="${foodData.image}" alt="${foodData.title || 'No Title'}">
                </div>
                <div class="food__name">
                    <a href="#" class="food__link">${foodData.title || 'No Title'}</a>
                </div>
                <div class="food__description">
                    <p>${foodData.restaurantChain || foodData.sourceName || 'Description not available.'}</p>
                </div>
            `;
    
            foodItem.querySelector('.food__link').addEventListener('click', (e) => {
                e.preventDefault();
                const foodUrl = `foodData.html?id=${foodData.id}&api=${API}`;
                window.location.href = foodUrl;
            });
            
    
            foodList.appendChild(foodItem);
        });
    }
    

    //you can search with specific attributes
    const searchForm = document.querySelector('.form-wrapper');
    searchForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const query = searchInput.value.trim().toLowerCase();

        const filters = {
            calories: document.getElementById('calories').value,
            cuisine: document.getElementById('cuisine').value,
            sugar: document.getElementById('sugar').value,
            minFat: document.getElementById('minFat').value,
            minAlcohol: document.getElementById('minAlcohol').value,
            maxReadyTime: document.getElementById('maxReadyTime').value,
            diet: document.getElementById('diet').value
        };

        if (query) {
            const foods = await getRequest(query, filters); 
            displayFoods(foods);
        } else {
            console.error("Query cannot be empty.");
        }
    });

    getRandomFoods();
});


