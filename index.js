const readline = require('readline');
const util = require('util');
const dotenv = require('dotenv');
dotenv.config();

const dictService = require('./services/dict');
const logger = require('./lib/logger');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: './dict '
});

rl.prompt();
// console.log(process.env.API_HOST)

rl.on('line', async (line) => {
    let object = dictService.getCommand(line)
    switch (object.command.trim()) {
        case '':
            let [definitions, synonyms, antonyms, examples] = await dictService.getAllData(object.word);
            logger.printDefinition(definitions);
            logger.printSynonyms(synonyms);
            logger.printAntonyms(antonyms);
            logger.printExamples(examples);
            break;
        case 'defn':
            let def = await dictService.getDefinition(object.word);
            logger.printDefinition(def);
            break;
        case 'syn':
            let syn = await dictService.getSynonym(object.word);
            logger.printSynonyms(syn)
            break;
        case 'ant':
            let ant = await dictService.getAntonym(object.word);
            logger.printAntonyms(ant)
            break;
        case 'ex':
            let ex = await dictService.getExamples(object.word);
            logger.printExamples(ex);
            break;
        case 'play':
            console.log('Here we go!\n');
            await dictService.startPlay(rl);
            break;
        default:
            console.log(`Say what? I might have heard '${line.trim()}'`);
            break;
    }
    rl.prompt();
}).on('close', () => {
    console.log('\nBye! See you soon.....');
    process.exit(0);
});