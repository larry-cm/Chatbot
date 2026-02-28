import { useEffect, RefObject } from "react";

/**
 * Hook that alerts clicks outside of the passed ref
 */
export function useClickOutside(ref: RefObject<HTMLElement | null>, handler: () => void) {
    useEffect(() => {
        /**
         * Alert if clicked on outside of element
         */
        function handleClickOutside(event: PointerEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                handler();
            }
        }
        // Bind the event listener
        document.addEventListener("pointerdown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("pointerdown", handleClickOutside);
        };
    }, [ref, handler]);
}
