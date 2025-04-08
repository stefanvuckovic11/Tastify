function loadHandlebars() {
    return new Promise(function(resolve, reject) {
        var script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/npm/handlebars@4.7.7/dist/handlebars.min.js";
        script.onload = function() {
            if (window.Handlebars) {
                resolve(window.Handlebars);
            } else {
                reject(new Error('handlebars se nije ucitao'));
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
                    reject(new Error('greska u ' + url));
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
                    fetchText('./partials/hero.handlebars')
                        .then(function(heroTemplateSource) {
                            Handlebars.registerPartial('hero', heroTemplateSource);
                            fetchText('./partials/cards.handlebars')
                                .then(function(cardsTemplateSource) {
                                    Handlebars.registerPartial('cards', cardsTemplateSource);
                                    var mainTemplateSource = document.getElementById('main-template').innerHTML;
                                    var mainTemplate = Handlebars.compile(mainTemplateSource);
                                    var renderedHTML = mainTemplate({});
                                    document.getElementById('app').innerHTML = renderedHTML;
                                })
                                .catch(function(error) {
                                    console.error('greska u ucitavanju cards partiala', error);
                                });
                        })
                        .catch(function(error) {
                            console.error('greska u ucitavanju hero partiala', error);
                        });
                })
                .catch(function(error) {
                    console.error('greska u ucitavanju navbar partiala', error);
                });
        })
        .catch(function(error) {
            console.error('greska u ucitavanju handlebarsa', error);
        });
});
