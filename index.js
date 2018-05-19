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
        let getDefinitionPromise = getDefinitionFromApi(query, displayWordDefinition);
        let getNewsPromise = getNewsFromApi(query, displayNewsArticles);

        //Clear form
        $("#query").val("");

        //Scroll to page result after ajax completes
        Promise.all([getDefinitionPromise, getNewsPromise]).then(() => {
            $('html, body').animate({
                scrollTop: $("#dictionaryResults").offset().top
            }, 500);
        })
    })
}

function handleBackToSearchClick() {
    $("nav.affix").click(() => {
        $('html, body').animate({
            scrollTop: $("main").offset().top
        }, 500);
    })
}

function handleAffixScroll() {
    $(window).on("scroll", function() {
        var scrollPos = $(window).scrollTop();
        if (scrollPos <= 120) {
            $("nav.affix").fadeOut();
        } else {
            $("nav.affix").fadeIn();
        }
    });
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
        <h2 class="dict-header"><i class="fas fa-book"></i>DICTIONARY</h2>
    `;

    if (data.results.length != 0) {
        innerHtml += `<ol>`
        for (let result of data.results) {
            if (result.headword.toLowerCase() === APP_DATA.query.toLowerCase()
                && result.senses[0].definition) {
                innerHtml += `
                    <li>
                        <div class="entry-container">
                            <h3 class="word-entry">
                                ${toFirstCharUpperCase(result.headword)}
                                ${displayPartOfSpeech(result)}
                            </h3>
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
                <p class="dict-error-msg">
                    Sorry, no dictionary entries were found.
                    <span class="tooltip">
                        <i class="fas fa-info-circle info-icon"></i>
                        <span class="tooltiptext">
                            Is it a new word?</br>
                            Try singular, present-tense forms.
                        </span>
                    </span>
                </p>
                <p>
                    <a
                        href="https://www.google.com/search?q=${APP_DATA.query}+definition"
                        class="try-google-link"
                        target="_blank">
                            <span>Try Google</span>
                            <i class="fas fa-search"></i>
                    </a>
                </p>
            </div>
        `;
    }

    innerHtml += `</div>`;
    $("#dictionaryResults").html(innerHtml);
}

function displayAudioPlayerForPronunciation(result) {

    let innerHtml = "";

    //Check if pronunciation data is available
    if (result.pronunciations) {

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
        <h2 class="news-header"><i class="far fa-newspaper"></i>NEWS ARTICLES</h2>
    `;
    
    if (data.totalResults != 0) {
        for (let article of data.articles) {
            if (article.description) {
                innerHtml += `
                    <div class="news-result">
                        ${article.urlToImage ? `<img src="${article.urlToImage}"/ alt="image from ${article.source.name}">` : ''}
                        <div class="news-content">
                            <h3 class="article-title">${article.title}</h3>
                            <p class="article-description">
                                &ldquo; ${article.description}... &rdquo;
                            </p>
                            <p class="article-source">- ${article.source.name}</p>
                            <div class="clear"></div>
                            <a class="go-to-article-link" href="${article.url}" target="_blank">
                                <div class="go-to-article-btn">
                                    Go to article
                                </div>
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

function toFirstCharUpperCase(str) {
    return str[0].toUpperCase() + str.substr(1);
}

function initializeApp() {
    handleFormSubmit();
    handleBackToSearchClick();
    handleAffixScroll();
}

$(initializeApp);