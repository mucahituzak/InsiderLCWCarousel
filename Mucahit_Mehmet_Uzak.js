
(function () {
  // Load jQuery if it's not already loaded, then execute the callback function
  function loadJQuery(callback) {
    if (window.jQuery) {
      callback();
    } else {
      var scriptElement = document.createElement("script");
      scriptElement.src = "https://code.jquery.com/jquery-3.6.0.min.js";
      scriptElement.onload = callback;
      document.head.appendChild(scriptElement);
    }
  }

  // Define CSS styles for the carousel and product cards
  const carouselStyles = `
        .product-list {
            margin: 20px auto;
            width: 80%;
            position: relative;
            background: transparent;
        }
        .product-list-title {
            font-weight: lighter;
            padding: 15px 0;
            margin: 13px;
            font-size: 32px;
            line-height: 43px;
        }
        .carousel-container {
            position: relative;
            overflow: hidden;
            height: 100%;
        }
        .carousel-items {
            display: flex;
            transition: transform 0.3s ease;
            gap: 15px;
            padding: 0 15px;
            height: 100%;
            overflow: visible;
        }
        .item-card {
            flex: 0 0 calc(15.38% - 15px); /* 100/6.5 ≈ 15.38 */
            position: relative;
            height: 100%;
            background: #fff;
        }
        .item-wrapper {
            position: relative;
        }
        .item-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            background: #fafafa;
            margin-bottom: 8px;
            aspect-ratio: 3/4;
        }
        .item-title {
            font-size: 12px;
            color: #1a1a1a;
            margin: 0 0 4px 0;
            text-overflow: ellipsis;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            line-height: 1.3;
            min-height: 32px;
            font-weight: 400;
        }
        .item-price {
            font-size: 14px;
            color: #0047ba;
            font-weight: 600;
            margin: 0;
        }
        .item-info {
            padding: 0 7px;
        }
        .carousel-button {
            position: absolute;
            top: 65%;
            transform: translateY(-50%);
            background: none;
            border: none;
            cursor: pointer;
            z-index: 2;
            padding: 0;
        }
        .carousel-button.prev {
            left: -35px;
        }
        .carousel-button.next {
            right: -35px;
        }
        .carousel-button.next svg {
            transform: rotate(180deg);
        }
        .carousel-button:hover {
            background: none;
        }
        .favorite-button {
            cursor: pointer;
            position: absolute;
            top: 9px;
            right: 15px;
            width: 34px;
            height: 34px;
            background-color: #fff;
            border-radius: 5px;
            box-shadow: 0 3px 6px 0 rgba(0, 0, 0, .16);
            border: solid .5px #b6b7b9;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .favorite-button svg {
            width: 18px;
            height: 18px;
        }
        .favorite-button.active svg path {
            fill: #0047ba;
        }
        @media (max-width: 1200px) {
            .item-card {
                flex: 0 0 calc(20% - 15px); /* 5 products */
            }
            .product-list {
                padding: 0 15px;
            }
        }
        @media (max-width: 768px) {
            .item-card {
                flex: 0 0 calc((100% - (20px * 0.5)) / 1.5);
            }
            .item-card:last-child {
                margin-right: calc((100% - (20px * 0.5)) / 1.5 * 0.5);
            }
            .carousel-button {
                display: none;
            }
        }
    `;

  // Local Storage operations for products and favorites
  const storage = {
    // Save products to local storage
    setProducts: (products) =>
      localStorage.setItem("lcw_carousel_products", JSON.stringify(products)),
    // Retrieve products from local storage
    getProducts: () =>
      JSON.parse(localStorage.getItem("lcw_carousel_products")),
    // Save favorite products to local storage
    setFavorites: (favorites) =>
      localStorage.setItem("lcw_carousel_favorites", JSON.stringify(favorites)),
    // Retrieve favorite products from local storage
    getFavorites: () =>
      JSON.parse(localStorage.getItem("lcw_carousel_favorites")) || [],
  };

  // Function to fetch products from an API or return cached products
  async function fetchProducts() {
    // Check if products are cached in local storage
    const cachedProducts = storage.getProducts();
    if (cachedProducts) {
      try {
        // Attempt to parse cached products
        const products = JSON.parse(cachedProducts);

        // Verify that cached products are an array
        if (!Array.isArray(products)) {
          throw new Error("Cache verisi bir dizi değil!");
        }

        console.log("Ürünler localStorage'dan alındı");
        return products;
      } catch (error) {
        console.error("Cache verisi hatalı:", error);
      }
    }

    try {
      // Fetch products from the API
      const response = await fetch(
        "https://gist.githubusercontent.com/sevindi/5765c5812bbc8238a38b3cf52f233651/raw/56261d81af8561bf0a7cf692fe572f9e1e91f372/products.json"
      );
      const products = await response.json();

      // Verify that API response is an array
      const parsedProducts = Array.isArray(products)
        ? products
        : JSON.parse(products);

      // Verify that API response has the correct structure
      console.log("Ürünler:", parsedProducts);

      if (!Array.isArray(parsedProducts)) {
        throw new Error("API verisi bir dizi değil!");
      }

      // Cache products in local storage
      storage.setProducts(parsedProducts);
      console.log("Ürünler API'den çekildi ve localStorage'a kaydedildi");
      return parsedProducts;
    } catch (error) {
      console.error("Ürünler yüklenirken hata oluştu:", error);
      // Return an empty array if an error occurs
      return [];
    }
  }

  // Function to create the carousel HTML structure with products
  function createCarousel(productList) {
    // Retrieve favorite products from local storage
    const favorites = storage.getFavorites();

    // Create the carousel HTML structure
    const carousel = $(`
            <div class="product-list">
                <h2 class="product-list-title">You Might Also Like</h2>
                <button class="carousel-button prev">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14.242" height="24.242" viewBox="0 0 14.242 24.242">
                        <path fill="none" stroke="#333" stroke-linecap="round" stroke-width="3px" d="M2106.842 2395.467l-10 10 10 10" transform="translate(-2094.721 -2393.346)"></path>
                    </svg>
                </button>
                <button class="carousel-button next">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14.242" height="24.242" viewBox="0 0 14.242 24.242">
                        <path fill="none" stroke="#333" stroke-linecap="round" stroke-width="3px" d="M2106.842 2395.467l-10 10 10 10" transform="translate(-2094.721 -2393.346)"></path>
                    </svg>
                </button>
                <div class="carousel-container">
                    <div class="carousel-items">
                        ${productList
                          .map(
                            (product, index) => `
                            <div class="item-card">
                                <div class="item-wrapper">
                                    <a href="${
                                      product.url
                                    }" target="_blank" style="text-decoration: none; color: inherit;">
                                        <img class="item-image" src="${
                                          product.img
                                        }" alt="${product.name}">
                                        <button class="favorite-button ${
                                          favorites.includes(product.id)
                                            ? "active"
                                            : ""
                                        }" data-id="${product.id}">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20.576" height="19.483" viewBox="0 0 20.576 19.483">
                                                <path fill="${
                                                  favorites.includes(product.id)
                                                    ? "#0047ba"
                                                    : "none"
                                                }" stroke="#555" stroke-width="1.5px" d="M19.032 7.111c-.278-3.063-2.446-5.285-5.159-5.285a5.128 5.128 0 0 0-4.394 2.532 4.942 4.942 0 0 0-4.288-2.532C2.478 1.826.31 4.048.032 7.111a5.449 5.449 0 0 0 .162 2.008 8.614 8.614 0 0 0 2.639 4.4l6.642 6.031 6.755-6.027a8.615 8.615 0 0 0 2.639-4.4 5.461 5.461 0 0 0 .163-2.012z" transform="translate(.756 -1.076)"></path>
                                            </svg>
                                        </button>
                                        <div class="item-info">
                                        <div class="item-title">${
                                          product.name
                                        }</div>
                                        <div class="item-price">${
                                          product.price
                                        } TRY</div>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                </div>
            </div>
        `);

    return carousel;
  }

  // Function to initialize carousel controls and functionality
  function initializeCarousel(carouselElement) {
    // Retrieve the carousel container and buttons
    const $container = carouselElement.find(".carousel-items");
    const $prevBtn = carouselElement.find(".carousel-button.prev");
    const $nextBtn = carouselElement.find(".carousel-button.next");

    // Initialize the current position and index
    let currentPosition = 0;
    let currentIndex = localStorage.getItem("currentCarouselIndex")
      ? parseInt(localStorage.getItem("currentCarouselIndex"))
      : 0;

    // Function to slide the carousel in the specified direction
    function slide(direction) {
      // Calculate the card width
      const cardWidth = carouselElement.find(".item-card").outerWidth(true);

      // Update the current position
      currentPosition = Math.max(
        Math.min(
          currentPosition + (direction === "next" ? -cardWidth : cardWidth),
          0
        ),
        -($container[0].scrollWidth - $container.width())
      );

      // Update the carousel position
      $container.css("transform", `translateX(${currentPosition}px)`);
    }

    // Event listeners for the previous and next buttons
    $prevBtn.on("click", () => {
      // Update the current index
      currentIndex = Math.max(currentIndex - 1, 0);
      localStorage.setItem("currentCarouselIndex", currentIndex);

      // Slide the carousel to the previous position
      slide("prev");
    });

    $nextBtn.on("click", () => {
      // Update the current index
      currentIndex = Math.min(
        currentIndex + 1,
        carouselElement.find(".item-card").length - 1
      );
      localStorage.setItem("currentCarouselIndex", currentIndex);

      // Slide the carousel to the next position
      slide("next");
    });

    // Favorite button functionality
    carouselElement.find(".favorite-button").on("click", function (e) {
      // Prevent default behavior
      e.preventDefault();

      // Retrieve the favorite button and product ID
      const $btn = $(this);
      const productId = $btn.data("id");

      // Retrieve the favorite products from local storage
      const favorites = storage.getFavorites();

      // Toggle the favorite status
      if (favorites.includes(productId)) {
        // Remove the product from the favorites
        const newFavorites = favorites.filter((id) => id !== productId);
        storage.setFavorites(newFavorites);

        // Update the favorite button
        $btn.removeClass("active").find("svg path").attr("fill", "none");
      } else {
        // Add the product to the favorites
        favorites.push(productId);
        storage.setFavorites(favorites);

        // Update the favorite button
        $btn.addClass("active").find("svg path").attr("fill", "#0047ba");
      }
    });

    // Responsive design functionality
    function updateCarouselStyles() {
      // Retrieve the carousel buttons
      const arrows = carouselElement.find(".carousel-button");

      // Check the screen width
      if (window.innerWidth < 768) {
        // Hide the carousel buttons on small screens
        arrows.css("display", "none");
      } else {
        // Show the carousel buttons on larger screens
        arrows.css("display", "block");
      }
    }

    // Event listener for the window resize event
    window.addEventListener("resize", updateCarouselStyles);

    // Initialize the carousel styles
    updateCarouselStyles();

    // Drag and drop functionality for mobile devices
    let startX;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID;
    let isDragging = false;

    // Event listeners for the touch events
    $container.on("touchstart", (event) => {
      // Retrieve the start position
      startX = event.touches[0].clientX;

      // Set the dragging flag
      isDragging = true;

      // Request the animation frame
      animationID = requestAnimationFrame(animation);
    });

    $container.on("touchend", () => {
      // Cancel the animation frame
      cancelAnimationFrame(animationID);

      // Reset the dragging flag
      isDragging = false;

      // Update the previous translate value
      prevTranslate = currentTranslate;
    });

    $container.on("touchmove", (event) => {
      // Check if the carousel is being dragged
      if (isDragging) {
        // Retrieve the current position
        const currentX = event.touches[0].clientX;

        // Update the current translate value
        currentTranslate = prevTranslate + currentX - startX;
      }
    });

    // Animation function
    function animation() {
      // Update the carousel position
      setCarouselPosition();

      // Check if the carousel is being dragged
      if (isDragging) {
        // Request the next animation frame
        requestAnimationFrame(animation);
      }
    }

    // Function to set the carousel position
    function setCarouselPosition() {
      // Update the carousel position
      $container.css("transform", `translateX(${currentTranslate}px)`);
    }
  }

  // Main function to initialize the carousel
  async function initialize() {
    // Append the styles to the document head
    const styleElement = document.createElement("style");
    styleElement.textContent = carouselStyles;
    document.head.appendChild(styleElement);

    // Fetch the products and create the carousel
    const products = await fetchProducts();
    const $carousel = createCarousel(products);

    // Append the carousel to the product detail section
    $(".product-detail").after($carousel);

    // Initialize the carousel controls
    initializeCarousel($carousel);
  }

  // Load jQuery and start the initialization process
  loadJQuery(() => {
    // Check if the product detail section exists
    if (document.querySelector(".product-detail")) {
      // Initialize the carousel
      initialize();
    }
  });
})();
