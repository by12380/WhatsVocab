const DICTIONARY_API_DATA = {
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
    let innerHtml = "";

    if (data.results.length != 0) {
        for (let result of data.results) {
            if (result.headword.toLowerCase() === APP_DATA.query.toLowerCase()) {
                innerHtml += `
                    <div>
                        <p>${toFirstCharUpperCase(result.headword)}</p>
                        <p>${toFirstCharUpperCase(result.senses[0].definition[0])}</p>
                    </div>
                `;
            }
        }
    }
    else
    {
        innerHtml += `
            <div>
                <p>Sorry, no dictionary entries were found.</p>
            </div>
        `;
    }

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
    let innerHtml = "";
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
    $("#newsResults").html(innerHtml);
}

function toFirstCharUpperCase(str) {
    return str[0].toUpperCase() + str.substr(1);
}

$(handleFormSubmit);