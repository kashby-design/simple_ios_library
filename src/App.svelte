<script>
  function openModal() {
    document.getElementById("myModal").style.display = "block";
  }
  function closeModal() {
    document.getElementById("myModal").style.display = "none";
  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target == document.getElementById("myModal")) {
      document.getElementById("myModal").style.display = "none";
    }
  };
</script>

<main>
  <!-- The Modal -->
  <div id="myModal" class="modal">
    <!-- Modal content -->
    <div class="modal-content">
      <span class="close" on:click={closeModal}>&times;</span>
      <div>
        <iframe
          title="Figma File Overview"
          width="100%"
          height="500px"
          src="https://www.youtube.com/embed/7Aaohy-xuSc"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        />
      </div>
    </div>
  </div>

  <h1>Simple iOS Figma Library</h1>
  <div id="grid">
    <div class="overview grid-item">
      <h2>Just the right components to get the job done</h2>
      <!-- Trigger/Open The Modal -->
      <img
        src="images/video_thumbnail.jpg"
        width="100%"
        alt="Figma iOS 14 simple componenent library overview video thumbnail, click to see video"
        style="border-radius: 1rem; cursor: pointer;"
        on:click={openModal}
      />
    </div>
    <div class="problem grid-item">
      <div class="align-center">
        <img src="images/problem_icon.svg" alt="cloud with questions marks" />
        <h2>Problem</h2>
      </div>
      <ul>
        <li>
          Many libraries have so many components, it’s hard to find the one your
          looking for.
        </li>
        <li>
          Everything is laid out, but not grouped by developer naming
          conventions
        </li>
        <li>
          Too many options for a single component, make it hard to get started
        </li>
      </ul>
    </div>
    <div class="solution grid-item">
      <div class="align-center">
        <img src="images/solution_icon.svg" alt="Light bulb" />
        <h2>Solution</h2>
      </div>
      <ul>
        <li>Essential components to get you started</li>
        <li>
          Organized with HIG in mind. Grouped by views, controls, and bars
        </li>
        <li>Variant options if you need them</li>
        <li>I use these components on a daily basis to work on my the app</li>
        <li>
          Only include light mode to allow you to focus on the work, not the
          options
        </li>
        <li>Get a mockup fast to validate your ideas</li>
      </ul>
    </div>
    <div class="purchase grid-item">
      <h2>Purchase for only 1$</h2>
      <script src="https://gumroad.com/js/gumroad.js"></script>
      <a
        class="gumroad-button"
        href="https://gum.co/ZmlqZ"
        target="_blank"
        data-gumroad-single-product="true">Get Me My File</a
      >
    </div>
  </div>
</main>

<style>
  main {
    padding: 1em;
    margin: 0 auto;
  }
  #grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-column-gap: 24px;
    grid-row-gap: 24px;
  }
  .grid-item {
    padding: 1.5rem;
    border-radius: 1rem;
    border: 2px black solid;
    box-shadow: 8px 8px 0px #000000;
    grid-column-start: 1;
    grid-column-end: 3;
  }

  a {
    font-family: Helvetica Neue;
    font-style: normal;
    font-weight: normal;
    font-size: 1em;
    line-height: 1.25em;
    color: white;
    padding: 1em 3em;
    background: #007aff;
    box-shadow: 3px 5px 0px rgba(6, 57, 113, 0.1);
    border-radius: 100px;
  }

  .align-center {
    text-align: center;
  }

  .overview {
    background: rgba(90, 200, 250, 1);
  }
  .problem {
    background: rgba(255, 204, 0, 1);
  }
  .solution {
    background: rgba(52, 199, 89, 1);
  }
  .purchase {
    background: rgba(90, 200, 250, 1);
    text-align: center;
  }

  h1 {
    font-family: Montserrat;
    font-style: normal;
    font-weight: 900;
    font-size: 3rem;
    line-height: 3rem;

    color: black;
    -webkit-text-fill-color: white; /* Will override color (regardless of order) */
    -webkit-text-stroke-width: 2px;
    -webkit-text-stroke-color: black;

    text-shadow: 4px 4px 0px #000000;
  }

  h2 {
    font-family: Montserrat;
    font-style: normal;
    font-weight: 900;
    font-size: 24px;
    line-height: 29px;
    color: #1a202c;
  }

  ul {
    padding: 0;
    margin: 0 0 0 1.5rem;
  }
  li {
    margin-bottom: 0.5rem;
  }

  /* modal stuff */
  /* The Modal (background) */
  .modal {
    display: none; /* Hidden by default */
    position: fixed; /* Stay in place */
    z-index: 1; /* Sit on top */
    left: 0;
    top: 0;
    width: 100%; /* Full width */
    height: 100%; /* Full height */
    overflow: auto; /* Enable scroll if needed */
    background-color: rgb(0, 0, 0); /* Fallback color */
    background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
  }

  /* Modal Content/Box */
  .modal-content {
    background-color: #fefefe;
    margin: 15% auto; /* 15% from the top and centered */
    padding: 20px;
    border: 1px solid #888;
    width: 80%; /* Could be more or less, depending on screen size */
    border-radius: 1rem;
  }

  /* The Close Button */
  .close {
    color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
  }

  .close:hover,
  .close:focus {
    color: black;
    text-decoration: none;
    cursor: pointer;
  }

  @media (min-width: 640px) {
    main {
      max-width: 800px;
    }
    .overview {
      grid-area: 1 / 1 / 2 / 3;
    }
    .problem {
      grid-area: 2 / 1 / 3 / 2;
    }
    .solution {
      grid-area: 2 / 2 / 3 / 3;
    }
    .purchase {
      grid-area: 3 / 1 / 4 / 3;
    }
  }
</style>
