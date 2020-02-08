const printDefinition = (data) => {
    console.log("****DEFINITIONS******");
    if (data.length == 0) {
        console.log("Oops!! No definitions found")
    } else {
        console.table(data);
    }
}

const printSynonyms = (data) => {
    console.log("****SYNONYMS******");
    if (data.length == 0) {
        console.log("Oops!! No synonyms found")
    } else {
        console.table(data);
    }
}

const printAntonyms = (data) => {
    console.log("****ANTONYMS******");
    if (data.length == 0) {
        console.log("Oops!! No antonyms found")
    } else {
        console.table(data);
    }
}

const printExamples = (data) => {
    console.log("****EXAMPLES******");
    if (data.length == 0) {
        console.log("Oops!! No examples found")
    } else {
        console.log(data);
    }
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