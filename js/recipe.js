document.addEventListener('DOMContentLoaded', function() {
    var recipeId = getRecipeIdFromURL();
    if (!recipeId) {
        console.error('Nije pronađen ID recepta u URL-u.');
        return;
    }
    window.Handlebars.registerHelper('inc', function(value) {
        return parseInt(value, 10) + 1;
    });
    Promise.all([
        fetchText('./layouts/navbar.handlebars'),
        fetchText('./partials/loader.handlebars')
    ]).then(function(templates) {
        var navbarSource = templates[0];
        var loaderSource = templates[1];
        window.Handlebars.registerPartial('layouts/navbar', navbarSource);
        window.Handlebars.registerPartial('loader', loaderSource);
        var initialTemplate = "<div>{{> layouts/navbar}}</div>\n<div class='recipe-loader'>{{> loader}}</div>";
        var compiledInitial = window.Handlebars.compile(initialTemplate);
        document.getElementById('recipe-app').innerHTML = compiledInitial();
        return fetchTastyRecipeById(recipeId);
    }).then(function(recipeData) {
        Promise.all([
            fetchText('./partials/recipe-header.handlebars'),
            fetchText('./partials/recipe.handlebars')
        ]).then(function(templates) {
            var recipeHeaderSource = templates[0];
            var recipeTemplateSource = templates[1];
            window.Handlebars.registerPartial('recipe-header', recipeHeaderSource);
            window.Handlebars.registerPartial('recipe', recipeTemplateSource);
            var fullTemplateSource = document.getElementById('recipe-template').innerHTML;
            var compiledRecipe = window.Handlebars.compile(fullTemplateSource);
            var html = compiledRecipe(recipeData);
            document.getElementById('recipe-app').innerHTML = html;
        }).catch(function(error) {
            console.error('Greška u učitavanju recipe partiala:', error);
        });
    }).catch(function(error) {
        console.error('Greška:', error);
    });
});
