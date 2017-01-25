/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeRandomWord() {
    var letters = 'abcdefghijklmnopqrstuvwxyz'.split('')
    var word = '';
    var wordSize = getRandomInt(3,5);
    for (var i=0; i<wordSize; i++) {
        var randIndex = getRandomInt(0, letters.length-1);
        word += letters[randIndex];
    }
    return word;
}

function isPrime(num) {
    var divider = 2;
    var limit = Math.sqrt(num);
    var isPrimeNum = true;
    //console.log('Checking: ', num);
    while (isPrimeNum && divider <= limit){

        // if the num is devided by the current divider - it is not a prime
        if (num % divider === 0) {
            //console.log('Not a Prime! found devider:', divider);
            isPrimeNum = false;
        } else {
            divider++;
        }
    }
    return isPrimeNum;
}

function groupBy(objs, prop) {
    var propToObjsMap = objs.reduce(function(accumulator, obj){
        if (accumulator[obj[prop]] === undefined) {
            accumulator[obj[prop]] = [obj];
        } else {
            accumulator[obj[prop]].push(obj);
        }
        return accumulator;
    }, {});

    return propToObjsMap; 
}


function sumMat(mat) {
    return mat.reduce(function(acc, row){
        var sumRow = row.reduce(function(acc, num) {
            return acc + num;
        }, 0);
        return acc + sumRow;
    }, 0);
}


function saveToStorage(key, value) {
    localStorage[key]= JSON.stringify(value);
}
function getFromStorage(key) {
    return JSON.parse(localStorage[key]);
}

function printMat(mat, elSelector) {
    var strHtml = '';

    mat.forEach(function(cells){
        strHtml += '<tr>';
        cells.forEach(function(cell){
            strHtml += '<td>' + cell +  '</td>';
        });
        strHtml += '</tr>';
    });

    var elMat = document.querySelector(elSelector);
    elMat.innerHTML = strHtml;
}






