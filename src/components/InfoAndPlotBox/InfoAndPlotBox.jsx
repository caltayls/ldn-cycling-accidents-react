import LineAndBar from "../LineAndBar/LineAndBar";

export default function InfoAndPlotBox({ boroHover, csvData }) {

    return (
        <>

        <div className="plot">
            <LineAndBar csvData={csvData}></LineAndBar>    
        </div> 
        </>
        
    )

}

// for all boros create a line chart with a staked bar chart