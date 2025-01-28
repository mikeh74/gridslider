/**
 * Need to following functions:
 * - total number of items in the collection
 * - total number of items fully visible in the viewport
 * - calculate number of 'pages'
 * - generate links for pages
 * 
 */

els = document.querySelectorAll('.glider-grid-item');

els.forEach(el => {

});

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
  for (let i = 0; i < numberOfPages; i++) {
    pagerLinks.push(generatePagerLink(i));
    // pagerLinks += `<a href="#" class="pager-item">${i + 1}</a>`;
  }
  return pagerLinks;
}

function generatePagerLink(pageNumber) {
  const btn = document.createElement('button');
  btn.classList.add('pager-item');
  btn.textContent = pageNumber;
  btn.setAttribute('data-page', pageNumber);
  return btn;
}

console.log(getNumberOfItems(els));

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
      const page = this.getAttribute('data-page');
      console.log('Page: ', page);
      const scrollIndex = calculateScrollIndex(elements);
      const scrollLocation = scrollIndex[page];
      elements[scrollLocation].scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
};

window.addEventListener('load', function () {
  updatePager();
});