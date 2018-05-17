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
    let count = 0;
    let innerHtml = `
        <div class="dict-result-container">
        <p class="dict-header"><i class="fas fa-book"></i>DICTIONARY</p>
    `;

    if (data.results.length != 0) {
        innerHtml += `<ol>`
        for (let result of data.results) {
            if (result.headword.toLowerCase() === APP_DATA.query.toLowerCase()
                && result.senses[0].definition) {
                innerHtml += `
                    <li>
                        <div class="entry-container">
                            <p class="word-entry">
                                ${toFirstCharUpperCase(result.headword)}
                                ${displayPartOfSpeech(result)}
                            </p>
                            ${displayAudioPlayerForPronunciation(result)}
                            <p>${toFirstCharUpperCase(result.senses[0].definition[0])}</p>
                        </div>
                    </li>
                `;
                count++;
            }
        }
        innerHtml += `</ol>`;
    }

    if (count === 0) {
        innerHtml += `
            <div>
                <p class="dict-error-msg">Sorry, no dictionary entries were found.</p>
            </div>
        `;
    }

    innerHtml += `</div>`;
    $("#dictionaryResults").html(innerHtml);
}

function displayAudioPlayerForPronunciation(result) {

    let innerHtml = "";

    //Check if pronunciation data is available
    if (result.pronunciation) {

        innerHtml += `
            <p class="pronunciation">
            / ${result.pronunciations[0].ipa} /
        `

        //Check if pronunciation audio data is available
        if (result.pronunciations[0].audio) {
            let pronunciation = result.pronunciations[0];

            //Check if American pronunciation audio data is available 
            if (pronunciation.length > 1) {
            innerHtml += `<audio src="${DICTIONARY_API_DATA.source}${pronunciation.audio[1].url}" id="${result.id}"></audio>`;
            //If not, append British pronunciation audio data
            } else {
            innerHtml += `<audio src="${DICTIONARY_API_DATA.source}${pronunciation.audio[0].url}" id="${result.id}"></audio>`;
            }
            innerHtml += `<i class="fas fa-volume-up js-play-btn audio-btn" aria-hidden="true" onclick="$('#${result.id}').get(0).play()"></i>`
        }
    }
    
    innerHtml += `</p>`;

    return innerHtml;
}

function displayPartOfSpeech(result) {
    innerHtml = "";

    if (result.part_of_speech) {
        innerHtml += `<span class="part-of-speech">${result.part_of_speech}</span>`;
    }

    return innerHtml;
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
    let count = 0;
    let innerHtml = `
        <div class="news-result-container">
        <p class="news-header"><i class="far fa-newspaper"></i>NEWS ARTICLES</p>
    `;
    
    if (data.totalResults != 0) {
        for (let article of data.articles) {
            if (article.description) {
                innerHtml += `
                    <div class="news-result">
                        ${article.urlToImage ? `<img src="${article.urlToImage}"/>` : ''}
                        <div class="news-content">
                            <p class="article-title">${article.title}</p>
                            <p class="article-description">&ldquo; ${article.description}... &rdquo;</p>
                            <a href="${article.url}" target="_blank">
                                <button class="go-to-article-btn">              
                                    Go to article
                                </button>
                            </a>
                        </div>
                    </div>
                `;
                count++;
            }
        }
    }

    if (count === 0) {
        innerHtml += `
            <p class="news-error-msg">Sorry, no news articles were found related to the word entry.</p>
        `;
    }

    innerHtml += `</div>`;
    $("#newsResults").html(innerHtml);
}

function displayNewsArticleImage(article) {

}

function toFirstCharUpperCase(str) {
    return str[0].toUpperCase() + str.substr(1);
}

$(handleFormSubmit);