export const Homepage = props => {
  $(document).on('submit', '.add-form', e => {
    e.preventDefault();
    let inputs = document.querySelectorAll('.add-form input');

    const livsmedelText = inputs[3].value.split(',');

    const livsmedelIds = livsmedelText.map(l => {
      return {
        livsmedelsId: l,
        quantity: 2
      };
    });

    function uploadImage(id, file) {
      let fileInput = document.querySelector('.add-form input[type="file"]');

      let formData = new FormData();
      formData.append('id', id);
      formData.append('file', fileInput.files[0]);
      console.log('Uploading');
      fetch('http://localhost:3000/api/uploadimg', {
        method: 'POST',
        body: formData,
        'Content-Type': undefined
      })
        .then(res => res.json())
        .then(res => console.log(res));
    }

    const body = {
      title: inputs[0].value,
      instructions: inputs[1].value.split(/,\s*/),
      categories: inputs[2].value.split(/,\s*/),
      livsmedel: livsmedelIds
    };

    console.log(livsmedelIds);

    fetch('http://localhost:3000/api/recept', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(res => {
        console.log(res._id);
        uploadImage(res._id);
      });

    return `
<div class="search-bar-wrapper">
  <form class="form-inline my-2 my-lg-0 search-bar mx-auto">
    <input class="form-control mr-sm-2" type="search" placeholder="Sök recept" aria-label="Search">
    <button class="btn btn-outline-success my-2 my-sm-0" type="submit"><i class="fas fa-search"></i></button>
  </form>
</div>

<div class="container middle">
  <form class="add-form">
    <input type="text" name="title" placeholder="Titel">
    <input type="text" name="instructions" placeholder="Instruktioner">
    <input type="text" name="categories" placeholder="Kateogorier">
    <input type="text" name="livsmedel" placeholder="Livsmedel">
    <input type="file" name="file" placeholder="File">
    <button type="submit">Skicka</button>
  </form>
</div>
`;
  });
};
