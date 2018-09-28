class Recipe {
  constructor(id) {
    this.id = id;
    this.recipe = {};
    this.fetchRecipe();
    this.arrowss();
    this.nutritions = [
      {
        name: 'Energi (kcal)',
        short: 'Ener',
        value: 0
      },
      {
        name: 'Kolhydrater',
        short: 'Kolh',
        value: 0
      },
      {
        name: 'Protein',
        short: 'Prot',
        value: 0
      },
      {
        name: 'Mättat fett',
        short: 'Mfet',
        value: 0
      },
      {
        name: 'Enkelomättat fett',
        short: 'Mone',
        value: 0
      },
      {
        name: 'Fleromättat fett',
        short: 'Pole',
        value: 0
      },
      {
        name: 'Salt',
        short: 'NaCl',
        value: 0
      },
      {
        name: 'Vitamin A',
        short: 'VitA',
        value: 0
      },
      {
        name: 'Vitamin D',
        short: 'VitD',
        value: 0
      },
      {
        name: 'Vitamin E',
        short: 'VitE',
        value: 0
      },
      {
        name: 'Vitamin C',
        short: 'VitC',
        value: 0
      },
      {
        name: 'Vitamin B12',
        short: 'VitB12',
        value: 0
      },
      {
        name: 'Vitmain B6',
        short: 'VitB6',
        value: 0
      }
    ];
  }

  fetchRecipe() {
    fetch(
      `${window.location.protocol}//${window.location.host}/api/recipe/${
      this.id
      }`
    )
      .then(recipe => recipe.json())
      .then(recipe => {
        console.log('recipe', recipe);
        this.recipe = recipe;
        this.render();
        this.renderInstructions();
        this.renderIngredients();
        this.renderNutritionVals();
        this.addEventListeners();
      });
  }

  calcNutritionVals() {
    return new Promise((resolve, reject) => {
      // let varde = parseFloat(
      // 	val.livsmedelId.Naringsvarden[0].Varde.replace(',', '.')
      // );

      this.recipe.livsmedel.forEach(l => {
        let inGram = l.unit === 'g' ? l.volume : l.inGram;
        let finalVal =
          (inGram / this.recipe.portions) * parseInt($('.custom-select').val());
        console.log('Final val', finalVal);
        l.livsmedelId.Naringsvarden.forEach(n => {
          this.nutritions.forEach((nutrition, index, arr) => {
            if (nutrition && n.Forkortning === nutrition.short) {
              let value =
                (parseFloat(n.Varde.replace(',', '.')) / 100) * finalVal;
              arr[index].value = value;
              arr[index].unit = n.Enhet;
              return;
            }
          });
        });
      });

      console.log(this);
      // console.log(this.recipe.livsmedel);

      // Resolve the promise!
      resolve();
    });
  }

  renderNutritionVals() {
    $('collapseNaringsvarde ul').empty();
    this.calcNutritionVals().then(() => {
      $('#collapseNaringsvarde ul').empty();
      this.nutritions.forEach(n => {
        $('#collapseNaringsvarde ul').append(
          this.nutritionListItem(n.name, parseFloat(n.value).toFixed(2), n.unit)
        );
      });
    });
  }

  renderInstructions() {
    //<li class="list-group-item">Stek baconen</li>
    this.recipe.instructions.forEach(i => {
      $('.render-instructions').append(`<li class="list-group-item"><strong>*  </strong>${i}</li>`);
    });
  }

  renderIngredients() {
    $('.render-ingredients').empty();
    const selectedPortions = parseInt($('.custom-select').val());
    console.log(selectedPortions);

    //<li class="list-group-item">Pasta</li>
    this.recipe.livsmedel.forEach(i => {
      let volume = (i.volume / this.recipe.portions) * selectedPortions;

      volume = new Fraction((volume * 100) / 100).toFraction(true);

      $('.render-ingredients').append(
        `<li class="list-group-item"> <span class="word-space">${volume} ${i.unit}</span> ${
        i.livsmedelId.Namn
        }</li>`
      );
    });
  }

  addEventListeners() {
    $(document).on('change', '#inputGroupSelect01', e => {
      this.renderIngredients();
      this.renderNutritionVals();
    });
  }

  render() {
    console.log(this.id);
    return $('main').html(this.template());
  }

  arrowss() {
    if (Recipe.arrowsEventsSet) {
      return;
    }
    $(document).on('click', '#arrow, #arrow2, #arrow3', function () {
      let $child = $(this).children('i');
      $child.toggleClass('fa-sort-down mt-2').toggleClass('fa-sort-up');
    });
    Recipe.arrowsEventsSet = true;
  }
}
