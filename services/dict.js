

const fetch = require('node-fetch');
const logger = require('../lib/logger');
const COMMANDS = ['defn', 'syn', 'ant', 'ex', 'play'];
const HINT = {
    jumble: 1,
    definition: 2,
    synonym: 3,
    antonym: 4
}

/**
 * 
 * @returns {Object} An object with command and word
 */
const getCommand = (input) => {
    let [command, word] = input.split(' ');
    //Check if command is valid.
    if (COMMANDS.indexOf(command) == -1 && !word) {
        word = command;
        command = '';
    }
    console.log(`Your command is ${command} for the word ${word}`);
    return {
        command: command,
        word: word
    }
}

/**
 * Returns a list of definitions
 * @param {string} input 
 * @param {number} limit 
 * 
 * @returns {(String[])} or empty []
 */
const getDefinition = async (input, limit = false) => {
    const url = `${process.env.API_HOST}/word/${input}/definitions?api_key=${process.env.API_KEY}`
    const data = await makeRequest(url);

    if (!data || !Array.isArray(data)) return [];
    const def = data.map(x => x.text);

    return limit ? def.slice(0, limit) : def;
}

/**
 * Returns a list of synonyms
 * @param {string} input 
 * @param {number} limit 
 * 
 * @returns {(String[])} or empty []
 */
const getSynonym = async (input, limit = false) => {
    let data = await getRelatedWords(input);

    if (!data || !Array.isArray(data)) return [];
    data = data.find(x => x.relationshipType === 'synonym');

    if (!data) return [];
    return limit ? data.words.slice(0, limit) : data.words;
}

/**
 * Returns a list of antonyms
 * @param {string} input 
 * @param {number} limit 
 * 
 * @returns {(String[])} or empty []
 */
const getAntonym = async (input, limit = false) => {
    let data = await getRelatedWords(input);

    if (!data || !Array.isArray(data)) return [];
    data = data.find(x => x.relationshipType === 'antonym');

    if (!data) return [];
    return limit ? data.words.slice(0, limit) : data.words;
}

const getRelatedWords = async (input) => {
    const url = `${process.env.API_HOST}/word/${input}/relatedWords?api_key=${process.env.API_KEY}`
    return await makeRequest(url);
}

/**
 * Returns a list of examples
 * @param {string} input 
 * @param {number} limit 
 * 
 * @returns {String[]} or empty []
 */
const getExamples = async (input, limit = false) => {
    const url = `${process.env.API_HOST}/word/${input}/examples?api_key=${process.env.API_KEY}`
    const data = await makeRequest(url);

    if (!data || !data.examples) return [];

    const exs = data.examples.map(x => x.text)
    return limit ? exs.slice(0, limit) : exs;
}

/**
 * Returns a random word
 * @param {string} input 
 * @param {number} limit 
 * 
 * @returns {(string)} 
 */
const getRandomWord = async () => {
    const url = `${process.env.API_HOST}/words/randomWord?api_key=${process.env.API_KEY}`
    const data = await makeRequest(url);
    // logger.printRandomWord(data.word);
    return data.word
}

const getAllData = async (input) => {
    if (!input) {
        input = await getRandomWord();
    }

    return await Promise.all([
        getDefinition(input),
        getSynonym(input),
        getAntonym(input),
        getExamples(input),
        input
    ]);
}

/**
 * 
 * HTTP Request handler
 */
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

const question1 = (rl) => {
    return new Promise((resolve) => {
        rl.question('Guess the word..... ', (answer) => {
            resolve(answer);
        })
    })
}

const question2 = (rl) => {
    return new Promise((resolve, reject) => {
        let q = `
        You are wrong.
        What would you like to do
        1 - Try again
        2 - Hint
        3 - Quit\n`
        rl.question(q, (answer) => {
            resolve(answer)
        })
    })
}

/**
 * 'play' functionality implementation
 */
const startPlay = (r1) => {
    return new Promise(async (resolve, reject) => {
        let expectedAnswers = [];
        let [definitions, synonyms, antonyms, examples, originalWord] = await getAllData();

        //Any synonyms of the word should be also be accepted as a correct answer.
        expectedAnswers = [...synonyms]
        expectedAnswers.push(originalWord);

        if (definitions.length) {
            logger.printDefinition(definitions[0]);
        }
        if (synonyms.length) {
            logger.printSynonyms(synonyms[0]);
        }
        if (antonyms.length) {
            logger.printAntonyms(antonyms[0]);
        }
        let userAnswer = await question1(r1);

        //The above displayed synonym should not be accepted a correct answer
        expectedAnswers.splice(expectedAnswers.indexOf(synonyms[0]), 1);
        if (verifyAnswer(userAnswer, expectedAnswers)) {
            return resolve();
        }

        await startInteraction(r1, originalWord, expectedAnswers, definitions, synonyms, antonyms, examples);
        resolve();
    })
}

const verifyAnswer = (input, expectedAnswers) => {
    if (expectedAnswers.indexOf(input) != -1) {
        console.log('Yayy!!!!! You are correct');
        return true;
    }
    return false;
}

/**
 * 
 * @returns {Object} An object with property hint and category
 */
const showHint = (word, definitions, synonyms, antonyms) => {
    let hintArr = [HINT.jumble, HINT.definition, HINT.synonym, HINT.antonym];
    /**
     * Need to generate a hint number as per the data. Ex if antonyms is empty 
     * then we cant display the hint as an antonym
     */

    if (definitions.length == 0) {
        hintArr.splice(hintArr.indexOf(HINT.definition), 1);
    }
    if (synonyms.length == 0) {
        hintArr.splice(hintArr.indexOf(HINT.synonyms), 1);
    }
    if (antonyms.length == 0) {
        hintArr.splice(hintArr.indexOf(HINT.antonyms), 1);
    }
    let rNumber = hintArr[Math.floor(Math.random() * hintArr.length)];
    let hintObject = {
        hint: null,
        category: null,
    };

    switch (rNumber) {
        case HINT.jumble:
            hintObject.hint = shuffleWord(word);
            hintObject.category = "Jumbled"
            break;
        case HINT.definition:
            hintObject.hint = definitions[Math.floor(Math.random() * definitions.length)];
            hintObject.category = "Definition"
            break;
        case HINT.synonym:
            hintObject.hint = synonyms[Math.floor(Math.random() * synonyms.length)];
            hintObject.category = "Synonym"
            break;
        case HINT.antonym:
            hintObject.hint = antonyms[Math.floor(Math.random() * antonyms.length)];
            hintObject.category = "Antonym"
            break;
    }

    return hintObject;
}

/**
 * A recursive function to interact w.r.t user's input
 */
const startInteraction = async (r1, originalWord, expectedAnswers, definitions, synonyms, antonyms, examples) => {
    let userAnswer = await question2(r1);
    if (userAnswer == 1) {
        userAnswer = await question1(r1);
        if (verifyAnswer(userAnswer, expectedAnswers)) {
            return true;
        }
    } else if (userAnswer == 2) {
        let hintObject = showHint(originalWord, definitions, synonyms, antonyms);
        console.log(`HINT is ....  ${hintObject.category} : ${hintObject.hint}`);
        userAnswer = await question1(r1);

        if (hintObject.category == 'Synonym' && expectedAnswers.indexOf(hintObject.hint) != -1) {
            //If the above displayed hint is a synonym, remove it from @expectedAnswers
            expectedAnswers.splice(expectedAnswers.indexOf(hintObject.hint), 1);
        }

        if (verifyAnswer(userAnswer, expectedAnswers)) {
            return true;
        }
    } else if (userAnswer == 3) {
        console.log("Lets quit!!");
        console.log("The correct answer is ", originalWord);
        logger.printDefinition(definitions);
        logger.printSynonyms(synonyms);
        logger.printAntonyms(antonyms);
        logger.printExamples(examples);
        return true;
    }
    return startInteraction(r1, originalWord, expectedAnswers, definitions, synonyms, antonyms, examples);
}

const shuffleWord = (word) => {
    let arr = word.split('');
    return arr.map(a => [Math.random(), a])
        .sort((a, b) => a[0] - b[0])
        .map(a => a[1])
        .join('');
}

module.exports = {
    getCommand,
    getDefinition,
    getSynonym,
    getAntonym,
    getExamples,
    getAllData,
    startPlay
}