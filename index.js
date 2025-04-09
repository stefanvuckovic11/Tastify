function loadHandlebars() {
    return new Promise(function(resolve, reject) {
        var script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/npm/handlebars@4.7.7/dist/handlebars.min.js";
        script.onload = function() {
            if (window.Handlebars) {
                resolve(window.Handlebars);
            } else {
                reject(new Error('handlebars greska'));
            }
        };
        script.onerror = function() {
            reject(new Error('handlebars greska'));
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
                    reject(new Error('greska u loadingu ' + url));
                }
            }
        };
        xhr.send();
    });
}

function fetchTastyRecipes(query) {
    var url = 'https://tasty.p.rapidapi.com/recipes/list?from=0&size=20&tags=under_30_minutes';
    if (query) {
        url += '&q=' + encodeURIComponent(query);
    }
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

function renderRecipes(context) {
    var mainTemplateSource = document.getElementById('main-template').innerHTML;
    var mainTemplate = window.Handlebars.compile(mainTemplateSource);
    var renderedHTML = mainTemplate(context);
    document.getElementById('app').innerHTML = renderedHTML;
    attachSearchListener();
}

function attachSearchListener() {
    var searchInput = document.getElementById('search-input');
    var searchButton = document.getElementById('search-button');
    if (searchButton && searchInput) {
        searchButton.addEventListener('click', function() {
            var query = searchInput.value.trim();
            searchButton.disabled = true;
            fetchTastyRecipes(query)
                .then(function(recipesData) {
                    var context = recipesData || {};
                    renderRecipes(context);
                    searchButton.disabled = false;
                })
                .catch(function(error) {
                    console.error(error);
                    searchButton.disabled = false;
                });
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    loadHandlebars()
        .then(function(Handlebars) {
            fetchText('./layouts/navbar.handlebars')
                .then(function(navbarTemplateSource) {
                    Handlebars.registerPartial('layouts/navbar', navbarTemplateSource);
                    return fetchText('./partials/hero.handlebars');
                })
                .then(function(heroTemplateSource) {
                    Handlebars.registerPartial('hero', heroTemplateSource);
                    return fetchText('./partials/cards.handlebars');
                })
                .then(function(cardsTemplateSource) {
                    Handlebars.registerPartial('cards', cardsTemplateSource);
                    return fetchTastyRecipes();
                })
                .then(function(recipesData) {
                    var context = recipesData || {};
                    renderRecipes(context);
                })
                .catch(function(error) {
                    console.error('greska u ucitavanju handlebars template-a', error);
                });
        })
        .catch(function(error) {
            console.error('greska u ucitvanju handlebarsa', error);
        });
});
