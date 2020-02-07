const readline = require('readline');
const util = require('util');
const dotenv = require('dotenv');
dotenv.config();

const dictService = require('./services/dict');

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
            await dictService.getAllData(object.word);
            break;
        case 'defn':
            await dictService.getDefinition(object.word)
            break;
        case 'syn':
            await dictService.getSynonym(object.word)
            break;
        case 'ant':
            await dictService.getAntonym(object.word)
            break;
        case 'ex':
            await dictService.getExamples(object.word)
            break;
        case 'play':
            console.log('play to do!');
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