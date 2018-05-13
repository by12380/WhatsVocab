const DICTIONARY_API_DATA = {
    url: "https://api.pearson.com/v2/dictionaries/ldoce5/entries"
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
    $("#dictionaryResults").html(innerHtml);
}

function toFirstCharUpperCase(str) {
    return str[0].toUpperCase() + str.substr(1);
}

$(handleFormSubmit);