

const fetch = require('node-fetch');
const logger = require('../lib/logger');
const COMMANDS = ['defn', 'syn', 'ant', 'ex', 'play'];
const HINT = {
    jumble: 1,
    definition: 2,
    synonym: 3,
    antonym: 4
}

const getCommand = (input) => {
    let [command, word] = input.split(' ');
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

const getDefinition = async (input, limit = false) => {
    const url = `${process.env.API_HOST}/word/${input}/definitions?api_key=${process.env.API_KEY}`
    const data = await makeRequest(url);
    
    if (!data || !Array.isArray(data)) return [];
    const def = data.map(x => x.text);

    return limit ? def.slice(0, limit) : def;
}

const getSynonym = async (input, limit = false) => {
    let data = await getRelatedWords(input);
  
    if (!data || !Array.isArray(data)) return [];
    data = data.find(x => x.relationshipType === 'synonym');

    if (!data) return [];
    return limit ? data.words.slice(0, limit) : data.words;
}

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

const getExamples = async (input, limit = false) => {
    const url = `${process.env.API_HOST}/word/${input}/examples?api_key=${process.env.API_KEY}`
    const data = await makeRequest(url);

    if (!data || !data.examples) return [];

    const exs = data.examples.map(x => x.text)
    return limit ? exs.slice(0, limit) : exs;
}

const getRandomWord = async () => {
    const url = `${process.env.API_HOST}/words/randomWord?api_key=${process.env.API_KEY}`
    const data = await makeRequest(url);
    logger.printRandomWord(data.word);
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

const startPlay = (r1) => {
    return new Promise(async (resolve, reject) => {
        let answer = await getRandomWord();
        let [definitions, synonyms, antonyms, examples] = await getAllData(answer);

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
        if (verifyAnswer(userAnswer, answer)) {
            return resolve();
        }

        let iResult = await startInteraction(r1, answer, definitions, synonyms, antonyms);
        console.log("iResult ", iResult)
        resolve();
    })
}

const verifyAnswer = (input, answer) => {
    if (input == answer) {
        console.log('Yayy!!!!! You are correct');
        return true;
    }
    return false;
}

const showHint = (word, definitions, synonyms, antonyms) => {
    let rNumber = Math.floor(Math.random() * 4) + 1;
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

const startInteraction = async (r1, answer, definitions, synonyms, antonyms) => {
    let userAnswer = await question2(r1);
    if (userAnswer == 1) {
        userAnswer = await question1(r1);
        if (verifyAnswer(userAnswer, answer)) {
            return true;
        }
    } else if (userAnswer == 2) {
        let hintObject = showHint(answer, definitions, synonyms, antonyms);
        console.log(`HINT is ....  ${hintObject.category} : ${hintObject.hint}`);
        userAnswer = await question1(r1);
        if (verifyAnswer(userAnswer, answer)) {
            return true;
        }
    } else if (userAnswer == 3) {
        console.log("Lets quit!!");
        console.log("The correct answer is ", answer);
        logger.printDefinition(definitions);
        logger.printSynonyms(synonyms);
        logger.printAntonyms(antonyms);
        logger.printExamples(examples);
        return true;
    }
    startInteraction(r1, answer, definitions, synonyms, antonyms);
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