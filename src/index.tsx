import merge from "lodash.merge";
import { render } from "react-dom";
import { Provider } from "react-redux";

import { store } from "./store/store";
import { WebchatWidget } from "./components/WebchatWidget";
import { sessionDataHandler } from "./sessionDataHandler";
import { initConfig } from "./store/actions/initActions";
import { ConfigState } from "./store/definitions";
import { initLogger } from "./logger";

const defaultConfig: ConfigState = {
    serverUrl: "http://localhost:3001",
    theme: {
        isLight: true
    },
    fileAttachment: {
        enabled: true,
        maxFileSize: 16777216, // 16 MB
        acceptedExtensions: ["jpg", "jpeg", "png", "amr", "mp3", "mp4", "pdf", "txt"]
    },
    transcript: {
        downloadEnabled: true,
        emailEnabled: true,
        emailSubject: (agentNames) => {
            let subject = "Transcript of your chat";
            if (agentNames.length > 0) {
                subject = subject.concat(` with ${agentNames[0]}`);
                agentNames.slice(1).forEach((name) => (subject = subject.concat(` and ${name}`)));
            }
            return subject;
        },
        emailContent: (customerName, transcript) => {
            return `Hello ${customerName}.\n\nPlease see below your transcript, with any associated files attached, as requested.\n\n${transcript}`;
        }
    }
};

const initWebchat = async (config: ConfigState) => {
    const mergedConfig = merge({}, defaultConfig, config);
    sessionDataHandler.setEndpoint(mergedConfig.serverUrl);
    store.dispatch(initConfig(mergedConfig));
    initLogger();
    const rootElement = document.getElementById("twilio-webchat-widget-root");

    render(
        <Provider store={store}>
            <WebchatWidget />
        </Provider>,
        rootElement
    );
};

declare global {
    interface Window {
        Twilio: {
            initWebchat: (config: ConfigState) => void;
        };
    }
}

// Expose `initWebchat` function to window object
Object.assign(window, {
    Twilio: {
        initWebchat
    }
});
