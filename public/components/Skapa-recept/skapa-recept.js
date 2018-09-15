class CreateRecipe {
  constructor() {
    this.render();
    this.ingrediens = [];
    this.addIngrediensControllersHandler();
    this.renderAddedIngrediens();
    this.delayTimer;
  }

  fetchLivsmedel(query) {
    /**
     * Fetch the data from the DB
     * with the query.
     */

    // If query is empty, then return.
    if (!query.length) return;

    fetch(`http://localhost:3000/api/livsmedel/${query}`)
      .then(res => res.json())
      .then(res => this.renderIngrediensSearchResult(res));
  }

  previewImageOnSelect(e) {
    /**
     * Preview the selected image
     */

    if (e.target.files && e.target.files[0]) {
      // If there is a file selected
      const reader = new FileReader();

      reader.onload = e => {
        $('.file-input-wrapper > div').hide();
        $('.file-input-wrapper').append(
          `<img src="${e.target.result}" class="preview-image" alt="Din bild">`
        );
      };

      reader.readAsDataURL(e.target.files[0]);
    }
  }

  addEventListeners() {
    /**
     * If gram is chosen as unit then hide the "motsvarande section".
     * This methods adds the event listener to every select
     */
    $(document).on('change', '.motsvarande-select', function() {
      const val = $(this).val();

      if (val === 'g') {
        $('.motsvarande-wrapper').hide();
      } else {
        $('.motsvarande-wrapper').show();
      }
    });

    /**
     * Add change event listener for the file chooser
     */
    $(document).on('change', 'input[type="file"]', e =>
      this.previewImageOnSelect(e)
    );

    /**
     * Fetch data when change event
     * is fired on input field for livsmedel
     */

    $(document).on('input', 'input#ingredienser', e => {
      // Setting a delay so the DB's not getting overheated ;)
      clearTimeout(this.delayTimer);
      this.delayTimer = setTimeout(() => {
        // Get input value and send to fetchLivsmedel method
        if (!e.target.value.length) {
          // If input is empty then empty the list
          return $('.ingrediens-result ul').empty();
        }
        this.fetchLivsmedel(e.target.value);
      }, 500);
    });
  }

  renderAddedIngrediens() {
    $('.ingrediens-list ul').empty();
    if (this.ingrediens.length) {
      this.ingrediens.forEach(item => {
        $('.ingrediens-list ul').append(
          this.addedIngrediensItem(item.name, item.id, item.quantity)
        );
      });
    } else {
      $('.ingrediens-list ul').append(
        '<p class="text-center">Inga ingredienser tillagda</p>'
      );
    }

    // Activate popovers
    $(function() {
      $('[data-toggle="popover"]').popover();
    });
  }

  renderIngrediensSearchResult(data) {
    $('.ingrediens-result ul').empty();

    const dummyData = [
      { id: '2312ssf', name: 'Pasta' },
      { id: '231s123', name: 'Potatis' }
    ];

    data.forEach(item => {
      $('.ingrediens-result ul').append(
        this.ingrediensListItem(item.Namn, item._id)
      );
    });
  }

  renderMinusButton(id) {
    /**
     * Render minus button if quantity > 1
     */
    $(
      `.quantity-controllers-wrapper[data-id="${id}"] .quantity-control-button.minus`
    ).remove();
    const foundIndex = this.ingrediens.findIndex(item => item.id === id);

    if (
      this.ingrediens[foundIndex] &&
      this.ingrediens[foundIndex].quantity >= 1
    ) {
      $(
        `.quantity-controllers-wrapper[data-id="${id}"] .quantity-controllers`
      ).append(
        '<button type="button" class="quantity-control-button minus"><i class="fas fa-minus"></i></button>'
      );
    } else {
      $(
        `.quantity-controllers-wrapper[data-id="${id}"] .quantity-control-button.minus`
      ).remove();
    }
  }

  addIngrediensControllersHandler() {
    let that = this;
    $(document).on('click', '.quantity-control-button.plus', function() {
      /**
       * Handle the plus button
       */
      const el = $(this)
        .parent()
        .parent(); // The grandparent li-tag that contains info

      const id = el.data('id');

      const name = el.text().trim();

      /**
       * If item already exists, increment the quantity
       * else add it to the array
       */

      const foundIndex = that.ingrediens.findIndex(item => item.id === id);

      if (that.ingrediens[foundIndex]) {
        that.ingrediens[foundIndex].quantity++;
      } else {
        that.ingrediens.unshift({ name, id, quantity: 1 });
      }

      console.log(that.ingrediens);
      that.renderAddedIngrediens();
      that.renderMinusButton(id);
    });

    $(document).on('click', '.quantity-control-button.minus', function() {
      /**
       * Handle minus button
       */

      const el = $(this)
        .parent()
        .parent();

      const id = el.data('id');

      // Find id and decrement the quantity
      const foundIndex = that.ingrediens.findIndex(i => i.id === id);

      console.log(foundIndex);

      /**
       * If quantity is 1 then remove the item on decrement
       * else just decrement the quantity property
       */
      if (that.ingrediens[foundIndex].quantity === 1) {
        that.ingrediens.splice(foundIndex, 1);
      } else {
        that.ingrediens[foundIndex].quantity--;
      }
      that.renderAddedIngrediens(); // Re-render the list
      that.renderMinusButton(id);
    });
  }

  render() {
    $('main').html(this.template());
    // this.renderIngrediensSearchResult();
    this.addEventListeners();
  }
}
