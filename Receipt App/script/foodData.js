document.addEventListener('DOMContentLoaded', () => {
    //get apiKey and food_id from index.html
    const urlParams = new URLSearchParams(window.location.search);
    const foodId = urlParams.get('id');
    const apiKey = urlParams.get('api');

    if (!foodId || !apiKey) {
        console.error("Missing food ID or API key in URL");
        return;
    }

    const apiUrl = `https://api.spoonacular.com/recipes/${foodId}/information?apiKey=${apiKey}`;
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            displayFoodData(data);
            console.log(data);
        })
        .catch(error => {
            console.error("Error fetching food data:", error);
        });
    //favourite feature
    let favourites = JSON.parse(localStorage.getItem('favourites')) || [];

    updateFavouriteIcon(foodId);

    const favouriteIcon = document.querySelector('.favourite__icon');
    favouriteIcon.addEventListener('click', () => {
        toggleFavourite(foodId);
        updateFavouriteIcon(foodId);
    });

    function toggleFavourite(id) {
        if (favourites.includes(id)) {
            favourites = favourites.filter(item => item !== id);
        } else {
            favourites.push(id);
        }
        localStorage.setItem('favourites', JSON.stringify(favourites));
    }

    function updateFavouriteIcon(id) {
        const iconImage = favouriteIcon.querySelector('img');
        if (favourites.includes(id)) {
            iconImage.src = 'img/favourite-icon-red.svg'; 
        } else {
            iconImage.src = 'img/favourite-icon-black.svg'; 
        }
    }
});

//displaying foods
function displayFoodData(foodData) {
    document.getElementById('foodName').textContent = foodData.title || 'No Title';

    const foodRatingIcon = document.getElementById('foodRatingIcon');
    foodRatingIcon.innerHTML = ''; 
    for (let i = 20; i < 120; i+=20) {
        const star = document.createElement('img');
        star.src = i < foodData.spoonacularScore ? 'img/rating-full-icon.svg' : 'img/rating-empty-icon.svg';
        star.alt = 'Rating Icon';
        foodRatingIcon.appendChild(star);
    }

    const foodTopics = document.getElementById('food__topics');
    
    if (foodTopics) {
        //add food types 
        const dishTypes = foodData.dishTypes || [];
        dishTypes.slice(0, 5).forEach(type => {
            const topicElement = document.createElement('div');
            topicElement.classList.add('food__topic');
            topicElement.textContent = type;
            foodTopics.appendChild(topicElement);
        });
    } else {
        console.error('Element with class .food__topics not found');
    }

    document.getElementById('foodRatingScore').textContent = Math.round(foodData.spoonacularScore)+'/100' || 'N/A';
    document.getElementById('prepTime').textContent = foodData.healthScore+'%' || 'N/A';
    document.getElementById('cookTime').textContent = foodData.readyInMinutes+'m' || 'N/A';
    document.getElementById('totalTime').textContent = foodData.servings || 'N/A';

    const foodImage = document.getElementById('foodImage');
    foodImage.src = foodData.image || '';
    foodImage.alt = foodData.title || 'Food Image';

    document.getElementById('summary').innerHTML = foodData.summary || 'No Summary';

    const methodSteps = document.getElementById('methodSteps');
    if (methodSteps) {
        methodSteps.innerHTML = '';

        let instructions = foodData.instructions;
        
        if (typeof instructions === 'string') {
            instructions = instructions.split('.').map(step => step.trim()).filter(step => step); 
        }
        if (Array.isArray(instructions) && instructions.length > 0) {
            instructions.forEach((step, index) => {
                const stepElement = document.createElement('div');
                stepElement.classList.add('method-step');
                stepElement.innerHTML = `<strong>Step ${index + 1}:</strong> ${step}`;
                methodSteps.appendChild(stepElement);
            });
        } else {
            methodSteps.innerHTML = 'No instructions available.';
        }
    } else {
        console.error('Element with ID "methodSteps" not found');
    }


    //table with ingredients data
    const ingredientsTable = document.getElementById('ingredientsTable');
    if (ingredientsTable) {
        const tableBody = ingredientsTable.querySelector('tbody');

        if (foodData.extendedIngredients && foodData.extendedIngredients.length > 0) {
            foodData.extendedIngredients.forEach(ingredient => {
                const row = document.createElement('tr');
                
                const nameCell = document.createElement('td');
                nameCell.textContent = ingredient.name || 'N/A';
                
                const amountCell = document.createElement('td');
                amountCell.textContent = ingredient.amount || 'N/A';

                const unitCell = document.createElement('td');
                unitCell.textContent = ingredient.unit || 'N/A';
                
                const imageCell = document.createElement('td');
                const image = document.createElement('img');
                image.src = ingredient.image ? `https://spoonacular.com/cdn/ingredients_100x100/${ingredient.image}` : 'img/default-ingredient-image.jpg';
                image.alt = ingredient.name || 'Ingredient Image';
                image.style.width = '50px';
                imageCell.appendChild(image);

                row.appendChild(nameCell);
                row.appendChild(amountCell);
                row.appendChild(unitCell);
                row.appendChild(imageCell);
                
                tableBody.appendChild(row);
            });
        } else {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 4;
            cell.textContent = 'No ingredients available.';
            row.appendChild(cell);
            tableBody.appendChild(row);
        }
    } else {
        console.error('Element with ID "ingredientsTable" not found');
    }

}
