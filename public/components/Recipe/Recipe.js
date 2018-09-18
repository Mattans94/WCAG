class Recipe {
    constructor(id) {
        this.id = id;
        this.render();
    }

    render() {
        console.log(this.id);
        return $('main').html(this.template());
    }
}