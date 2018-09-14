class AllRecipes {
  constructor() {
    this.render();
  }

  render() {
    return $('main').html(this.template());
  }
}