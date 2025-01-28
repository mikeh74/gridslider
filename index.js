/**
 * Need to following functions:
 * - total number of items in the collection
 * - total number of items fully visible in the viewport
 * - calculate number of 'pages'
 * - generate links for pages
 * 
 */

function getNumberOfItems(collection) {
  return collection.length;
}

function getNumberOfItemsFullyVisible(collection) {
  const parentElement = collection[0].parentElement;
  const computedStyle = getComputedStyle(parentElement);
  const gapSize = parseInt(computedStyle.gap, 10);
  const itemWidth = collection[0].offsetWidth + gapSize;
  const containerWidth = collection[0].parentElement.offsetWidth;
  return Math.floor((containerWidth + gapSize) / itemWidth);
}

function getNumberOfPages(collection) {
  const totalItems = getNumberOfItems(collection);
  const itemsFullyVisible = getNumberOfItemsFullyVisible(collection);
  return Math.ceil(totalItems / itemsFullyVisible);
}

/**
 * This takes a collection of html elements, calculates the number of pages and generates the pager links
 * and also creates an index for the first element of each page to be used for scrolling
 * @param {*} collection 
 */
function calculateScrollIndex(collection) {
  const numberOfPages = getNumberOfPages(collection);
  let scrollIndex = [];
  for (let i = 0; i < numberOfPages; i++) {
    scrollIndex.push(i * getNumberOfItemsFullyVisible(collection));
  }
  return scrollIndex;
}


function populatePager(collection) {
  const pager = document.querySelector('.glider-pager');
  pager.innerHTML = '';
  const pagerLinks = generatePagerLinks(collection);
  console.log(pagerLinks);
  pagerLinks.forEach(link => {
    pager.appendChild(link);
  });
}

function generatePagerLinks(collection) {
  const numberOfPages = getNumberOfPages(collection);
  let pagerLinks = [];
  let scrollIndex = calculateScrollIndex(collection);
  for (let i = 0; i < numberOfPages; i++) {

    pagerLinks.push(generatePagerLink(i, scrollIndex[i]));
    // pagerLinks += `<a href="#" class="pager-item">${i + 1}</a>`;
  }
  return pagerLinks;
}

function generatePagerLink(pageNumber, itemNumber) {
  const btn = document.createElement('button');
  btn.classList.add('pager-item');
  btn.textContent = pageNumber;
  btn.setAttribute('data-page', pageNumber);
  btn.setAttribute('data-item', itemNumber);
  return btn;
}

// debounce function
function debounce(func, wait, immediate) {
  let timeout;
  return function () {
    const context = this, args = arguments;
    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

// screen resize event listener with debounce
window.addEventListener('resize', debounce(function () {
  updatePager();
}, 250));

function updatePager() {
  const elements = document.querySelectorAll('.glider-grid-item');
  populatePager(elements);
  const pagerItems = document.querySelectorAll('.pager-item');
  pagerItems.forEach(item => {
    item.addEventListener('click', function () {
      const i = this.getAttribute('data-item');
      elements[i].scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
};


// function to check which page is active
function updateActivePage() {

  const elements = document.querySelectorAll('.glider-grid-item');
  const scrollIndex = calculateScrollIndex(elements);

  // run through scroll index from last to first
  // if element is within viewport, set active page
  for (let i = scrollIndex.length - 1; i >= 0; i--) {
    if (_withinViewport(elements[scrollIndex[i]], gliderGrid)) {
      setActivePage(i);
      break;
    }
  }

  // scrollIndex.forEach(index => {
  //   console.log(elements[index].offsetLeft);
  // });

  // const scrollLocation = window.scrollX;
  // const activePage = scrollIndex.findIndex(index => {
  //   return scrollLocation >= elements[index].offsetLeft && scrollLocation < elements[index + 1].offsetLeft;
  // });
  // setActivePage(activePage);
}

function setActivePage(pageNumber) {
  const pagerItems = document.querySelectorAll('.pager-item');
  pagerItems.forEach(item => {
    item.classList.remove('active');
  });
  pagerItems[pageNumber].classList.add('active');
}


// const _withinViewport = (element, parent) => {
//   const elementRect = element.getBoundingClientRect();
//   const parentRect = parent.getBoundingClientRect();

//   return (
//     elementRect.left >= parentRect.left &&
//         elementRect.left <= parentRect.right
//   );
// };

const _withinViewport = (element, parent) => {
  const elementRect = element.getBoundingClientRect();
  const parentRect = parent.getBoundingClientRect();

  return (
    elementRect.left >= parentRect.left &&
    elementRect.right <= parentRect.right
    // elementRect.top >= parentRect.top &&
    // elementRect.bottom <= parentRect.bottom
  );
};

window.addEventListener('load', function () {
  updatePager();
});

let isScrolling;

const gliderGrid = document.querySelector('.glider-grid');

gliderGrid.addEventListener('scroll', function () {
  // console.log('Scrolling...');
  // updateActivePage();

  // Clear our timeout throughout the scroll
  window.clearTimeout(isScrolling);

  // Set a timeout to run after scrolling ends
  isScrolling = setTimeout(function() {
    // Run the function to handle scroll end
    handleScrollEnd();
  }, 500); // Adjust the timeout duration as needed
});

function handleScrollEnd() {
  console.log('Scrolling has stopped.');
  updateActivePage();
}
