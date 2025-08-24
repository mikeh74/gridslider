# GridSlider

**GridSlider** is a lightweight JavaScript library for creating responsive, touch-friendly, and accessible slider/carousel components using modern CSS Grid. It is framework-agnostic and easy to style or extend.

---

## Features

- Pure JavaScript, no dependencies
- Uses CSS Grid for layout
- Responsive and mobile-friendly
- Supports multiple sliders per page
- Customizable pager (pagination dots)
- Smooth scrolling and snapping
- Easy to theme with CSS/SCSS
- Accessible (keyboard navigation, ARIA labels)

---

## Demo

Check out the [live demo](./demo/index.html) for a working example.

---

## Installation

Clone or download this repository, then include the files in your project:

```html
<link rel="stylesheet" href="theme.css">
<script type="module" src="index.js"></script>
```

---

## Usage

Add the required HTML structure:

```html
<div class="glider glider-mq">
	<div class="glider-grid">
		<div class="glider-grid-item">1</div>
		<div class="glider-grid-item">2</div>
		<!-- ...more items... -->
	</div>
	<div class="glider-pager"></div>
</div>
```

Then initialize in your JS:

```js
import initGlider from './index.js';
initGlider();
```

---

## API

### `initGlider({ sliderSelector })`

- `sliderSelector` (optional): CSS selector for glider containers (default: `.glider`)

Each glider instance exposes methods:

- `getNumberOfItems()` — total items
- `getNumberOfItemsFullyVisible()` — items fully visible in viewport
- `getNumberOfPages()` — total pages
- `updatePager()` — re-renders pager
- `updateActivePage()` — updates active pager dot

---

## Theming & Styling

Customize the look via `theme.scss` or override CSS variables:

```css
:root {
	--glider-spacing: 1rem;
	--glider-peek: 0.5;
	/* ... */
}
```

You can also add your own classes or media queries for different layouts.

---

## Example

See `index.html` for a working demo:

```html
<div class="glider glider-mq">
	<div class="glider-grid">
		<div class="glider-grid-item">1</div>
		<div class="glider-grid-item">2</div>
		<div class="glider-grid-item">3</div>
		<!-- ... -->
	</div>
	<div class="glider-pager"></div>
</div>
```

---

## Development

- Build CSS: `npm run build`
- Watch SCSS: `npm run watch`

---

## License

MIT © M Horrocks

