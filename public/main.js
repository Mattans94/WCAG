$(document).ready(function() {
  // Event listeners for hamburge icon
  $(document).on('show.bs.collapse', () => {
    $('.hamburger').addClass('clicked');
  });

  $(document).on('hide.bs.collapse', () => {
    $('.hamburger').removeClass('clicked');
  });
});
