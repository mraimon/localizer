import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ELang, EMessageType } from './models';
import debounce from 'lodash.debounce';
import './index.css';
const defaultState = {
    translation: {
        AZ: '',
        RU: '',
        EN: '',
    },
    suggestedTranslation: {
        AZ: '',
        RU: '',
        EN: '',
    },
    currentLang: null,
    showUI: false,
};
class App extends React.PureComponent {
    constructor(props) {
        super(props);
        this.sendMessageToPlugin = (pluginMessage) => {
            parent.postMessage({ pluginMessage }, '*');
        };
        this.handleInputChange = (event) => {
            event.persist();
            this.setState((state) => ({
                translation: Object.assign({}, state.translation, { [event.target.id]: event.target.value })
            }), () => this.onSave());
        };
        this.handleSuggestedTranslationClick = (translation, lang) => {
            this.setState((state) => ({
                translation: Object.assign({}, state.translation, { [lang]: translation })
            }), () => this.onSave());
        };
        this.handleInputClearButtonClick = (lang) => {
            this.setState((state) => ({
                translation: Object.assign({}, state.translation, { [lang]: '' })
            }));
        };
        this.onMessage = (event) => {
            const { data: { pluginMessage } } = event;
            switch (pluginMessage.type) {
                case EMessageType.SEND_CURRENT_NODE:
                    this.getTranslationsFromPluginMessage(pluginMessage);
                    break;
                case EMessageType.NO_CURRENT_NODE:
                    this.hideUI();
                    break;
                default:
                    break;
            }
        };
        this.getTranslationsFromPluginMessage = (pluginMessage) => {
            const { translation, nodeText, currentLang, suggestedTranslation } = pluginMessage;
            if (nodeText) {
                this.setState((state) => ({
                    showUI: true,
                    translation: translation || (currentLang && nodeText
                        ? Object.assign({}, defaultState.translation, { [currentLang]: nodeText }) : defaultState.translation),
                    currentLang: currentLang || state.currentLang,
                    suggestedTranslation: suggestedTranslation
                }));
            }
        };
        this.hideUI = () => {
            this.setState({
                showUI: false,
                suggestedTranslation: defaultState.suggestedTranslation,
                translation: defaultState.translation
            });
        };
        this.onLangChange = (lang) => {
            this.setState({ currentLang: lang }, () => this.sendMessageToPlugin({
                type: EMessageType.SET_CURRENT_LANGUAGE,
                lang: this.state.currentLang
            }));
        };
        this.onSave = () => {
            const { translation } = this.state;
            this.sendMessageToPlugin({
                type: EMessageType.PUT_TRANSLATION,
                translation
            });
        };
        this.state = defaultState;
        this.onSave = debounce(this.onSave, 1300);
    }
    componentDidMount() {
        window.addEventListener('message', this.onMessage);
    }
    componentWillUnmount() {
        window.removeEventListener('message', this.onMessage);
    }
    render() {
        const { currentLang, showUI, translation, suggestedTranslation } = this.state;
        let content = (React.createElement("div", { className: "error-panel" },
            React.createElement("h1", null, "This is not text element"),
            React.createElement("img", { src: require('./sorry.jpg'), className: "error-img" }),
            React.createElement("p", null, "Please select text node to add translations")));
        if (showUI) {
            content = (React.createElement(React.Fragment, null,
                React.createElement("div", { className: "languages" }, Object.keys(ELang).map((lang) => (React.createElement("button", { key: `lang-button-${lang}`, onClick: () => this.onLangChange(ELang[lang]), className: `lang-button ${ELang[lang] === currentLang ? 'lang-button-active' : ''}` }, ELang[lang])))),
                React.createElement("div", { className: "translations" }, Object.keys(ELang).map((lang) => (React.createElement("div", { key: `translation-box-${lang}`, className: "translation-box" },
                    React.createElement("div", { className: "lang-input-box" },
                        React.createElement("span", { className: "lang-input-label" }, ELang[lang]),
                        React.createElement("input", { id: ELang[lang], type: "text", value: translation[lang], onChange: this.handleInputChange, className: "lang-input" }),
                        React.createElement("button", { className: "lang-input-clear-button", onClick: () => this.handleInputClearButtonClick(ELang[lang]) },
                            React.createElement(React.Fragment, null, "\u00D7"))),
                    React.createElement("div", { className: "suggested-translation-box" }, !translation[lang] && suggestedTranslation && suggestedTranslation[lang] && (React.createElement("span", null,
                        "Maybe ",
                        React.createElement("a", { href: "#", className: "suggested-translation", onClick: () => this.handleSuggestedTranslationClick(suggestedTranslation[lang], lang) }, suggestedTranslation[lang]),
                        "?")))))))));
        }
        return React.createElement("div", { className: "wrapper" }, content);
    }
}
ReactDOM.render(React.createElement(App, null), document.getElementById('react-page'));
