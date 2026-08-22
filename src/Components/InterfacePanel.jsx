import { Link } from "react-router-dom"



function InterfacePanel() {

  return (
    <div>
        <div class="interfacePanel">
            <ul class="interfaceList">
                <li><Link to="/PreScreener"><strong>Pre-Screening</strong></Link></li>
                <li><Link to="/Screener"><strong>Screening</strong></Link></li>
                <li><Link to="/Records"><strong>Records</strong></Link></li> 

            </ul>
        </div>
    </div>
  );
}

export default InterfacePanel;