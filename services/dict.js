

const fetch = require('node-fetch');
const COMMANDS = ['defn', 'syn', 'ant', 'ex', 'play'];

const getCommand = (input) => {
    let [command, word] = input.split(' ');
    if (COMMANDS.indexOf(command) == -1) {
        word = command;
        command = '';
    }
    console.log("Input filtered......", command, word);
    return {
        command: command,
        word: word
    }
}

const getDefinition = async (input) => {
    const url = `${process.env.API_HOST}/word/${input}/definitions?api_key=${process.env.API_KEY}`
    const data = await makeRequest(url);
    console.log("\nDEFINITION")
    console.table(data);
}

const getSynonym = async (input) => {
    const url = `${process.env.API_HOST}/word/${input}/relatedWords?api_key=${process.env.API_KEY}`
    const data = await makeRequest(url);
    console.log("\nSYNONYM")
    console.table(data);
}

const getAntonym = async (input) => {
    const url = `${process.env.API_HOST}/word/${input}/relatedWords?api_key=${process.env.API_KEY}`
    const data = await makeRequest(url);
    console.log("\nANTONYM")
    console.table(data);
}

const getExamples = async (input) => {
    const url = `${process.env.API_HOST}/word/${input}/examples?api_key=${process.env.API_KEY}`
    const data = await makeRequest(url);
    console.log("\nEXAMPLES")
    // console.log(util.inspect(data, false, null, true /* enable colors */))
    console.log(data);
}

const getRandomWord = async () => {
    const url = `${process.env.API_HOST}/words/randomWord?api_key=${process.env.API_KEY}`
    const data = await makeRequest(url);
    console.log("\nRANDOM WORD")
    console.log(data.word);
    return data.word
}

const getAllData = async (input) => {
    if (!input) {
        input = await getRandomWord();
    }

    await Promise.all([
        getDefinition(input),
        getSynonym(input),
        getAntonym(input),
        getExamples(input)
    ]);
}

const makeRequest = async (url) => {
    // console.log("fetching ---------", url)

    try {
        const response = await fetch(url);
        const json = await response.json();
        return json;
    } catch (error) {
        console.error(error)
        return error.message;
    }
}

module.exports = {
    getCommand,
    getDefinition,
    getSynonym,
    getAntonym,
    getExamples,
    getAllData
}