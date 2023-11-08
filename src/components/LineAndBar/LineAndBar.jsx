import { useEffect, useRef } from "react"

export default function LineAndBar({ csvData }) {
    const svgRef = useRef(null);

    useEffect(() => {

    })

    return (
        <svg id="line-and-bar">
            <g ref={svgRef}></g>
        </svg>
    )
}