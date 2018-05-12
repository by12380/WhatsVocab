const DICTIONARY_URL = "https://api.pearson.com/v2/dictionaries/ldoce5/entries";

//Need review regaring best practices
const APP_DATA = {
    query: ""
};

function handleFormSubmit() {
    $("#searchForm").submit(e => {
        e.preventDefault();
        let query = $("#query").val();
        getDefinitionFromApi(query, displayWordDefinition);
    })
}

function getDefinitionFromApi (word, callback) {
    let url = DICTIONARY_URL;
    APP_DATA.query = word;

    let data = {
        headword: word,
        limit: 5
    }
    $.getJSON(url, data, callback);
}

function displayWordDefinition (data) {
    let innerHtml = "";
    for (let result of data.results) {
        if (result.headword.toLowerCase() === APP_DATA.query.toLowerCase()) {
            innerHtml += `
                <div>
                    <p>${result.headword}</p>
                    <p>${result.senses[0].definition}</p>
                </div>
            `;
        }
    }
    $("#dictionaryResults").html(innerHtml);
}

$(handleFormSubmit);