$(document).ready(function() {
  // Event listeners for hamburge icon
  $(document).on('show.bs.collapse', '.navbar-collapse', () => {
    $('.hamburger').addClass('clicked');
  });

  $(document).on('hide.bs.collapse', '.navbar-collapse', () => {
    $('.hamburger').removeClass('clicked');
  });
});


