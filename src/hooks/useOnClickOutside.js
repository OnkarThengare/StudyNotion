import { useEffect } from "react";

// This hook detects clicks outside of the specified component and call the provided handler fucntion
export default function useOnClickOutside(ref, handler) {
    useEffect(() => {
        // If the clcik/touch function to be called on click/touch events
        const listener = (event) => {
            // if the click/touch event orginated inside the ref element, do nothing
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            }
            // Otherwise, call the provided handler function
            handler(event);
        };

        // Add event listener for mousedown and touchstart events on the document
        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);

        // cleanup function to remover the event listener when the component unmounts or when the ref/handler dependencies change
        return () => {
            document.removeEventListener("mousedown", listener);
            document.removeEventListener("touchstart", listener);
        };
    }, [ref, handler]); // Only run this effect when the ref or handler function changes
}