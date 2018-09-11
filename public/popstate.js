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
    $(document).on('focus blur', '.search-bar input', e => {
      if (e.type === 'focusin') {
        $('.search-bar').addClass('focused');
      } else {
        $('.search-bar').removeClass('focused');
      }
    });
  } else {
    $('main').removeClass('homepage');
  }

  if (url == '/spel') {
    $('main').html(`lkdlahskjda`);
  }

  if (url == '/kontakt') {
    $('main').html('Här finns kontaktuppgifter!');
  }
}

// Call changePage on initial page load
changePage();

// Call changePage on pop events
// (the user clicks the forward or backward button)
window.addEventListener('popstate', changePage);
