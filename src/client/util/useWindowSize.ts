import { useEffect, useState } from "react";

export const useWindowSize = () => {
    const [size, setSize] = useState({width: window.innerWidth, height: window.innerHeight});
    useEffect(() => {
        const listener = () =>{
            setSize({width: window.innerWidth, height: window.innerHeight});
         };
        window.addEventListener("resize", listener);
        return () => {
            window.removeEventListener("resize", listener);
        }
    });
    return size;
}