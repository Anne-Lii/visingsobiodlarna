import hives from '../assets/bikupor_träd.jpg';
import '../pages/Home.scss'

const Home = () => {
  return (
    <div className="home-container">
      <h1>Välkommen till Visingsöbiodlarna!</h1>

      <img className='start-image' src={hives} alt="bikupor under träd på en äng" />
      <div className="info-text">
        <p>
          På Visingsö odlas enbart bin av Ligustica-rasen alltsedan 1982 då ön fick status som renparningsområde för denna biras.
          Visingsö Biodlarförening samarbetar med Ligusticaföreningen och sköter öns parningsstation från maj till augusti. 
          Där paras 250-300 drottningar varje år med öns drönarbin.
        </p>
        <p>
          För att säkerställa goda avelsegenskaper följer vi ett 10-punktsprogram vid urval för avelsarbetet. 
          Vid en parningsstation tillämpas så kallas populationsparning, vilket innebär att alla bisamhällen inom parningsstationens flygområde deltar i avelsarbetet. 
          Detta ställer stora krav på öns alla biodlare att vidmakthålla goda avelsegenskaper hos samhällena.
        </p>
        <p>
          Som ett led i detta arbete genomförs en kalibreringsdag varje år då samtliga bisamhällen kontrolleras enligt en manual fastställd av Ligusticaföreningen.
        </p>
        <p>
          Vårt fokus ligger på varroakontroll med låga kvalsterantal, bra temperament, god övervintringsförmåga och bra immunförsvar mot virus.
        </p>
        <p>
          Vi är ett 20-tal biodlare med varierande erfarenhet och har sammanlagt ett 90-tal samhällen. Parningsstationen och några föreningsmedlemmar har sammanlagt ett 20-tal digitala kupvågar där man i sin mobil kan följa vikt och temperaturförändringar. (Kupvågarna är framtagna av Staffan Magnusson).
        </p>
        <p>
          Föreningen har i flera år haft och har fortfarande ett pollinationsuppdrag på äppelodlingarna i Torp på Visingsö.
        </p>
        <p>
          Visingsöbiodlarna har tilldelats både kommunens miljöpris och naturvårdspris.
        </p>
      </div>
    </div>
  )
}

export default Home
