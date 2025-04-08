function loadHandlebars() {
    return new Promise(function(resolve, reject) {
        var script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/npm/handlebars@4.7.7/dist/handlebars.min.js";
        script.onload = function() {
            if (window.Handlebars) {
                resolve(window.Handlebars);
            } else {
                reject(new Error('Handlebars did not load.'));
            }
        };
        script.onerror = function() {
            reject(new Error('Error loading Handlebars script.'));
        };
        document.head.appendChild(script);
    });
}

function fetchText(url) {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.responseText);
                } else {
                    reject(new Error('Error fetching ' + url));
                }
            }
        };
        xhr.send();
    });
}

document.addEventListener('DOMContentLoaded', function() {
    loadHandlebars()
        .then(function(Handlebars) {
            fetchText('./layouts/navbar.handlebars')
                .then(function(navbarTemplateSource) {
                    Handlebars.registerPartial('layouts/navbar', navbarTemplateSource);
                    return fetchText('./partials/recipe-header.handlebars');
                })
                .then(function(recipeHeaderSource) {
                    Handlebars.registerPartial('recipe-header', recipeHeaderSource);
                    return fetchText('./partials/recipe.handlebars');
                })
                .then(function(recipeTemplateSource) {
                    Handlebars.registerPartial('recipe', recipeTemplateSource);
                    var templateSource = document.getElementById('recipe-template').innerHTML;
                    var compiled = Handlebars.compile(templateSource);
                    var html = compiled({});
                    document.getElementById('recipe-app').innerHTML = html;
                })
                .catch(function(error) {
                    console.error('Error fetching partials:', error);
                });
        })
        .catch(function(error) {
            console.error('Error loading Handlebars:', error);
        });
});
