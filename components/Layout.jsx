import Link from 'next/link'


// margin for the links in the menu
const linkStyle = {
  marginRight: 15
}

//Styling for the menu

const menuStyle = {
  float: 'left',
  width: '25%',
  padding: '1%',
  //height: '200 px',
  border: 'solid',
}

/* styling for ScrollMenu*/
const scrollStyle = {
  overflow: 'scroll',
  float: 'right',
  width: '69%',
  padding: '1%',
  height: '100vh',
  border: 'solid',

}

//function for generating the menu

const Scroll = () => {
  <div style={scrollStyle} >


  </div>

};


const Menu = () => (
  <div style={menuStyle}>
    <ul>
      <Link href="/">
        <a style={linkStyle}>Startsida</a>
      </Link>
    </ul>
    <ul>
      <Link href="/create contract">
      <a style={linkStyle}>Skapa avtal</a>
      </Link>
    </ul>
    <ul>
      <Link href="/filledContracts">
      <a style={linkStyle}>Ifyllda avtal</a>
      </Link>
    </ul>
    <ul>
      <Link href="/condition manager">
      <a style={linkStyle}>Villkorsskapare</a>
      </Link>
    </ul>
  </div>
)



export default Menu
