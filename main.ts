export interface Spell {
    id: number;
    type: string;
    ingredients: Array<number>;
    castable: number;
    repeatable: number;
    tomeId: number;
    taxCount: number;
}

let listOfRecipe: Array<{
    id: number,
    type: string,
    ingredients: Array<number>;
    price: number,
    }> = [];
let inventory: Array<number> = [];
let listOfSpell: Array<Spell> = [];
let attemptedSpells: Array<{
    id: number,
    type: string,
    ingredients: Array<number>;
    castable: number,
    repeatable: number,
    tomeId: number,
    taxCount: number,
}> = [];

function checkSpaceInInventory(spellIngredients: Array<number>): boolean {
    const inv = inventory[0] + inventory[1] + inventory[2] + inventory[3];
    const ingr = spellIngredients[0] + spellIngredients[1] + spellIngredients[2] + spellIngredients[3];
    if (inv + ingr > 10) {
        return false;
    } else {
        return true;
    }
}

function enoughIngredientsToCast(spellIngredients: Array<number>): number {
    if (inventory[0] + spellIngredients[0] < 0) {
        return 0;
    } else if (inventory[1] + spellIngredients[1] < 0) {
        return 1;
    } else if (inventory[2] + spellIngredients[2] < 0) {
        return 2;
    } else if (inventory[3] + spellIngredients[3] < 0) {
        return 3;
    } else {
        return 4;
    }
}

function findBestSpell(neededIngredient) {
    const castableSpell = listOfSpell.filter(x => x.type === 'CAST' && checkSpaceInInventory(x.ingredients) && !attemptedSpells.find(y => y.id === x.id));
    const spell = castableSpell.filter(o => o.ingredients[neededIngredient] == Math.max.apply(Math, castableSpell.map(o => o.ingredients[neededIngredient]))).find(y => y.castable);
    if (spell) {
        const recursiveIngredient = enoughIngredientsToCast(spell.ingredients);
        if (recursiveIngredient !== 4) {
            attemptedSpells.push(spell);
            return findBestSpell(recursiveIngredient);
        } else {
            attemptedSpells = [];
            return spell;
        }
    }
    
}

function getIngredient(neededIngredient, amountNeeded) {
    let bestSpell = findBestSpell(neededIngredient);
    if (bestSpell && !bestSpell.castable) {
        console.log('REST');
    }
    else if (bestSpell && bestSpell.repeatable) {
        console.log('CAST ' + bestSpell.id + ' ' + 1);
    } else if (bestSpell && !bestSpell.repeatable) {
        console.log('CAST ' + bestSpell.id);

    } else if (!bestSpell) {
        console.log('REST');
    }
}

function getInventory() {
    for (let i = 0; i < 2; i++) {
        var inputs: string[] = readline().split(' ');
        const inv0: number = parseInt(inputs[0]); // tier-0 ingredients in inventory
        const inv1: number = parseInt(inputs[1]);
        const inv2: number = parseInt(inputs[2]);
        const inv3: number = parseInt(inputs[3]);
        const score: number = parseInt(inputs[4]); // amount of rupees
        if (i === 0) {
            inventory = [inv0, inv1, inv2, inv3];
        }
    }
}

function findBestRecipe() {
    let bestRecipe: any;
    let distance: number = 0;
    listOfRecipe.map(recipe => {
        if (recipe.ingredients[0] + recipe.ingredients[1] * 2 + recipe.ingredients[2] * 3 + recipe.ingredients[3] * 4 < distance) {
            bestRecipe = recipe;
        }
    })
    return bestRecipe;
}

function getInfos(actionCount: number) {
    for (let i = 0; i < actionCount; i++) {
        const inputs: string[] = readline().split(' ');
        const tomeIndex: number = parseInt(inputs[7]); // in the first two leagues: always 0; later: the index in the tome if this is a tome spell, equal to the read-ahead tax
        const taxCount: number = parseInt(inputs[8]); // in the first two leagues: always 0; later: the amount of taxed tier-0 ingredients you gain from learning this spell
        const repeatable: number = parseInt(inputs[10]); // for the first two leagues: always 0; later: 1 if this is a repeatable player spell
        if (inputs[1] === 'BREW') {
            listOfRecipe.push({
                id: parseInt(inputs[0]),
                type: inputs[1],
                ingredients: [parseInt(inputs[2]), parseInt(inputs[3]), parseInt(inputs[4]),parseInt(inputs[5])],
                price: parseInt(inputs[6]),
            });
        } else if (inputs[1] === 'CAST' || inputs[1] === 'LEARN') {
            listOfSpell.push({
                id: parseInt(inputs[0]),
                tomeId: tomeIndex,
                taxCount: taxCount,
                type: inputs[1],
                ingredients: [parseInt(inputs[2]), parseInt(inputs[3]), parseInt(inputs[4]),parseInt(inputs[5])],
                castable: parseInt(inputs[9]),
                repeatable: repeatable
            })
        }
    }
}

function learnSpell() {
    const learnableSpells = listOfSpell.filter(x => x.type === 'LEARN');
    let spellId = learnableSpells.find(x => Math.min(...x.ingredients) >= 0 && inventory[0] >= x.tomeId);
    console.log((spellId) ? 'LEARN ' + spellId.id : 'LEARN ' + learnableSpells[0].id);
}

while (true) {
    listOfRecipe = [];
    listOfSpell = [];
    inventory = [];
    const actionCount: number = parseInt(readline()); // the number of spells and recipes in play
    getInfos(actionCount);
    getInventory();
    if (listOfSpell.filter(x => x.type === 'CAST').length < 14) {
        learnSpell();
    } else {
        const bestRecipe = findBestRecipe();
        console.error(bestRecipe);
        const needIngredients = [inventory[0] + bestRecipe.ingredients[0], inventory[1] + bestRecipe.ingredients[1], inventory[2] + bestRecipe.ingredients[2], inventory[3] + bestRecipe.ingredients[3]];

        if (Math.min(...needIngredients) < 0) {
        const ingredient = needIngredients.findIndex(x => x === Math.min(...needIngredients));
        getIngredient(ingredient, Math.min(...needIngredients));
        } else {
            console.log('BREW ' + bestRecipe.id);
        }
    }
}
