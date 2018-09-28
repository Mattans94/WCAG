class CreateRecipe {
  constructor() {
    this.render();
    this.shouldGuideShow();
    this.searchResult = [];
    this.addEventListeners();
    this.errors = false;
    this.instructionId = 1; // To have an ID to increment
    this.currentStep = 1; // To keep track of instruction step while adding
    this.formData = {
      title: '',
      ingrediens: [],
      instructions: [],
      categories: [],
      portions: 2,
      description: ''
    };
    this.addIngrediensControllersHandler();
    this.renderAddedIngrediens();
    this.renderInstructions();
    this.delayTimer;
  }

  handlePortionButtons(e) {
    let el = $(e.target);

    e.target.tagName === 'I' ? (el = el.parent()) : '';
    console.log(e);
    if (el.hasClass('increment-portions')) {
      // Increment the portions
      this.formData.portions <= 6 && (this.formData.portions += 2);
      el.parent()
        .find('input')
        .val(this.formData.portions);
    } else if (el.hasClass('decrement-portions')) {
      if (this.formData.portions - 2 === 0) {
        this.formData.portions = 2;
        el.parent()
          .find('input')
          .val(this.formData.portions);
      } else {
        this.formData.portions -= 2;
        el.parent()
          .find('input')
          .val(this.formData.portions);
      }
    }
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
      categories: [],
      portions: 2
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
    $('input[type="checkbox"]:checked').prop('checked', false);

    // Activate confirmation buttons
    $('[data-toggle=confirmation]').confirmation({
      rootSelector: '[data-toggle=confirmation]'
      // other options
    });

    $('.portion-count').val(this.formData.portions);
  }

  validate() {
    /**
     * This method will just validate no formdata
     * is empty, then it will post the recipe if validated
     */

    const {
      title,
      ingrediens,
      instructions,
      categories,
      description
    } = this.formData;
    const file = document.querySelector('.input-wrapper input[type="file"]')
      .files[0];

    this.errors = false; // Start from false and set to true if error
    if (
      !(
        title &&
        ingrediens.length &&
        instructions.length &&
        categories.length &&
        description.length
      )
    ) {
      $('.fields-error').show();
      $('html, body').animate({ scrollTop: 0 }, 'slow');
      this.errors = true;
    }

    //If no picture is selected
    if (!file) {
      $('.noimage-error').show();
      $('html, body').animate({ scrollTop: 0 }, 'slow');
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
      categories: this.formData.categories,
      portions: this.formData.portions,
      description: this.formData.description
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
      .find('p')
      .text()
      .trim();

    parent.children().remove();
    console.log(value);
    parent.empty();
    parent.append(
      `<textarea data-id="${id}" class="instruction-edit-field form-control">${value}</textarea>
      <button type="button" class="save-btn btn btn-success"><i class="fas fa-check"></i></button>`
    );
  }

  renderInstructions() {
    $('.added-instructions ul').empty();
    if (this.formData.instructions.length > 0) {
      this.formData.instructions.forEach((i, index) => {
        $('.added-instructions ul').append(
          this.instructionListItem(i.text, i.id, index + 1)
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

    this.formData.instructions.push({
      id: this.instructionId,
      text: text
    });

    this.renderInstructions();

    this.instructionId++;

    // The current instruction number on the page
    $('.current-step').empty();

    this.currentStep++;

    $('.current-step').text(this.currentStep);

    // Empty the textfield after added
    $('textarea#add-instruction').val('');

    $('.new-instruction-btn').trigger('click');
  }

  fetchLivsmedel(query) {
    /**
     * Fetch the data from the DB
     * with the query.
     */

    // Show loading spinner
    $('.ingrediens-spinner').show();
    console.log(query);
    // If query is empty, then return.
    if (!query) {
      console.log('QUERY IS LESS THAN 1');
      $('.ingrediens-result-list').hide();
      return;
    } else {
      $('.ingrediens-result-list').show();
    }

    fetch(
      `${window.location.protocol}//${
        window.location.host
      }/api/livsmedel/${query}`
    )
      .then(res => res.json())
      .then(res => {
        this.searchResult = res;
        this.renderIngrediensSearchResult();
      });
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

      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

      // If file's not jpeg, png or gif then throw error
      if (!allowedTypes.includes(e.target.files[0].type)) {
        e.target.value = ''; // Remove the file from the input field
        $('.alert.file-type-error').show();

        setTimeout(() => {
          $('.alert.file-type-error').hide();
        }, 7000);
        return;
      }

      const reader = new FileReader();
      console.log(e.target.files[0]);

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

    // update description while typing
    $(document).on('keyup', '.description-text', e => {
      this.formData.description = e.target.value.trim();
    });

    /**
     * If gram is chosen as unit then hide the "motsvarande section".
     * This methods adds the event listener to every select
     */
    $(document).on('change', '.motsvarande-select', function() {
      const val = $(this).val();
      const motsvarandeWrapper = $(this)
        .parent()
        .parent()
        .parent()
        .find('.motsvarande-wrapper');
      const id = $(this)
        .parent()
        .find('input.volume')
        .attr('id');

      if (val === 'g') {
        motsvarandeWrapper.addClass('hide-wrapper');
      } else {
        motsvarandeWrapper.removeClass('hide-wrapper');
      }

      /**
       * Find the ingrediens in our array
       * and replace the unit
       */

      const foundIndex = that.formData.ingrediens.findIndex(
        i => i.livsmedelId === id
      );

      that.formData.ingrediens[foundIndex].unit = val;
      console.log(that.formData.ingrediens);
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

    // Toggle checkbox when clicking on its parent div
    $(document).on('click', '.category-choose', function(e) {
      if (e.target === e.currentTarget) {
        const checkbox = $(this).find('input.form-check-input');
        const isChecked = checkbox.is(':checked');
        checkbox.prop('checked', !isChecked).trigger('change');
      }
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
          return $('.ingrediens-result ul').hide();
        }
        this.fetchLivsmedel(e.target.value);
      }, 500);
    });

    // Hide the search result when clicking outside
    $('body').on('click.hideResult touchend.hideResult', function(e) {
      if ($('.ingrediens-result-list').is(':visible')) {
        if (
          !$(e.target)
            .parent()
            .parent()
            .parent()
            .hasClass('ingrediens-result-item') &&
          !$(e.target).is('input#ingredienser') &&
          !$(e.target).is('.ingrediens-result-item') &&
          !$(e.target).is('.quantity-controllers') &&
          !$(e.target).is('.quantity-control-button')
        ) {
          $('.ingrediens-result-list').hide();
        }
      }
    });

    // Toggle focus class
    $(document).on('focus touchend', 'input#ingredienser', function() {
      if ($('.ingrediens-result-list').children().length > 0) {
        $('.ingrediens-result-list').show();
      }
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

    // Click event for category checkboxes
    $(document).on('change', '.category-choose .form-check-input', function() {
      that.toggleCategory($(this));
    });

    $(document).on('click', '.increment-portions, .decrement-portions', e =>
      this.handlePortionButtons(e)
    );

    // Toggle textfield when adding instruction
    $(document).off('click', '.new-instruction-btn');
    $(document).on('click', '.new-instruction-btn', function() {
      $('.add-instructions-wrapper').toggleClass('opened');
      if (
        $('.add-instructions-wrapper').hasClass('opened') ||
        $('.add-instructions-wrapper').is(':visible')
      ) {
        $('textarea#add-instruction').focus();
        $('.instruction-header .fa-plus').hide();
        $('.instruction-header .fa-times').show();
      } else {
        $('.instruction-header .fa-plus').show();
        $('.instruction-header .fa-times').hide();
      }
    });
  }

  renderAddedIngrediens() {
    $('.added-ingrediens-list').empty();
    if (this.formData.ingrediens.length > 0) {
      this.formData.ingrediens.forEach(item => {
        $('.added-ingrediens-list').append(
          this.addedIngrediensItem(
            item.name,
            item.livsmedelId,
            item.volume,
            item.inGram,
            item.unit
          )
        );
      });
    } else {
      $('.added-ingrediens-list').append(
        '<p class="text-center">Inga ingredienser tillagda</p>'
      );
    }

    // Activate popovers
    $(function() {
      $('[data-toggle="popover"]').popover();
    });
  }

  renderIngrediensSearchResult() {
    $('.ingrediens-result ul').empty();
    $('.ingrediens-spinner').hide();
    const dummyData = [
      { id: '2312ssf', name: 'Pasta' },
      { id: '231s123', name: 'Potatis' }
    ];

    const data = this.searchResult;

    if (this.searchResult.length === 0) return;

    data.forEach(item => {
      /**
       * Loop through ingrediens array to see
       * if ingrediens already exists in our array
       */
      const foundIndex = this.formData.ingrediens.findIndex(
        i => i.livsmedelId === item._id
      );

      let alreadyAdded;

      foundIndex !== -1 ? (alreadyAdded = true) : (alreadyAdded = false);

      // Append the list with the template
      $('.ingrediens-result ul').append(
        this.ingrediensListItem(item.Namn, item._id, alreadyAdded)
      );
    });
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

      console.log(foundIndex);

      if (that.formData.ingrediens[foundIndex]) {
        that.formData.ingrediens[foundIndex].volume++;
      } else {
        that.formData.ingrediens.unshift({
          name,
          livsmedelId: id,
          volume: 1,
          inGram: 1,
          unit: 'st'
        });
      }

      console.log(that.formData.ingrediens);
      that.renderAddedIngrediens();
      that.renderIngrediensSearchResult();
    });

    $(document).on('click', '.quantity-control-button.check', function() {
      /**
       * When clicking the check button the ingrediens
       * will get removed from the list
       */

      const el = $(this)
        .parent()
        .parent();

      const id = el.data('id');

      // Filter out the ingredient we checked off
      that.formData.ingrediens = that.formData.ingrediens.filter(
        i => i.livsmedelId !== id
      );
      console.log(that.formData.ingrediens);

      // Re-render the lists
      that.renderAddedIngrediens();
      that.renderIngrediensSearchResult();
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

    $(document).off('click', '.guide-btn');
    $(document).on('click', '.guide-btn', () => this.startIntroJs());
  }

  startIntroJs() {
    introJs()
      .setOptions({
        nextLabel: 'Nästa',
        prevLabel: 'Tillbaka',
        skipLabel: 'Avbryt',
        doneLabel: 'Klar',
        exitOnOverlayClick: false,
        showProgress: true
      })
      .start();
  }

  shouldGuideShow() {
    fetch(`${window.location.protocol}//${window.location.host}/api/first-time`)
      .then(res => res.json())
      .then(res => {
        console.log(res);
        if (res.firstTime) {
          this.startIntroJs();
        }
      });
  }

  render() {
    $('.introjs-overlay').remove();
    $('main').html(this.template());

    // Activate confirmation buttons
    $('[data-toggle=confirmation]').confirmation({
      rootSelector: '[data-toggle=confirmation]'
      // other options
    });
  }
}
