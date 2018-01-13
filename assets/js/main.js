const nav = document.querySelector('#sideMenu');
const nav_links = nav.querySelectorAll('a');
const item_stocks = document.querySelectorAll('.item-stock button');

function openNav() {
	let animationStartTime = 0;
	let animationDuration = 300;
	
	this.startAnimation = () => {
		animationStartTime = Date.now();
		requestAnimationFrame(update);
	};

	function update() {
		let currentTime = Date.now();
		let positionInAnimation = (currentTime - animationStartTime) / animationDuration;
		let value = -(100-positionInAnimation*100);
		value = (value > 0) ? 0 : value;
		nav.style.transform = `translateY(${value}%)`;

	    if (positionInAnimation <= 1)
	      requestAnimationFrame(update);
		}
}
function closeNav() {
	let animationStartTime = 0;
	let animationDuration = 300;
	
	this.startAnimation = () => {
		animationStartTime = Date.now();
		requestAnimationFrame(update);
	};

	function update() {
		let currentTime = Date.now();
		let positionInAnimation = (currentTime - animationStartTime) / animationDuration;
		let value = -(positionInAnimation*100);
		value = (value < -100) ? -100 : value;
		nav.style.transform = `translateY(${value}%)`;

	    if (positionInAnimation <= 1)
	      requestAnimationFrame(update);
		}
}

let navtoggle = document.querySelector('.navtoggle');
navtoggle.addEventListener('click', ()=> {
	navtoggle.classList.toggle('navin');
});
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