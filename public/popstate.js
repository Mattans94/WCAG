import Person from './main.js';
$(document).on('click', 'a.pop', function (e) {

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
    $('main').html(`
      <h1>Välkommen</h1>
      <p>Du är på min fina startsida</p>
    `);
  }

  if (url == '/spel') {
    $('main').html(`lkdlahskjda`);
    console.log(Person);
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