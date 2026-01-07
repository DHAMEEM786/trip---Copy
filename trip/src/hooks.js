import { useEffect, useState } from 'react';

const usePageTitle = (title) => {
    useEffect(() => {
        document.title = title;
    }, [title]);
};

const usePageStyle = (href) => {
    useEffect(() => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);

        return () => {
            document.head.removeChild(link);
        }
    }, [href]);
}

const useScript = (src) => {
    const [status, setStatus] = useState(src ? "loading" : "idle");

    useEffect(() => {
        if (!src) {
            setStatus("idle");
            return;
        }

        let script = document.querySelector(`script[src="${src}"]`);

        if (!script) {
            script = document.createElement("script");
            script.src = src;
            script.async = true;
            script.setAttribute("data-status", "loading");
            document.body.appendChild(script);

            const setAttributeFromEvent = (event) => {
                script.setAttribute(
                    "data-status",
                    event.type === "load" ? "ready" : "error"
                );
            };

            script.addEventListener("load", setAttributeFromEvent);
            script.addEventListener("error", setAttributeFromEvent);
        } else {
            setStatus(script.getAttribute("data-status"));
        }

        const setStateFromEvent = (event) => {
            setStatus(event.type === "load" ? "ready" : "error");
        };

        script.addEventListener("load", setStateFromEvent);
        script.addEventListener("error", setStateFromEvent);

        return () => {
            if (script) {
                script.removeEventListener("load", setStateFromEvent);
                script.removeEventListener("error", setStateFromEvent);
            }
        };
    }, [src]);

    return status;
};

export { usePageTitle, usePageStyle, useScript };
