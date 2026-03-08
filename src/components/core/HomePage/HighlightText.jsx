import React from "react";

const HighlightText = ({ text }) => {
    return (
        <span className="inline-block font-bold
      bg-[linear-gradient(90deg,#22d3ee,#38bdf8,#3b82f6)]
      bg-clip-text text-transparent">
            
            {text}
        </span>
    );
};

export default HighlightText;
