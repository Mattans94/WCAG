class Homepage {
  constructor() {
    this.recipes = [];
    this.render();
    this.addEventListener();
    this.delayTimer;
  }

  render() {
    return $('main').html(this.template());
  }

  fetchData(query) {
    fetch(`http://localhost:3000/api/all-recipes/${query}`)
      .then(response => response.json())
      .then(response => {
        this.recipes = response;
        console.log(this.recipes);
        this.renderAutoItems();
      })
  }

  addEventListener() {
    $(document).on('input', '.search-field', (e) => {
      clearTimeout(this.delayTimer);
      this.delayTimer = setTimeout(() => {
        this.fetchData(e.target.value);
      }, 300);
    })

    $('body').on('click.closeResult touchend.closeResult', function (e) {
      if ($('.search-result').is(':visible')) {
        if (
          !$(e.target).is('.search-field') &&
          !$(e.target).is('.auto-list-item') &&
          !$(e.target).is('a.list-item > img') &&
          !$(e.target).is('a.list-item > h4') &&
          !$(e.target).is('a.list-item') &&
          !$(e.target).is('.search-result')
        ) {
          $('.search-result').hide();
          $('.search-field').val('');
          $('.search-result').empty();
          $('.search-bar-wrapper').removeClass('opacity-bg');
        } else {
          $('.search-result').show();
        }
      }
    });

    $(document).on('focus touchend', '.search-field', function () {
      if ($('.search-result').children().length > 0) {
        $('.search-result').show();
      }
    });

    $(document).on('focus blur', '.search-bar input', e => {
      if (e.type === 'focusin') {
        $('.search-bar').addClass('opacity-bg');
        $('.card').addClass('remove-pointer-events');
      } else {
        $('.search-bar').removeClass('opacity-bg');
        $('.card').removeClass('remove-pointer-events');
      }
    })

  }



  renderAutoItems() {
    $('.search-result').empty();
    $('.search-result').show();
    if ($('.search-field').val().length < 1) {
      return;
    }

    this.recipes.forEach((i) => {
      let description = i.description;
      if (description.length > 40) {
        description = description.slice(0, 39) + '...';
        console.log(description)
      }

      $('.search-result').append(this.autocomp(i.title, i._id, i.imgPath, description));
    })

  }

}


