import React, { useState } from 'react';


export default function RestHeader (props) {
    const [method, setMethod] = useState(props.method);
    const [endpoint, setEndpoint] = useState(props.endpoint);

    let color = "#000000";

    switch (method.toUpperCase()) {
        case "GET":
            color = "#0d8d67";
            break;
        case "POST":
            color = "#026aca";
            break;
        case "PUT":
            color = "#604aa2";
            break;
        case "DELETE":
            color = "#b91926";
            break;
        default:
            color = "#000000";
    }

    return (
        <div>
            <div style={{display: "inline-block", background: color, fontSize: "0.6em", borderRadius: "10px", color: "#ffffff", padding: "0.3em 1em", height: "100%", verticalAlign: "middle"}}>
                <span>{method.toUpperCase()}</span>
            </div>
            <span style={{fontWeight: "bold", marginLeft: "0.5em"}}>  {endpoint}</span>
        </div>
    )
}
