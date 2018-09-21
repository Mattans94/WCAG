class AllRecipes {
  constructor() {
    this.render();
    this.addEventListeners();
    this.fetchRecipes();
    this.recipes = [];
  }

  fetchRecipes() {
    fetch(
      `${window.location.protocol}//${window.location.host}/api/all-recipes`
    )
      .then(result => result.json())
      .then(result => {
        this.recipes = [...result];
        console.log(this.recipes);
        this.renderRecipes();
      });
  }

  renderRecipes() {
    $('.spinner').remove();
    this.recipes.forEach(recipe => {
      let instructions = '';
      recipe.instructions.forEach(i => (instructions += `<li>${i}</li>`));
      $('.card-holder').append(
        this.recipeCard(recipe.title, instructions, recipe.imgPath)
      );
    });
  }

  addEventListeners() {
    $(document).off('click', '.filter-btn');
    $(document).on('click', '.filter-btn', e => {
      e.stopPropagation();
      $('.side-holder').toggleClass('opened');
    });

    $(document).on('click', () => {
      $('.side-holder').removeClass('opened');
    });

    $(document).on('click', '.side-holder', e => e.stopPropagation());

  }

  render() {
    return $('main').html(this.template());
  }
}
