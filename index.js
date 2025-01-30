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

/**
 * Check whether an element is in the viewport based on it's position
 * relative to the parent element. We are comparing the right edge of the
 * element to the right edge of the parent element and the left edge of the
 * element to the left edge of the parent element.
 * 
 * The offset is used to add a buffer to the comparison on the left edge of the
 * parent element only.
 * 
 * @param {*} element - html element
 * @param {*} parent - html element
 * @param {*} offset - number
 */
const withinViewport = (element, parent, offset) => {
  offset = offset || 0;
  const elementRect = element.getBoundingClientRect();
  const parentRect = parent.getBoundingClientRect();

  return (
    elementRect.left >= (parentRect.left - offset) &&
    elementRect.right <= parentRect.right
  );
};


/**
 * Check whether an element is past a certain point in the viewport, we are
 * comparing the left edge of the element to the left edge of the parent
 * element.
 * 
 * @param {*} element - html element
 * @param {*} parent 
 * @param {*} offset 
 * @returns 
 */
const itemLeftOfParent = (element, parent, offset) => {
  offset = offset || 0;
  const elementRect = element.getBoundingClientRect();
  const parentRect = parent.getBoundingClientRect();

  return (
    elementRect.left <= (parentRect.left + offset)
  );
};


/**
 * Declare our glider object
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
  itemSelector = '.glider-grid-item',
  pagerItemClass = 'glider-pager-item' } = {}) {

  this.glider = element;
  this.grid = this.glider.querySelector(gridSelector);
  this.pager = this.glider.querySelector(pagerSelector);

  // TODO what if elements are added dynaically to the collection
  // how do we detect this (would we need mutation observer)
  this.items = this.grid.querySelectorAll(itemSelector);

  this.pagerItemClass = pagerItemClass;
  this.pagerItemSelector = `.${pagerItemClass}`;

  this.initPager();
  this.initScroll();
}

glider.getNumberOfItems = function () {
  return this.items.length;
}

/**
 * Calculate the number of displayed elements that should be visible in
 * the viewport at this point.
 */
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

/**
 * This function returns a javascript array of elements which are a
 * set number of items apart based on the number of elements which are
 * currently visible in the viewport.
 * 
 * TODO: clarify this section
 * The benefit of this is that the last index item might be an element which
 * will never be fully to the left in the viewport but attempting to scroll
 * to that position still works
 *
 * @returns array
 */
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
  // if we only have one page, don't show the pager
  if (pagerLinks.length === 1) {
    return;
  }

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
  btn.classList.add(this.pagerItemClass);
  // btn.textContent = pageNumber;
  btn.setAttribute('aria-label', `Page ${pageNumber + 1}`);
  btn.setAttribute('data-page', pageNumber);
  btn.setAttribute('data-item', itemNumber);
  return btn;
}

glider.updatePager = function () {
  const that = this;
  this.populatePager();

  // TODO: potentially refactor this out?
  // once we've populate the pager we need to add the event listeners
  // TODO could we not add the actual scroll position to the button when we 
  // are setting it rather than calculate it here, so we can just get the
  // position that we need to scroll to???
  const pagerItems = this.pager.querySelectorAll(this.pagerItemSelector);
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

  // if the last element is in view, set the active page to the last page
  if (withinViewport(this.items[this.items.length - 1], this.grid, 16)) {
    this.setActivePage(scrollIndex.length - 1);
    return;
  }

  // set active page to 0
  let activePage = 0;

  // loop through our scrollIndex and check each one to see if it is to the 
  // left of the parent element (or within the buffer zone)
  for (let i = 0; i < scrollIndex.length; i++) {
    if (itemLeftOfParent(this.items[scrollIndex[i]], this.grid, 16)) {
      activePage = i;
    }
  }
  this.setActivePage(activePage);
}

glider.setActivePage = function (pageNumber) {
  const pagerItems = this.pager.querySelectorAll(this.pagerItemSelector);

  if (pagerItems.length > 0) {
    pagerItems.forEach(item => {
      item.classList.remove('active');
    });
    pagerItems[pageNumber].classList.add('active');
  }
}

/**
 * Initialise the pager
 */
glider.initPager = function () {
  const that = this;

  // attach event listener for resize event
  window.addEventListener('resize', debounce(function () {
    that.updatePager();
    that.updateActivePage();
  }, 250));


  this.updatePager();
  this.updateActivePage();
  this.onScrollEnd();
}

glider.initScroll = function () {

  const that = this;
  const throttledScrollHandler = throttle(function () {
    that.updateActivePage();
  }, 50);
  this.grid.addEventListener('scroll', throttledScrollHandler);
}

glider.onScrollEnd = function () {
  const that = this;

  const handleScrollEnd = () => {
    that.updateActivePage();
  }

  onScrollEnd(this.grid, handleScrollEnd);
};

/**
 * Creates a pager object with the given slider.
 * 
 * Pass the slider object to the pager object to create the pager.
 * 
 * @param {Object} slider - The slider object to create the pager for.
 * @return {Pager} - The pager object.
 */
const makeGlider = function (element) {
  const obj = Object.create(glider);
  obj.init({ element });
  return obj;
};

const els = document.querySelectorAll('.glider');

els.forEach(el => {
  makeGlider(el);
});

const initGlider = function ({ sliderSelector = '.glider' } = {}) {
  const els = document.querySelectorAll(sliderSelector);

  els.forEach(el => {
    makeGlider(el);
  });
}

export default initGlider;