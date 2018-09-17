class CreateRecipe {
  constructor() {
    this.render();
    this.instructionId = 1; // To have an ID to increment
    this.currentStep = 1;
    this.instructions = [];
    this.ingrediens = [];
    this.formData = {
      ingrediens: [],
      instructions: []
    };
    this.addIngrediensControllersHandler();
    this.renderAddedIngrediens();
    this.delayTimer;
  }

  saveInstructionChange(el) {
    const parent = el.parent();
    const id = parent.data('id');
    const textValue = parent.find('textarea').val();

    // Find the instruction in our array and change its value
    const foundIndex = this.formData.instructions.findIndex(i => i.id == id);

    // Change the value
    this.formData.instructions[foundIndex].text = textValue;

    // Re-render the list
    this.renderInstructions();
  }

  editInstruction(el) {
    const parent = el.parent();
    const id = parent.data('id');
    const value = parent
      .children()
      .remove()
      .end()
      .text()
      .trim();
    parent.empty();
    parent.append(
      `<textarea data-id="${id}" class="instruction-edit-field form-control">${value}</textarea>
      <button type="button" class="save-btn"><i class="fas fa-check"></i></button>`
    );
  }

  renderInstructions() {
    $('.added-instructions ul').empty();
    this.formData.instructions.forEach(i => {
      $('.added-instructions ul').append(
        this.instructionListItem(i.text, i.id, i.step)
      );
    });
  }

  addInstruction(el) {
    const text = el
      .parent()
      .find('textarea')
      .val();

    const instructionStep = this.formData.instructions.length + 1;

    this.formData.instructions.push({
      id: this.instructionId,
      text: text,
      step: instructionStep
    });

    this.renderInstructions();

    this.instructionId++;

    // The current instruction number on the page
    $('.current-step').empty();

    this.currentStep++;

    $('.current-step').text(this.currentStep);
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

  removeImage() {
    $('.file-input-wrapper img').remove();
    $('.file-input-wrapper > div').show();
    $('.remove-image-btn').hide();
  }

  previewImageOnSelect(e) {
    /**
     * Preview the selected image
     */

    if (e.target.files && e.target.files[0]) {
      // If there is a file selected
      const reader = new FileReader();

      reader.onload = e => {
        $('.file-input-wrapper img').remove();
        $('.file-input-wrapper > div').hide();
        $('.file-input-wrapper').append(
          `<img src="${e.target.result}" class="preview-image" alt="Din bild">`
        );
      };

      reader.readAsDataURL(e.target.files[0]);

      // Show the trash button
      $('.file-input-wrapper')
        .parent()
        .find('button')
        .show();
    }
  }

  addEventListeners() {
    let that = this;
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

    // Add instruction button
    $(document).on('click', 'button.add-instruction-btn', function() {
      that.addInstruction($(this));
    });

    // Remove image for reselection
    $(document).on('click', '.remove-image-btn', e => this.removeImage());

    // Edit instruction button click handler
    $(document).on('click', '.edit-instruction-btn', function() {
      that.editInstruction($(this));
    });

    // Save change instruction button click handler
    $(document).on('click', '.save-btn', function() {
      that.saveInstructionChange($(this));
    });
  }

  renderAddedIngrediens() {
    $('.ingrediens-list ul').empty();
    if (this.formData.ingrediens.length > 0) {
      this.formData.ingrediens.forEach(item => {
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
    const foundIndex = this.formData.ingrediens.findIndex(
      item => item.id === id
    );

    if (
      this.formData.ingrediens[foundIndex] &&
      this.formData.ingrediens[foundIndex].quantity >= 1
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

      const foundIndex = that.formData.ingrediens.findIndex(
        item => item.id === id
      );

      if (that.formData.ingrediens[foundIndex]) {
        that.formData.ingrediens[foundIndex].quantity++;
      } else {
        that.formData.ingrediens.unshift({ name, id, quantity: 1 });
      }

      console.log(that.formData.ingrediens);
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
      const foundIndex = that.formData.ingrediens.findIndex(i => i.id === id);

      console.log(foundIndex);

      /**
       * If quantity is 1 then remove the item on decrement
       * else just decrement the quantity property
       */
      if (that.formData.ingrediens[foundIndex].quantity === 1) {
        that.formData.ingrediens.splice(foundIndex, 1);
      } else {
        that.formData.ingrediens[foundIndex].quantity--;
      }
      that.renderAddedIngrediens(); // Re-render the list
      that.renderMinusButton(id);
    });

    $(document).on('click', '.quantity-control-button.trash', function() {
      // Remove item from list when trash is clicked
      const el = $(this)
        .parent()
        .parent();

      const id = el.data('id');

      that.formData.ingrediens = that.formData.ingrediens.filter(
        item => item.id !== id
      );

      that.renderAddedIngrediens();
      that.renderMinusButton(id);
    });
  }

  render() {
    $('main').html(this.template());
    // this.renderIngrediensSearchResult();
    this.addEventListeners();
  }
}
