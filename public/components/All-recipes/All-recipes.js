class AllRecipes {
  constructor() {
    this.render();
    this.addEventListeners();
    this.fetchRecipes();
    this.recipes = [];
    this.filteredRecipes = [];
    this.selectedCategories = [];
  }

  fetchRecipes() {
    fetch(
      `${window.location.protocol}//${window.location.host}/api/all-recipes`
    )
      .then(result => result.json())
      .then(result => {
        this.recipes = [...result];
        this.filteredRecipes = this.recipes;
        this.renderRecipes();
      });
  }

  renderRecipes() {
    $('.spinner').remove();
    $('.card-holder').empty();
    this.filteredRecipes.forEach(recipe => {
      // recipe.instructions.forEach(i => (instructions += `<li>${i}</li>`));
      let description = recipe.description;
      if (description.length > 50) {
        description = description.slice(0, 49) + '...';
      }
      $('.card-holder').append(
        this.recipeCard(recipe.title, description, recipe.imgPath, recipe._id)
      );
    });
  }

  toggleCategory(el) {
    // If checked then add to categories array else remove it
    if (el.is(':checked')) {
      this.selectedCategories.push(el.val());
    } else {
      // If not checked, then filter it out from the array
      this.selectedCategories = this.selectedCategories.filter(
        category => category !== el.val()
      );
    }
    this.filter();
  }

  filter() {
    if (this.selectedCategories.length > 0) {
      this.filteredRecipes = this.recipes.filter(recipe =>
        this.selectedCategories.some(val => recipe.categories.indexOf(val) >= 0)
      );
    } else {
      this.filteredRecipes = this.recipes;
    }

    this.renderRecipes();
  }

  addEventListeners() {
    let that = this;
    $(document).off('click', '.filter-btn');
    $(document).on('click', '.filter-btn', e => {
      e.stopPropagation();
      $('.side-holder').toggleClass('opened');
    });

    $(document).on('click', () => {
      $('.side-holder').removeClass('opened');
    });

    $(document).on('click', '.side-holder', e => e.stopPropagation());

    $(document).on('click', '.category-filter', function (e) {
      if (e.target === e.currentTarget) {
        const checkbox = $(this).find('input.form-check-input');
        const isChecked = checkbox.is(':checked');
        checkbox.prop('checked', !isChecked).trigger('change');
      }
    });

    $(document).on('change', '.category-filter .form-check-input', function () {
      that.toggleCategory($(this));
    });
  }

  render() {
    return $('main').html(this.template());
  }
}
