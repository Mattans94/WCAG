$(document).on('click', 'a.pop', function(e) {
  // Create a push state event
  // (change the url without a page relaod)
  let href = $(this).attr('href');
  history.pushState(null, null, href);

  // Call the changePage function
  changePage();

  // Stop the browser from doing a page reload
  // (which is its default behaviour whne clicking an a tag)
  e.preventDefault();
});

function changePage() {
  $('main').empty();

  /**
   * Close the collapsed nav on page change
   * and always scroll to top
   */
  $('.collapse').collapse('hide');
  window.scroll(0, 0);

  // React on page changed
  // (replace part of the DOM etc.)

  // Get the current url
  let url = location.pathname;

  // Change which menu link that is active
  $('header a').removeClass('active');
  $(`header a[href="${url}"]`).addClass('active');

  // Change html content for different urls

  if (url == '/') {
    new Homepage(); // Instantiate the Homepage class
    // $('main').html(home);
    $('main').addClass('homepage');
    $('.navbar-brand').addClass('homepage-nav');
    $('header').addClass('homepage-header');
    $(document).on('focus blur', '.search-bar input', e => {
      if (e.type === 'focusin') {
        $('.search-bar').addClass('focused');
      } else {
        $('.search-bar').removeClass('focused');
      }
    });
  } else {
    $('main').removeClass('homepage');
    $('.navbar-brand').removeClass('homepage-nav');
    $('header').removeClass('homepage-header');
  }

  $(document).on('click', '.homepage .card', function(e) {
    const category = $(this).data('category');
    setTimeout(() => {
      $(`.form-check-input[value="${category}"]`)
        .prop('checked', true)
        .trigger('change');
    }, 1000);
  });

  if (url == '/all-recipes') {
    $('main').addClass('AllRecipes');
  } else {
    $('main').removeClass('AllRecipes');
  }

  /*/test of classremove
  if (url == '/recipe') {
    new Recipe();
  }*/

  if (url == '/create-recipe') {
    new CreateRecipe();
    $('main').addClass('CreateRecipe');
  } else {
    $('main').removeClass('CreateRecipe');
  }

  if (url == '/all-recipes') {
    new AllRecipes();
  }

  const regex = /^(\/recipe)(\/\w*)$/i;

  if (regex.test(url)) {
    console.log(regex.test(url));
    let match = regex.exec(url);
    let param = match[2].split('/')[1];
    new Recipe(param);
    $('main').addClass('recipe');
  } else {
    $('main').removeClass('recipe');
  }
}

// Call changePage on initial page load
changePage();

// Call changePage on pop events
// (the user clicks the forward or backward button)
window.addEventListener('popstate', changePage);
