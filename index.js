/**
 * Need to following functions:
 * - total number of items in the collection
 * - total number of items fully visible in the viewport
 * - calculate number of 'pages'
 * - generate links for pages
 * 
 */

const throttle = function (func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
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

/**
 * Normalise the scroll event across browsers
 *
 * @param {HTMLElement} element
 * @param {Function} func
 * @param  {...any} args
 */
const onScrollEnd = function (element, func, ...args) {
  const context = this;
  if ('onscrollend' in window) {
    element.addEventListener(
      'scrollend', () => {
        func.apply(context, args);
      });
  } else {
    // fall back to scroll listener with timeout for browsers
    // that don't support scrollend
    element.addEventListener('scroll', (event) => {
      clearTimeout(window.scrollEndTimer);
      window.scrollEndTimer = setTimeout(() => {
        func.apply(context, args);
      }, 50);
    });
  };
};

const _withinViewport = (element, parent, offset) => {
  offset = offset || 0;
  const elementRect = element.getBoundingClientRect();
  const parentRect = parent.getBoundingClientRect();

  // factor in the offset so that the element is considered within the viewport
  // even if it's slightly outside the viewport
  const left = parentRect.left + offset;
  const right = parentRect.right - offset;

  return (
    elementRect.left >= parentRect.left &&
    elementRect.right <= parentRect.right
  );
};

/**
 * Object factory function to create a glider object
 * 
 */
const glider = {};

/**
 * Object passed to the init function to initialise the glider object
 * includes optoins for the glider object and selectors for the pager and grid
 * and grid items.
 * @param {*} element 
 */
glider.init = function ({ 
  element,
  gridSelector = '.glider-grid',
  pagerSelector = '.glider-pager',
  itemSelector = '.glider-grid-item' } = {}) {

  this.glider = element;
  this.grid = this.glider.querySelector(gridSelector);

  this.pager = this.glider.querySelector(pagerSelector);
  this.items = this.grid.querySelectorAll(itemSelector);

  this.initPager();
  this.initScroll();

  // this.scrollIndex = calculateScrollIndex(this.items);
  // this.activePage = 0;
  // this.initPager();
  // this.initScroll();
}

glider.getNumberOfItems = function () {
  return this.items.length;
}

glider.getNumberOfItemsFullyVisible = function () {
  const computedStyle = getComputedStyle(this.grid);
  const gapSize = parseInt(computedStyle.gap, 10);
  const itemWidth = this.items[0].offsetWidth + gapSize;
  const containerWidth = this.grid.offsetWidth;
  return Math.floor((containerWidth + gapSize) / itemWidth);
}

glider.getNumberOfPages = function () {
  const totalItems = this.getNumberOfItems();
  const itemsFullyVisible = this.getNumberOfItemsFullyVisible();
  return Math.ceil(totalItems / itemsFullyVisible);
}

glider.calculateScrollIndex = function () {
  const numberOfPages = this.getNumberOfPages();
  let scrollIndex = [];
  for (let i = 0; i < numberOfPages; i++) {
    scrollIndex.push(i * this.getNumberOfItemsFullyVisible());
  }
  return scrollIndex;
}

glider.populatePager = function () {
  this.pager.innerHTML = '';
  const pagerLinks = this.generatePagerLinks();
  pagerLinks.forEach(link => {
    this.pager.appendChild(link);
  });
}

glider.generatePagerLinks = function () {
  const numberOfPages = this.getNumberOfPages();
  let pagerLinks = [];
  let scrollIndex = this.calculateScrollIndex();
  for (let i = 0; i < numberOfPages; i++) {
    pagerLinks.push(this.generatePagerLink(i, scrollIndex[i]));
  }
  return pagerLinks;
}

glider.generatePagerLink = function (pageNumber, itemNumber) {
  const btn = document.createElement('button');
  btn.classList.add('pager-item');
  // btn.textContent = pageNumber;
  btn.setAttribute('aria-label', `Page ${pageNumber + 1}`);
  btn.setAttribute('data-page', pageNumber);
  btn.setAttribute('data-item', itemNumber);
  return btn;
}

glider.updatePager = function () {
  const that = this;
  this.populatePager();

  const pagerItems = this.pager.querySelectorAll('.pager-item');
  pagerItems.forEach(item => {
    item.addEventListener('click', function () {
      const i = item.getAttribute('data-item');
      const left = that.items[i].offsetLeft;
      const parent = that.items[i].parentElement;
      parent.scrollTo({
        left: left,
        behavior: 'smooth'
      });
    });
  });
}

glider.updateActivePage = function () {
  const scrollIndex = this.calculateScrollIndex();

  for (let i = scrollIndex.length - 1; i >= 0; i--) {
    if (_withinViewport(this.items[scrollIndex[i]], this.grid, 16)) {
      this.setActivePage(i);
      break;
    }
  }
}

glider.setActivePage = function (pageNumber) {
  const pagerItems = this.pager.querySelectorAll('.pager-item');
  pagerItems.forEach(item => {
    item.classList.remove('active');
  });
  pagerItems[pageNumber].classList.add('active');
}

glider.initPager = function () {
  const that = this;

  window.addEventListener('resize', debounce(function () {
    that.updatePager();
    that.updateActivePage();
  }, 250));

  // this.populatePager();
  this.updatePager();
  this.updateActivePage();
  this.onScrollEnd();
}

glider.initScroll = function () {

  // const throttle = function(func, limit) {
  //   let inThrottle;
  //   return function() {
  //     const args = arguments;
  //     const context = this;
  //     if (!inThrottle) {
  //       func.apply(context, args);
  //       inThrottle = true;
  //       setTimeout(() => inThrottle = false, limit);
  //     }
  //   };
  // }

  const that = this;
  const throttledScrollHandler = throttle(function () {
    that.updateActivePage();
  }, 50);
  this.grid.addEventListener('scroll', throttledScrollHandler);
}

glider.onScrollEnd = function () {
  const that = this;

  const handleScrollEnd = () => {
    console.log('scroll end');
    that.isSliding = false;
    that.updateActivePage();
  }

  // const handlePagerOnScroll = () => {
  //   that.updateActivePage();
  // };

  // throttled scroll listener
  // const throttledScrollHandler = throttle(handlePagerOnScroll, 50);
  // this.grid.addEventListener('scroll', throttledScrollHandler);

  onScrollEnd(this.grid, handleScrollEnd);
};

// glider.handleScrollEnd = function () {
//   this.updateActivePage();
// }

/**
 * Creates a pager object with the given slider.
 * @param {Object} slider - The slider object to create the pager for.
 * @return {Pager} - The pager object.
 */
const makeGlider = function (element) {
  const obj = Object.create(glider);
  obj.init({element});
  return obj;
};

const els = document.querySelectorAll('.glider');

els.forEach(el => {
  makeGlider(el);
});
