document.addEventListener('DOMContentLoaded', function() {
    Promise.all([
        fetchText('./layouts/navbar.handlebars'),
        fetchText('./partials/hero.handlebars'),
        fetchText('./partials/loader.handlebars'),
        fetchText('./partials/cards.handlebars')
    ]).then(function(templates) {
        window.Handlebars.registerPartial('layouts/navbar', templates[0]);
        window.Handlebars.registerPartial('hero', templates[1]);
        window.Handlebars.registerPartial('loader', templates[2]);
        window.Handlebars.registerPartial('cards', templates[3]);
        renderRecipes({ results: [] });
        return fetchTastyRecipes();
    }).then(function(recipesData) {
        renderRecipes(recipesData || {});
    }).catch(function(error) {
        console.error('Greška u učitavanju Handlebars template-a ili podataka', error);
    });
});

function renderRecipes(context) {
    var mainTemplateSource = document.getElementById('main-template').innerHTML;
    var mainTemplate = window.Handlebars.compile(mainTemplateSource);
    document.getElementById('app').innerHTML = mainTemplate(context);
    var loaderElem = document.querySelector('.cards .cards-loader');
    var cardsContent = document.querySelector('.cards #cards-content');
    if (!context.results || context.results.length === 0) {
        if (loaderElem) loaderElem.style.display = 'flex';
        if (cardsContent) cardsContent.style.display = 'none';
    } else {
        if (loaderElem) loaderElem.style.display = 'none';
        if (cardsContent) cardsContent.style.display = 'flex';
    }
    attachSearchListener();
}

function attachSearchListener() {
    var searchInput = document.getElementById('search-input');
    var searchButton = document.getElementById('search-button');
    if (searchButton && searchInput) {
        searchButton.addEventListener('click', function() {
            var query = searchInput.value.trim();
            searchButton.disabled = true;
            var loaderElem = document.querySelector('.cards .cards-loader');
            if (loaderElem) loaderElem.style.display = 'flex';
            var cardsContent = document.querySelector('.cards #cards-content');
            if (cardsContent) cardsContent.style.display = 'none';
            fetchTastyRecipes(query)
                .then(function(recipesData) {
                    renderRecipes(recipesData || {});
                    searchButton.disabled = false;
                })
                .catch(function(error) {
                    console.error(error);
                    searchButton.disabled = false;
                    if (loaderElem) loaderElem.style.display = 'none';
                });
        });
    }
}
