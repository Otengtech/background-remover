import { Link } from 'react-router-dom';
import Herosection from "../components/Herosection"
import About from "../components/About"

const Home = () => {

  return (
    <div className="animate-fade-in">
        <Herosection />
        <About />
    </div>
  );
};

export default Home;