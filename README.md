Command Line Dictionary Tool

Requirements

The command-line tool contains the following functions - 

1. Word Definitions

            ./dict defn <word>

Displays definitions of a given word.

2. Word Synonyms

            ./dict syn <word>

Displays synonyms of a given word. 

3. Word Antonyms

            ./dic ant <word>

Displays antonyms of a given word. Note that not all words would have Antonyms (End point: /relatedWords). Example words with antonyms: single, break, start.

4. Word Examples

            ./dict ex <word>

Displays examples of usage of a given word in a sentence. 

5. Word Full Dict

            ./dict <word>

Displays Word Definitions, Word Synonyms, Word Antonyms & Word Examples for a given word.

6. Word of the Day Full Dict

            ./dict

Displays Word Definitions, Word Synonyms, Word Antonyms & Word Examples for a random word.

7. Word Game

            ./dict play

The command displays a definition, a synonym or an antonym and ask the user to guess the word. 

Rules:

- If the correct word is entered, shows success message
- Any synonyms of the word(expected answer) is also accepted as a correct answer.
- If incorrect word is entered, user is given 3 choices:
    - (1) Try again
        Lets the user try again.
    - (2) Hint
        Displays a hint, and let the user try again. Hints could be:
            1. Display the word randomly jumbled (cat => atc, tac, tca)
            2. Display another definition of the word
            3. Display another antonym of the word
            4. Display another synonym of the word
    - (3) Quit

           Display the Word, Word Full Dict and quit.