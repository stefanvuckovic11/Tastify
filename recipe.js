function loadHandlebars() {
    return new Promise(function(resolve, reject) {
        var script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/npm/handlebars@4.7.7/dist/handlebars.min.js";
        script.onload = function() {
            if (window.Handlebars) {
                resolve(window.Handlebars);
            } else {
                reject(new Error('greska u ucitavanju handlebarsa'));
            }
        };
        script.onerror = function() {
            reject(new Error('greska u ucitavanju handlebarsa'));
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
                    reject(new Error('greska u ucitavanju ' + url));
                }
            }
        };
        xhr.send();
    });
}

function fetchTastyRecipeById(id) {
    var url = 'https://tasty.p.rapidapi.com/recipes/get-more-info?id=' + id;
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.setRequestHeader('X-RapidAPI-Key', 'cca0789d1fmshefe8157cc8ca21bp1695d7jsn03087d187c17');
        xhr.setRequestHeader('X-RapidAPI-Host', 'tasty.p.rapidapi.com');
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        var data = JSON.parse(xhr.responseText);
                        resolve(data);
                    } catch (e) {
                        reject(e);
                    }
                } else {
                    reject(new Error('greska u networku ' + xhr.status));
                }
            }
        };
        xhr.send();
    });
}

function getRecipeIdFromURL() {
    var params = new URLSearchParams(window.location.search);
    return params.get('id');
}

document.addEventListener('DOMContentLoaded', function() {
    var recipeId = getRecipeIdFromURL();
    if (!recipeId) {
        console.error('No recipe id found in the URL.');
        return;
    }
    loadHandlebars()
        .then(function(Handlebars) {
            Handlebars.registerHelper('inc', function(value) {
                return parseInt(value, 10) + 1;
            });
            return fetchText('./layouts/navbar.handlebars')
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
                    return fetchTastyRecipeById(recipeId);
                })
                .then(function(recipeData) {
                    var templateSource = document.getElementById('recipe-template').innerHTML;
                    var compiled = Handlebars.compile(templateSource);
                    var html = compiled(recipeData);
                    document.getElementById('recipe-app').innerHTML = html;
                });
        })
        .catch(function(error) {
            console.error('greska', error);
        });
});
