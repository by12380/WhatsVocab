const DICTIONARY_API_DATA = {
    source: "https://api.pearson.com",
    url: "https://api.pearson.com/v2/dictionaries/ldoce5/entries"
}
const NEWS_API_DATA = {
    newsArticlesUrl: "https://newsapi.org/v2/everything",
    newsSourcesUrl: "https://newsapi.org/v2/sources",
    apiKey: "4fc85e70b54a4794a0bc4227b8b1f5c3"
}

//Need review regaring best practices
const APP_DATA = {
    query: ""
};

function handleFormSubmit() {
    $("#searchForm").submit(e => {
        e.preventDefault();
        let query = $("#query").val();
        APP_DATA.query = query;
        getDefinitionFromApi(query, displayWordDefinition);
        getNewsFromApi(query, displayNewsArticles);

        //Clear form
        $("#query").val("");
    })
}

function getDefinitionFromApi (word, callback) {
    let data = {
        headword: word,
        limit: 5
    }
    $.getJSON(DICTIONARY_API_DATA.url, data, callback);
}

function displayWordDefinition (data) {
    let innerHtml = `
        <hr />
        <p class="dict-header">DICTIONARY</p>
    `;

    if (data.results.length != 0) {
        innerHtml += `<ol>`
        for (let result of data.results) {
            if (result.headword.toLowerCase() === APP_DATA.query.toLowerCase()) {
                innerHtml += `
                    <li>
                        <div class="entry-container">
                            <p class="word-entry">
                                ${toFirstCharUpperCase(result.headword)}
                                <span class="part-of-speech">${result.part_of_speech}</span>
                            </p>
                            <p class="pronunciation">
                                / ${result.pronunciations[0].ipa} /
                                <audio controls src="${DICTIONARY_API_DATA.source}${result.pronunciations[0].audio[1].url}" id="${result.id}"></audio>
                            </p>
                            <p>${toFirstCharUpperCase(result.senses[0].definition[0])}</p>
                        </div>
                    </li>
                `;
            }
        }
        innerHtml += `</ol>`
    }
    else
    {
        innerHtml += `
            <div>
                <p class="dict-error-msg">Sorry, no dictionary entries were found.</p>
            </div>
        `;
    }

    innerHtml += `<hr />`;
    $("#dictionaryResults").html(innerHtml);
}

function getNewsFromApi (word, callback) {

    let newsSourcesData = {
        language: "en",
        apiKey: NEWS_API_DATA.apiKey
    }

    //Retrive news sources data then fetch articles
    $.getJSON(NEWS_API_DATA.newsSourcesUrl, newsSourcesData, result => {
        let sources = result.sources.map(source => {
            return source.id;
        })

        let data = {
            q: word,
            pageSize: 3,
            sources: sources.join(),
            apiKey: NEWS_API_DATA.apiKey
        }
        $.getJSON(NEWS_API_DATA.newsArticlesUrl, data, callback);
    })
    
}

function displayNewsArticles (data) {
    let innerHtml = `
        <hr />
        <p class="news-header">NEWS ARTICLES</p>
    `;
    
    if (data.totalResults != 0) {
        for (let article of data.articles) {
            if (article.description != "") {
                innerHtml += `
                    <div>
                        <p>${article.title}</p>
                        <p>${article.description}</p>
                        <p>
                            <a href="${article.url}" target="_blank">
                                Go to article
                            </a>
                        </p>
                    </div>
                `;
            }
        }
    }
    else
    {
        innerHtml += `
            <p class="news-error-msg">Sorry, no news articles were found related to the word entry.</p>
        `;
    }

    innerHtml += `<hr />`;
    $("#newsResults").html(innerHtml);
}

function toFirstCharUpperCase(str) {
    return str[0].toUpperCase() + str.substr(1);
}

$(handleFormSubmit);