import MultiLinePlot from "../MultiLinePlot/MultiLinePlot";
import StackedPlot from "../StackedPlot/StackedPlot";

export default function InfoAndPlotBox({ boroHover, csvData }) {

    return (
        <>

        <div className="plot">
            <StackedPlot csvData={csvData}></StackedPlot>    
            {/* <MultiLinePlot csvData={csvData}></MultiLinePlot> */}
        </div> 
        </>
        
    )

}

// for all boros create a line chart with a staked bar chart