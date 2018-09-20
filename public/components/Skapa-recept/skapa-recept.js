class CreateRecipe {
  constructor() {
    this.render();
    this.errors = false;
    this.instructionId = 1; // To have an ID to increment
    this.currentStep = 1; // To keep track of instruction step while adding
    this.formData = {
      title: '',
      ingrediens: [],
      instructions: [],
      categories: []
    };
    this.addIngrediensControllersHandler();
    this.renderAddedIngrediens();
    this.renderInstructions();
    this.delayTimer;
  }

  resetForm() {
    window.scroll(0, 0);
    $('.tillagt-alert').show();

    setTimeout(() => {
      // Hide the alert again after 4 seconds
      $('.tillagt-alert').hide();
    }, 4000);

    this.instructionId = 1;
    this.currentStep = 1;
    this.formData = {
      title: '',
      ingrediens: [],
      instructions: [],
      categories: []
    };
    // Re-render all fields
    this.renderAddedIngrediens();
    this.renderInstructions();

    // Empty search and title fields
    $('input#ingredienser')
      .val('')
      .trigger('input');
    $('.title-input').val('');

    // Remove the image
    this.removeImage();

    // Remove alerts
    $('.fields-error').hide();
    $('.noimage-error').hide();

    // Reset the current step
    $('.current-step').empty();
    $('.current-step').text(this.currentStep);

    // Uncheck all checkboxes
    $('input[type="checkbox"]:checked').attr('checked', false);

    // Activate confirmation buttons
    $('[data-toggle=confirmation]').confirmation({
      rootSelector: '[data-toggle=confirmation]'
      // other options
    });
  }

  validate() {
    /**
     * This method will just validate no formdata
     * is empty, then it will post the recipe if validated
     */

    const { title, ingrediens, instructions, categories } = this.formData;
    const file = document.querySelector('.input-wrapper input[type="file"]')
      .files[0];

    this.errors = false; // Start from false and set to true if error
    if (
      !(title && ingrediens.length && instructions.length && categories.length)
    ) {
      $('.fields-error').show();
      window.scroll(0, 0);
      this.errors = true;
    }

    //If no picture is selected
    if (!file) {
      $('.noimage-error').show();
      window.scroll(0, 0);
      this.errors = true;
    }

    !this.errors && this.postRecipe(); // No errors = post the recipe
  }

  toggleCategory(el) {
    // If checked then add to categories array else remove it
    if (el.is(':checked')) {
      this.formData.categories.push(el.val());
    } else {
      // If not checked, then filter it out from the array
      this.formData.categories = this.formData.categories.filter(
        c => c !== el.val()
      );
    }
    console.log(this.formData.categories);
  }

  deleteInstruction(el) {
    const id = el.parent().data('id');
    console.log(id);
    // Filter out the instruction with the id we clicked on
    this.formData.instructions = this.formData.instructions.filter(
      i => i.id != id
    );

    // Decerement the current step and re-render it
    $('.current-step').empty();
    this.currentStep--;
    $('.current-step').text(this.currentStep);

    console.log(this.formData.instructions);
    // Re-render the list
    this.renderInstructions();
  }

  postRecipe() {
    // Show the spinner
    $('.wrapper-spinner .spinner').show();
    console.log(this.formData);
    const instructions = this.formData.instructions.map(i => i.text);
    const dataToSend = {
      title: this.formData.title,
      ingrediens: this.formData.ingrediens,
      instructions,
      categories: this.formData.categories
    };
    fetch(`${window.location.protocol}//${window.location.host}/api/recept`, {
      method: 'POST',
      body: JSON.stringify(dataToSend),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(res => {
        console.log(res);
        sendImage(res._id);
      });

    const sendImage = id => {
      // Send the image here as formdata
      let formData = new FormData();
      let imageInput = document.querySelector('input#file');
      let file;
      if (imageInput.files && imageInput.files[0]) {
        file = imageInput.files[0];
      }
      formData.append('id', id);
      formData.append('file', file);

      fetch(
        `${window.location.protocol}//${window.location.host}/api/uploadimage`,
        {
          method: 'POST',
          body: formData,
          'Content-Type': undefined
        }
      )
        .then(res => res.json())
        .then(res => {
          console.log(res);
          // Hide the loading spinner
          $('.wrapper-spinner .spinner').hide();
          this.resetForm();
        });
    };
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
      <button type="button" class="save-btn btn btn-success"><i class="fas fa-check"></i></button>`
    );
  }

  renderInstructions() {
    $('.added-instructions ul').empty();
    if (this.formData.instructions.length > 0) {
      this.formData.instructions.forEach(i => {
        $('.added-instructions ul').append(
          this.instructionListItem(i.text, i.id, i.step)
        );
      });
    } else {
      $('.added-instructions ul').append(
        '<p class="text-center">Inga instruktioner tillagda</p>'
      );
    }
  }

  addInstruction(el) {
    const text = el
      .parent()
      .find('textarea')
      .val()
      .trim();

    if (text.length < 1) {
      $('.empty-textfield-error').show();
      setTimeout(() => {
        $('.empty-textfield-error').hide();
      }, 2000);
      return;
    }

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

    // Empty the textfield after added
    $('textarea#add-instruction').val('');

    // Re-focus the textfield
    $('textarea#add-instruction').focus();
  }

  fetchLivsmedel(query) {
    /**
     * Fetch the data from the DB
     * with the query.
     */

    // Show loading spinner
    $('.ingrediens-result ul').append('<img src="/imgs/spinner.svg">');
    // If query is empty, then return.
    if (!query.length) return;

    fetch(
      `${window.location.protocol}//${
        window.location.host
      }/api/livsmedel/${query}`
    )
      .then(res => res.json())
      .then(res => this.renderIngrediensSearchResult(res));
  }

  removeImage() {
    $('.file-input-wrapper img').remove();
    $('.file-input-wrapper > div').show();
    // Remove file from input
    $('.input-wrapper input[type="file"]').val('');
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
          `<img src="${
            e.target.result
          }" class="preview-image img-fluid" alt="Din bild">`
        );
      };

      reader.readAsDataURL(e.target.files[0]);

      // Show the trash button
      $('.file-input-wrapper')
        .parent()
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

    $(document).on('change', '.title-input', event => {
      this.formData.title = event.target.value;
    });

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

    // Submit event handler
    $(document).on('confirmed.bs.confirmation', '.submit-btn', e =>
      this.validate()
    );

    // Add click event to delete instruction button
    $(document).on('click', '.remove-instruction-btn', function() {
      that.deleteInstruction($(this));
    });

    // Stop dropdown items from closing the menu on click
    $('body').on('click', '.dropdown-item', function(e) {
      e.stopPropagation();
    });

    // Click event for category checkboxes
    $(document).on('change', '.form-check-input', function() {
      that.toggleCategory($(this));
    });
  }

  renderAddedIngrediens() {
    $('.ingrediens-list ul').empty();
    if (this.formData.ingrediens.length > 0) {
      this.formData.ingrediens.forEach(item => {
        $('.ingrediens-list ul').append(
          this.addedIngrediensItem(
            item.name,
            item.livsmedelId,
            item.volume,
            item.inGram
          )
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
      item => item.livsmedelId === id
    );

    if (
      this.formData.ingrediens[foundIndex] &&
      this.formData.ingrediens[foundIndex].volume >= 1
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
        item => item.livsmedelId === id
      );

      if (that.formData.ingrediens[foundIndex]) {
        that.formData.ingrediens[foundIndex].volume++;
      } else {
        that.formData.ingrediens.unshift({
          name,
          livsmedelId: id,
          volume: 1,
          inGram: 1,
          unit: 'dl'
        });
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
      const foundIndex = that.formData.ingrediens.findIndex(
        i => i.livsmedelId === id
      );

      console.log(foundIndex);

      /**
       * If quantity is 1 then remove the item on decrement
       * else just decrement the quantity property
       */
      if (that.formData.ingrediens[foundIndex].volume === 1) {
        that.formData.ingrediens.splice(foundIndex, 1);
      } else {
        that.formData.ingrediens[foundIndex].volume--;
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
        item => item.livsmedelId !== id
      );

      that.renderAddedIngrediens();
      that.renderMinusButton(id);
    });

    // On change in volume input field
    $(document).on('change', 'input.volume', function() {
      // Change the value of the volume
      const id = $(this).attr('id');
      const foundIndex = that.formData.ingrediens.findIndex(
        i => i.livsmedelId === id
      );
      let value = parseInt($(this).val());
      if (value <= 0 || !value) {
        value = 1;
      }
      that.formData.ingrediens[foundIndex].volume = value;
      that.renderAddedIngrediens();
      console.log(that.formData);
    });

    // On change - motsvarande gram
    $(document).on('change', 'input.motsvarande', function() {
      // Change the value of the inGram
      const id = $(this)
        .attr('id')
        .split('-motsvarande')[0];
      const foundIndex = that.formData.ingrediens.findIndex(
        i => i.livsmedelId === id
      );
      let value = parseInt($(this).val());
      if (value <= 0 || !value) {
        value = 1;
      }
      that.formData.ingrediens[foundIndex].inGram = value;
      that.renderAddedIngrediens();
      console.log(that.formData);
    });
  }

  render() {
    $('main').html(this.template());
    // this.renderIngrediensSearchResult();
    this.addEventListeners();

    // Activate confirmation buttons
    $('[data-toggle=confirmation]').confirmation({
      rootSelector: '[data-toggle=confirmation]'
      // other options
    });
  }
}
