class Homepage {
  constructor() {
    this.render();
    this.addEventListener();
  }

  render() {
    return $('main').html(this.template());
  }

  fetchData(query) {
    fetch(`http://localhost:3000/api/all-recipes/${query}`)
      .then(response => response.json())
      .then(response => console.log(response));
  }

  addEventListener() {
    $(document).on('input', '.search-field', (e) => {
      this.fetchData(e.target.value);
    })
  }
}
