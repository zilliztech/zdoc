import Link from '@docusaurus/Link'
import BrowserOnly from '@docusaurus/BrowserOnly'

export default function SignUpBtn(props) {
  return (
    <BrowserOnly>
        {() => {
            const path = window.location.pathname;
            const utm = `?utm_page=${path.replace(/^\//g, '')}&utm_button=doc_nav_right`

            return <Link to={props.href + utm} className="navbar__item navbar__link header-btn" >{props.label}</Link>
        }}
    </BrowserOnly>
  )
}