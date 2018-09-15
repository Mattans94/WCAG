class Homepage {
  constructor() {
    this.render();
  }

  render() {
    return $('main').html(this.template());
  }
}
