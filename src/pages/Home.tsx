import hives from '../assets/bikupor_träd.jpg';
import '../pages/Home.scss'

const Home = () => {
  return (
    <div className="home-container">
      <h1>Välkommen till Visingsöbiodlarna!</h1>

      <img className='start-image' src={hives} alt="bikupor under träd på en äng" />
      <div className="info-text">
        <p>
          Visingsöbiodlarna är en ideell förening som samlar öns biodlare för att främja kunskapsutbyte, gemenskap och hållbar biodling. 
          På Visingsö bedrivs biodling i en unik miljö med närhet till natur och pollinerrika landskap. Vi är för tillfället 17 aktiva biodlare på ön som delar på ca 92 kupor.
        </p>
        <p>
          Föreningen ansvarar även för en godkänd parningsstation för Ligusticaföreningen, vilket ger möjlighet till kontrollerad parning av drottningar i en skyddad zon. 
          Detta bidrar till friska och starka bisamhällen med goda egenskaper.
        </p>
        <p>
          Genom vår digitala plattform kan medlemmar enkelt hantera sina bigårdar, rapportera data och ta del av nyheter, evenemang och dokument från föreningen.
        </p>
      </div>
    </div>
  )
}

export default Home
