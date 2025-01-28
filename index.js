// select all pager elements
// const pagers = document.querySelectorAll('.glider-pager');

// // loop through all pager elements
// pagers.forEach(pager => {
//   // select all pager items
//   const pagerItems = pager.querySelectorAll('.pager-item');
  
//   // loop through all pager items
//   pagerItems.forEach(pagerItem => {
//     // add click event to each pager item
//     pagerItem.addEventListener('click', () => {
//       // remove active class from all pager items
//       pagerItems.forEach(item => item.classList.remove('active'));
      
//       // add active class to clicked pager item
//       pagerItem.classList.add('active');
//     });
//   });
// });

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

function generatePagerLinks(collection) {
  const numberOfPages = getNumberOfPages(collection);
  let pagerLinks = [];
  for (let i = 0; i < numberOfPages; i++) {
    pagerLinks.push(generatePagerLink(pageNumber));
    // pagerLinks += `<a href="#" class="pager-item">${i + 1}</a>`;
  }
  return pagerLinks;
}

function generatePagerLink(pageNumber) {
  const btn = document.createElement('a');
  btn.classList.add('pager-item');
  btn.textContent = pageNumber;
  btn.setAttribute('data-page', pageNumber);

  btn.a
  return link;
}

console.log(getNumberOfItems(els));

// debounce function
function debounce(func, wait, immediate) {
  let timeout;
  return function() {
    const context = this, args = arguments;
    const later = function() {
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
window.addEventListener('resize', debounce(function() {
  console.log('Screen size changed');
  console.log('Number of items: ', getNumberOfItems(els));
  console.log('Number of items fully visible: ', getNumberOfItemsFullyVisible(els));
  console.log('Number of pages: ', getNumberOfPages(els));
  console.log('Pager links: ', generatePagerLinks(els));
}, 250));
