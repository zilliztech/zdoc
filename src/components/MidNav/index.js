import React, { useState } from 'react';
import Link from '@docusaurus/Link';

const Buttons = [
    {
        caption: "Home",
        Svg: require('@site/static/img/home.svg').default,
        link: "/",
    },
    {
        caption: "Guides",
        Svg: require('@site/static/img/guides.svg').default,
        link: "/docs/zilliz-cloud-101",
    },
    {
        caption: "API Reference",
        Svg: require('@site/static/img/apiref.svg').default,
        link: "/reference",
    },
    // {
    //     caption: "讨论",
    //     Svg: require('@site/static/img/discussion.svg').default,
    //     link: "/discussion",
    // }

]

const SearchIcon = require('@site/static/img/search.svg').default

function MidNavBtn({Svg, caption, link}) {
    const [hover, setHover] = useState(false)

    const handleMouseEnter = () => {
        setHover(true)
    }

    const handleMouseLeave = () => {
        setHover(false)
    }
        
    const boxStyle = {
        width: "auto", 
        height: "28px", 
        padding: "0 10px",
        cursor: "pointer",
        borderRadius: "5px",
        display: "inline-grid", 
        gridTemplateColumns: "15px auto", 
        gridColumnGap: "5px",
        backgroundColor: hover ? "#E0E3E7" : "transparent",
    }

    const linkStyle = {
        color: "#000000", 
        textDecoration: "none", 
        fontSize: "0.95em"
    }

    return (
        <div 
            style={boxStyle}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div style={{marginTop: "2px"}}>
                <Svg style={{width: "14px", height: "14px"}} role="img" />
            </div>
            <div style={{display: "inline-block", width: "auto", whiteSpace: "nowrap"}}>
                <span style={{fontSize: "0.9em"}}><Link style={linkStyle} to={link}>{caption}</Link></span>
            </div>
        </div>
    )
}

export default function MidNav() {
    return (
        <section style={{display: "inline-grid", height: "50px", width: "100%", gridTemplateColumns: "15% 45% 30% 10%", paddingTop: "11px", borderBottom: "1px solid #E8EAEE", backgroundColor: "#FFFFFF"}}>
            <div></div>
            <div style={{display: "flex", flexDirection: "row", gap: "10px"}}>
                <div><span style={{fontSize: "0.9em", fontWeight: "bold", marginRight: "20px"}}>v2.0.0</span></div>
                {Buttons.map((props, idx) => (
                    <MidNavBtn key={idx} {...props} />
                ))}
            </div>
            {/* <div style={{position: "relative"}}>
                <div style={{position: "absolute", right: "10px"}}>
                    <div style={{display: "inline-grid", gridTemplateColumns: "15px auto", cursor: "pointer", gridColumnGap: "5px", width: "156px", height: "28px", Top: "11px", border: "1px solid #D1D6DC", borderRadius: "5px", padding: "0 10px"}}>
                        <div style={{marginTop: "2px"}}>
                            <SearchIcon style={{width: "14px", height: "14px"}} role="img" />
                        </div>
                        <div>
                            <span style={{ fontSize: "0.9em", fontColor: "#D1D6DC"}}>Search</span>
                        </div>
                    </div>
                </div>
            </div> */}
            <div></div>
        </section>
    )
}