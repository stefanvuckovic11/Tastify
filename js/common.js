var RAPID_API_HEADERS = {
    'X-RapidAPI-Key': '0ff44d6730mshc0ecfc5c666cdf6p1ffceajsn75e05042f178',
    'X-RapidAPI-Host': 'tasty.p.rapidapi.com'
};

function fetchText(url) {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.responseText);
                } else {
                    reject(new Error('Greška u učitavanju ' + url));
                }
            }
        };
        xhr.send();
    });
}

function setRapidAPIHeaders(xhr) {
    for (var key in RAPID_API_HEADERS) {
        if (RAPID_API_HEADERS.hasOwnProperty(key)) {
            xhr.setRequestHeader(key, RAPID_API_HEADERS[key]);
        }
    }
}

function fetchTastyRecipeById(id) {
    var url = 'https://tasty.p.rapidapi.com/recipes/get-more-info?id=' + id;
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        setRapidAPIHeaders(xhr);
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
                    reject(new Error('Greška u networku ' + xhr.status));
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
        setRapidAPIHeaders(xhr);
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
                    reject(new Error('Greška u networku ' + xhr.status));
                }
            }
        };
        xhr.send();
    });
}
function getRecipeIdFromURL() {
    var search = window.location.search.substring(1);
    var params = search.split('&');
    for (var i = 0; i < params.length; i++) {
        var pair = params[i].split('=');
        if (pair[0] === 'id') {
            return pair[1];
        }
    }
    return null;
}
