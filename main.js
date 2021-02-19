const prompt = require('prompt-sync')({sigint: true});

const hat = '^';
const hole = 'O';
const fieldCharacter = '░';
const pathCharacter = '*';

class Field {
    constructor(field) {
        this.field = field;
        [this.playerRow, this.playerCol] = this.findPlayerPos();
        this.inProgress = true;
        this.result = 'none';
    }

    print() {
        this.field.forEach(row => {
            console.log(row.join('  '));
        });
    }

    static generateField(h , w, holePercent) {
        if (holePercent > 1) {
            holePercent /= 100;
        }
        const fieldArr = [];
        for (let i = 0; i < h; i++) {
            const fieldRow = [];
            for (let j = 0; j < w; j++) {

                fieldRow.push(Math.random() > holePercent ? fieldCharacter : hole);
            }
            fieldArr.push(fieldRow);
        }
        //get random coords to generate hat
        const hatRow = Math.floor(Math.random() * h);
        const hatColumn = Math.floor(Math.random() * w);
        fieldArr[hatRow][hatColumn] = hat;
        //generate initial player pos
        let playerRow, playerColumn;
        do {
            playerRow = Math.floor(Math.random() * h);
            playerColumn = Math.floor(Math.random() * w);
        } while (fieldArr[playerRow][playerColumn] === hat);
        fieldArr[playerRow][playerColumn] = pathCharacter;
        return fieldArr;
    }

    findPlayerPos() {
        for (let i = 0; i < this.field.length; i++) {
            for (let j = 0; j < this.field[0].length; j++) {
                if (this.field[i][j] === pathCharacter) {
                    return [i, j];
                }
            }
        }
    }

    // main game function
    move(direction) {
        try {
            let expr = direction.toString()[0].toLowerCase();
            switch (expr) {
                case 'u':
                    this.playerRow -= 1;
                    break;
                case 'd':
                    this.playerRow += 1;
                    break;
                case 'l':
                    this.playerCol -= 1;
                    break;
                case 'r':
                    this.playerCol += 1;
                    break;
                default:
                    console.log('Invalid input! Accepted values are: u / r / d / l');
                    return;
            }
        } catch (e) {
            return;
        }
        //don't paint path player is outside map
        if (this.playerRow < 0 || this.playerCol < 0 || this.playerCol >= this.field.length || this.playerRow >= this.field[0].length) {
            this.inProgress = false;
            this.result = 'fell';
            return;
        }
        //don't paint if player found hat or fell into hole
        if (this.field[this.playerRow][this.playerCol] === hat) {
            this.inProgress = false;
            this.result = 'hat';
            return;
        }
        if (this.field[this.playerRow][this.playerCol] === hole) {
            this.inProgress = false;
            this.result = 'hole';
            return;
        }
        this.field[this.playerRow][this.playerCol] = pathCharacter;
    }

    // depending of mode it makes game harder after every move
    addHole(mode) {
        // default for easy - do not add any holes
        let threshold = 1;
        mode = mode.toLowerCase();
        switch (mode) {
            case 'medium':
                threshold = 0.94;
                break;
            case 'hard':
                threshold = 0.88;
                break;
            default:
                break;
        }
        let rand;
        for (let i = 0; i < this.field.length; i++) {
            for (let j = 0; j < this.field[0].length; j++) {
                rand = Math.random()
                if (this.field[i][j] === fieldCharacter && rand > threshold) {
                    return this.field[i][j] = hole;
                }
            }
        }
    }
}

//set field width and height
let width = parseInt(prompt('Enter field width: '));
let height = parseInt(prompt('Enter field height: '));
let holePercent = parseFloat(prompt('Enter hole percent: '));

//if input is wrong, use default inputs
if (isNaN(width) || isNaN(height) || isNaN(holePercent)) {
    console.log('Invalid input! Using default dimensions. [5x5 with 50%]');
    width = 5;
    height = 5;
    holePercent = 50.0;
}

const acceptedDifficulties = ['easy', 'medium', 'hard'];
let difficulty = prompt('Enter difficulty: [easy/medium/hard]: ').toLowerCase();
if (!acceptedDifficulties.includes(difficulty)) {
    console.log('Invalid difficulty! Setting mode to easy.');
    difficulty = 'easy';
}

//generate field
const field = new Field(Field.generateField(height, width, holePercent));
field.print();

//start game loop
let dir;
do {
    dir = prompt('Which way? ');
    field.move(dir);
    field.addHole(difficulty);
    field.print();
} while (field.inProgress);

let endMsg;
switch (field.result) {
    case 'fell':
        endMsg = 'You fell outside map! Game over!';
        break;
    case 'hole':
        endMsg = 'You fell into hole! Game over!';
        break;
    case 'hat':
        endMsg = 'You found hat! Congratulations!';
        break;
    default:
        break;
}
console.log(endMsg);