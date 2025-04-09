import { Link } from 'react-router-dom';


const toggleMenu = () => {
	const ham = document.querySelector('#js-hamburger');
	const nav = document.querySelector('#js-nav');
	if (ham === null || nav === null) return;
  ham.classList.toggle('active');
  nav.classList.toggle('active');
}

function Header() {
	return (
		<header>
			<div className="header__inner">
				<h1 className="header__title header-title">
					<a href="#">くるぴろ</a>
				</h1>
				<nav className="header__nav nav" id="js-nav">
					<ul className="nav__items nav-items">
						<li className="nav-items__item"><Link to="" onClick={toggleMenu}>トップ</Link></li>
						<li className="nav-items__item"><Link to="disclaimer" onClick={toggleMenu}>免責事項</Link></li>
					</ul>
				</nav>
				<button className="header__hamburger hamburger" id="js-hamburger" onClick={toggleMenu}>
					<span></span>
					<span></span>
					<span></span>
				</button>
			</div>
		</header>
	)
}

export default Header;
