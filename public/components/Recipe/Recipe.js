class Recipe {
    constructor(id) {
        this.id = id;
        this.recipe = {};
        this.fetchRecipe();

    }


    fetchRecipe() {
        fetch(`${window.location.protocol}//${window.location.host}/api/recipe/${this.id}`)
            .then(recipe => recipe.json())
            .then(recipe => {
                console.log(recipe);
                this.recipe = recipe;
                this.render();
                this.renderInstructions();
                this.renderIngredients();
            })
    }

    renderInstructions() {
        //<li class="list-group-item">Stek baconen</li>
        this.recipe.instructions.forEach(i => {
            $('.render-instructions')
                .append(`<li class="list-group-item">${i}</li>`)
        })
    }

    renderIngredients() {
        //<li class="list-group-item">Pasta</li>
        this.recipe.livsmedel.forEach(i => {
            $('.render-ingredients')
                .append(`<li class="list-group-item"> ${i.volume} ${i.unit} ${i.livsmedelId.Namn}</li>`)
        })
    }

    render() {
        console.log(this.id);
        return $('main').html(this.template());
    }
}