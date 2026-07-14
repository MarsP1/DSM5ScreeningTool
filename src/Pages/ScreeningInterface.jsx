import { Link } from "react-router-dom"

import BackArrow from "../Components/BackArrow.jsx";

function ScreeningInterface() {

  return (
    <div>
      <Link to={"/PreScreener"}>
        <button >pre-screening</button>
      </Link>

      <Link to={"/Screener"}>
        <button>screening</button>
        </Link>
      
        
      
    </div>
  );
}
export default ScreeningInterface;