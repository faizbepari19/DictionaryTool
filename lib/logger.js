const printDefinition = (data) => {
    console.log("****DEFINITIONS******");
    console.table(data);
}

const printSynonyms = (data) => {
    console.log("****SYNONYMS******");
    console.table(data);
}

const printAntonyms = (data) => {
    console.log("****ANTONYMS******");
    if(data.length == 0) {
        console.log("Oops!! No antonyms found")
    } else {
        console.table(data);
    }
}

const printExamples = (data) => {
    console.log("****EXAMPLES******");
    console.log(data);
}

const printRandomWord = (data) => {
    console.log("****RANDOM WORD******");
    console.log(data)
}

module.exports = {
    printDefinition,
    printSynonyms,
    printAntonyms,
    printExamples,
    printRandomWord
}