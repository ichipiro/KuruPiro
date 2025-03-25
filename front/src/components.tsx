// function toggleMenu(): void {
// 	const ham = document.querySelector('#js-hamburger');
// 	const nav = document.querySelector('#js-nav');
// 	if (ham === null || nav === null) return;
//   ham.classList.toggle('active');
//   nav.classList.toggle('active');
// }

export function Header(): JSX.Element {
	return (
		<header>
			<div className="header__inner">
				<h1 className="header__title header-title">
					<a href="#">くるぴろ</a>
				</h1>
				{/* <nav className="header__nav nav" id="js-nav">
					<ul className="nav__items nav-items">
						<li className="nav-items__item"><a href="">メニュー</a></li>
						<li className="nav-items__item"><a href="">メニュー</a></li>
						<li className="nav-items__item"><a href="">メニュー</a></li>
						<li className="nav-items__item"><a href="">メニュー</a></li>
					</ul>
				</nav>
				<button className="header__hamburger hamburger" id="js-hamburger" onClick={toggleMenu}>
					<span></span>
					<span></span>
					<span></span>
				</button> */}
			</div>
		</header>
	)
}


export function Footer(): JSX.Element {
	return (
		<footer>
			<span>&copy; 2025 いちぴろ・エクスプローラ.</span>
		</footer>
	)
}
