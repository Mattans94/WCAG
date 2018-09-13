class Homepage {
  constructor() {
    this.render();
    this.onSearchChange();
    this.delayTimer;
  }

  onSearchChange() {
    $('.search-bar input').on('input', e => {
      clearTimeout(this.delayTimer);
      this.delayTimer = setTimeout(() => {
        $('.search-result').empty();
        this.search(e.target.value);
      }, 500);
    });
  }

  search(val) {
    if (!val.length) return;
    fetch(`http://localhost:3000/api/recept/${val}`)
      .then(res => res.json())
      .then(res => {
        res.forEach(l => {
          $('.search-result').append('<li>' + l.Namn + '</li>');
        });
      });
  }

  render() {
    return $('main').html(this.template());
  }
}
