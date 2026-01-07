import { Link } from 'react-router-dom';
import Herosection from "../components/Herosection"
import MetaTags from '../components/MetaTags';

const Home = () => {

  return (
    <div className="animate-fade-in">
      <MetaTags 
        title="Remove Backgrounds Instantly | Free AI Background Remover - Removeio"
        description="Remove image backgrounds instantly with AI. 100% FREE, no signup required."
      />
        <Herosection />
    </div>
  );
};

export default Home;