const nav = document.querySelector('#sideMenu');
const nav_links = nav.querySelectorAll('a');
const item_stocks = document.querySelectorAll('.item-stock button');
const user_area = document.querySelector('.user-area');
const user_area_a = user_area.querySelectorAll('a');
const user_tools = user_area.querySelectorAll('.user-tools');
let tools_index = 0;

for(let link of user_area_a) {
	link.nextElementSibling.style.visibility = 'hidden';
	link.addEventListener('click', function() {
		if(link.nextElementSibling.style.visibility === 'hidden'){
			user_tools.forEach((tool) => {
				tool.style.visibility = 'hidden';
			});
			link.nextElementSibling.style.visibility = 'visible';
		}
		else
			link.nextElementSibling.style.visibility = 'hidden';
	});
}

// Shim for requestAnimationFrame from Paul Irishpaul ir
// http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function(){
	'use strict';

	return  window.requestAnimationFrame       ||
	        window.webkitRequestAnimationFrame ||
	        window.mozRequestAnimationFrame    ||
	        function( callback ){
	          window.setTimeout(callback, 1000 / 60);
	        };
})();

/* // [START pointereventsupport] */
var pointerDownName = 'pointerdown';
var pointerUpName = 'pointerup';
var pointerMoveName = 'pointermove';

if(window.navigator.msPointerEnabled) {
	pointerDownName = 'MSPointerDown';
	pointerUpName = 'MSPointerUp';
	pointerMoveName = 'MSPointerMove';
}

// Simple way to check if some form of pointerevents is enabled or not
window.PointerEventsSupport = false;
if(window.PointerEvent || window.navigator.msPointerEnabled) {
	window.PointerEventsSupport = true;
}
/* // [END pointereventsupport] */

function SwipeSideMenu() {
	'use strict';

	// Scope state variables
	let STATE_DEFAULT = 1;
	let STATE_TOP = 2;

	let swipeSideMenu = nav;
	let rafPending = false;
	let initialTouchPos = null;
	let lastTouchPos = null;
	let currentYPosition = 0;
	let currentState = STATE_DEFAULT;
	let handleSize = 10;

	// Perform client height here as this can be expensive and doens't change util windwo.onresize
	let sideHeight = swipeSideMenu.clientHeight;
	let slopValue = sideHeight * (1/4);

	// On resize, change the slop value
	this.resize = function() {
		sideHeight = swipeSideMenu.clientHeight;
		slopValue = sideHeight * (1/4);
	};

	/* // [START handle-start-gesture] */
	// Handle the start of gestures
	this.handleGestureStart = function(evt) {
		evt.preventDefault();

		if(evt.touches && evt.touches.length > 1) {
			return;
		}

		// Add the move and end listeners
		if(window.PointerEvent) {
			evt.target.setPointerCapture(evt.pointerId);
		} else {
			// Add Mouse Listeners
			document.addEventListener('mousemove', this.handleGestureMove, true);
			document.addEventListener('mouseup', this.handleGestureEnd, true);
		}

		initialTouchPos = getGesturePointFromEvent(evt);

		swipeSideMenu.style.transition = 'initial';
	}.bind(this);
	/* // [END handle-start-gesture] */

	// Handle move gestures
	// 
	/* // [START handle-move] */
	this.handleGestureMove = function(evt) {
		evt.preventDefault();

		if(!initialTouchPos) {
			return;
		}

		lastTouchPos = getGesturePointFromEvent(evt);

		if(rafPending) {
			return;
		}

		rafPending = true;

		window.requestAnimFrame(onAnimFrame);
	}.bind(this);
	/* // [END handle-move] */

	/* // [START handle-end-gesture] */
	// Handle end gestures
	this.handleGestureEnd = function(evt) {
		evt.preventDefault();

		if(evt.touches && evt.touches.length > 0) {
			return;
		}

		rafPending = false;

		// Remove Event Listeners
		if(window.PointerEvent) {
			evt.target.releasePointerCapture(evt.pointerId);
		} else {
			// Remove Mouse Listeners
			document.removeEventListener('mousemove', this.handleGestureMove, true);
			document.removeEventListener('moveup', this.handleGestureEnd, true);
		}

		updateSwipeRestPostion();

		initialTouchPos = null;
	}.bind(this);
	/* // [END handle-end-gesture] */

	function updateSwipeRestPostion() {
		let differenceInY = initialTouchPos.y - lastTouchPos.y;
		currentYPosition = currentYPosition - differenceInY;

		// Go to the default
		let newState = STATE_DEFAULT;

		// Check if we need to change state to top based on slop value
		if(Math.abs(differenceInY) > slopValue) {
			if(currentState === STATE_DEFAULT) {
				newState = STATE_TOP;
			}
		} else {
			newState = currentState;
		}

		changeState(newState);

		swipeSideMenu.style.transition = 'all 150ms ease-out';
	}

	function changeState(newState) {
		let transformStyle;
		switch(newState) {
			case STATE_DEFAULT:
				currentYPosition = 0;
				break;
			case STATE_TOP:
				currentYPosition = -(sideHeight - handleSize);
				break;
		}

		transformStyle = `translateY(${currentYPosition})px`;

		swipeSideMenu.style.msTransform = transformStyle;
		swipeSideMenu.style.MozTransform = transformStyle;
		swipeSideMenu.style.webkitTransform = transformStyle;
		swipeSideMenu.style.transform = transformStyle;

		currentState = newState;
	}

	function getGesturePointFromEvent(evt) {
		let point = {};

		if(evt.targetTouches) {
			point.x = evt.targetTouches[0].clientX;
			point.y = evt.targetTouches[0].clientY;
		} else {
			// Either Mouse event or Pointer Event
			point.x = evt.clientX;
			point.y = evt.clientY;
		}

		return point;
	}

	/* // [START on-anim-frame] */
	function onAnimFrame() {
		if(!rafPending) {
			return;
		}

		let differenceInY = initialTouchPos.y - lastTouchPos.y;

		let newYTransform = (currentYPosition - differenceInY)+'px';
		let transformStyle = `translateY(${newYTransform})`;
		swipeSideMenu.style.webkitTransform = transformStyle;
		swipeSideMenu.style.MozTransform = transformStyle;
		swipeSideMenu.style.msTransform = transformStyle;
		swipeSideMenu.style.transform = transformStyle;
		rafPending = false;
	}
	/* // [END on-anim-frame] */

	/* // [START addlisteners] */
	// check if pointer events are supported.
	if(window.PointerEvent) {
		// Add Pointer Event Listener
		swipeSideMenu.addEventListener('pointdown', this.handleGestureStart, true);
		swipeSideMenu.addEventListener('pointmove', this.handleGestureMove, true);
		swipeSideMenu.addEventListener('pointup', this.handleGestureEnd, true);
		swipeSideMenu.addEventListener('pointcancel', this.handleGestureEnd, true);
	} else {
		// Add Touch Listener
          swipeFrontElement.addEventListener('touchstart', this.handleGestureStart, true);
          swipeFrontElement.addEventListener('touchmove', this.handleGestureMove, true);
          swipeFrontElement.addEventListener('touchend', this.handleGestureEnd, true);
          swipeFrontElement.addEventListener('touchcancel', this.handleGestureEnd, true);

		// Add Mouse Listener
		swipeFrontElement.addEventListener('mousedown', this.handleGestureStart, true);
	}
	/* // [END addlisteners] */
}


// window width <= 768px, will load this snippet for the plug animation
if(window.innerWidth <= 768) {
	function openNav() {
		let animationStartTime = 0;
		let animationDuration = 300;
		
		this.startAnimation = () => {
			animationStartTime = Date.now();
			// nav.style.opacity = 1;
			requestAnimFrame(update);
		};

		function update() {
			let currentTime = Date.now();
			let positionInAnimation = (currentTime - animationStartTime) / animationDuration;
			let value = -(100-positionInAnimation*100);
			value = (value > 0) ? 0 : value;
			nav.style.transform = `translateY(${value}%)`;

		    if (positionInAnimation <= 1)
		      requestAnimFrame(update);
			}
	}
	function closeNav() {
		let animationStartTime = 0;
		let animationDuration = 300;
		
		this.startAnimation = () => {
			animationStartTime = Date.now();
			requestAnimFrame(update);
		};

		function update() {
			let currentTime = Date.now();
			let positionInAnimation = (currentTime - animationStartTime) / animationDuration;
			let value = -(positionInAnimation*100);
			value = (value < -100) ? -100 : value;
			nav.style.transform = `translateY(${value}%)`;

		    if (positionInAnimation <= 1)
		      requestAnimFrame(update);
		  	// else
		  		// nav.style.opacity = 0;
			}
	}

	let navtoggle = document.querySelector('.navtoggle');
	navtoggle.addEventListener('click', ()=> {
		navtoggle.classList.toggle('navin');
	});

	function plugAnimaEnd() {
		let nav = new openNav();
		nav.startAnimation();
		setTimeout(() => {navtoggle.classList.remove('navin');}, 500);
	}
	// Code for Chrome, Safari and Opera
	navtoggle.addEventListener('webkitAnimationEnd', () => {
		let nav = new openNav();
		nav.startAnimation();
		setTimeout(() => {navtoggle.classList.remove('navin');}, 500);
	});
	// Standard syntax
	navtoggle.addEventListener('animationend', () => {
		let nav = new openNav();
		nav.startAnimation();
		setTimeout(() => {navtoggle.classList.remove('navin');}, 500);
	});
}

for(let navL of nav_links) {
	navL.addEventListener('click', () => {
		nav.querySelector('.active').classList.remove('active');
		navL.classList.add('active');
		if(window.innerWidth <= 768) {
			setTimeout(() => {
				let nav = new closeNav();
				nav.startAnimation();
			}, 100);
		}
	});
}

for(let itemS of item_stocks) {
	itemS.addEventListener('click', () => {
		document.querySelector('.item-stock button.active').classList.remove('active');
		itemS.classList.add('active');
	});
}

// var dataWorker = new Worker("./assets/js/sort-worker.js");
// dataWorker.postMessage([1,2,3]);

// // The main thread is now free to continue working on other things...

// dataWorker.addEventListener('message', function(evt) {
//    console.log(evt);
//    dataWorker.terminate();
//    // Update data on screen...
// });