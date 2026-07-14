import { Link } from "react-router-dom"

import BackArrowImage from "../assets/BackArrow.svg";

function BackArrow() {

  return (
    <div>
        <Link to={"/"}>
            <button className="ButtonBackArrow">
                <img 
                    src={BackArrowImage} 
                    className="ImageBackArrow"
                />
            </button>
        </Link>
    </div>
  );
}

export default BackArrow;