import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { ELang, EMessageType, IPluginMessage, ITranslation, IUiMessage } from './models';
import debounce from 'lodash.debounce';

import './index.css';

interface IState {
    translation: ITranslation;
    suggestedTranslation: ITranslation;
    currentLang: ELang;
    showUI: boolean
}

const defaultState: IState = {
    translation: {
        AZ: '',
        RU: '',
        EN: '',
    },
    suggestedTranslation:  {
        AZ: '',
        RU: '',
        EN: '',
    },
    currentLang: null,
    showUI: false,
};

class App extends React.PureComponent<{}, IState> {
    constructor (props) {
        super(props);
        this.state = defaultState;
        this.onSave = debounce(this.onSave, 1300)
    }

    componentDidMount () {
        window.addEventListener('message', this.onMessage);
    }

    componentWillUnmount () {
        window.removeEventListener('message', this.onMessage);
    }

    sendMessageToPlugin = (pluginMessage: IUiMessage) => {
        parent.postMessage({ pluginMessage }, '*');
    };

    handleInputChange = (event) => {
        event.persist();

        this.setState(
            (state) => ({
                translation: {
                    ...state.translation,
                    [event.target.id]: event.target.value
                }
            }),
            () => this.onSave()
        );
    };

    handleSuggestedTranslationClick = (translation: string, lang: string) => {
        this.setState(
            (state) => ({
                translation: {
                    ...state.translation,
                    [lang]: translation
                }
            }),
            () => this.onSave()
        );
    };

    handleInputClearButtonClick = (lang: ELang) => {
        this.setState((state) => ({
            translation: {
                ...state.translation,
                [lang]: ''
            }
        }));
    };

    onMessage = (event) => {
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

    getTranslationsFromPluginMessage = (pluginMessage: IPluginMessage) => {
        const { translation, nodeText, currentLang, suggestedTranslation } = pluginMessage;
        if (nodeText) {
            this.setState(
                (state: IState) => ({
                    showUI: true,
                    translation: translation || (
                        currentLang && nodeText
                            ? {...defaultState.translation, [currentLang]: nodeText}
                            : defaultState.translation
                    ),
                    currentLang: currentLang || state.currentLang,
                    suggestedTranslation: suggestedTranslation
                })
            );
        }
    };

    hideUI = () => {
        this.setState({
            showUI: false,
            suggestedTranslation: defaultState.suggestedTranslation,
            translation: defaultState.translation
        })
    };

    onLangChange = (lang: ELang) => {
        this.setState(
            { currentLang: lang },
            () => this.sendMessageToPlugin({
                type: EMessageType.SET_CURRENT_LANGUAGE,
                lang: this.state.currentLang
            }));
    };

    onSave = () => {
        const { translation } = this.state;

        this.sendMessageToPlugin({
            type: EMessageType.PUT_TRANSLATION,
            translation
        });
    };

    render () {
        const { currentLang, showUI, translation, suggestedTranslation } = this.state;
        let content: JSX.Element = (
            <div className="error-panel">
                <h1>This is not text element</h1>
                <img src={require('./sorry.jpg')} className="error-img"/>
                <p>Please select text node to add translations</p>
            </div>
        );

        if (showUI) {
            content = (
                <>
                    <div className="languages">
                        {Object.keys(ELang).map((lang) => (
                            <button
                                key={`lang-button-${lang}`}
                                onClick={() => this.onLangChange(ELang[lang])}
                                className={`lang-button ${ELang[lang] === currentLang ? 'lang-button-active' : ''}`}
                            >
                                {ELang[lang]}
                            </button>
                        ))}
                    </div>
                    <div className="translations">
                        {Object.keys(ELang).map((lang) => (
                            <div key={`translation-box-${lang}`} className="translation-box">
                                <div className="lang-input-box">
                                    <span className="lang-input-label">{ELang[lang]}</span>
                                    <input
                                        id={ELang[lang]}
                                        type="text"
                                        value={translation[lang]}
                                        onChange={this.handleInputChange}
                                        className="lang-input"
                                    />
                                    <button className="lang-input-clear-button"
                                            onClick={() => this.handleInputClearButtonClick(ELang[lang])}><>&times;</>
                                    </button>
                                </div>
                                <div className="suggested-translation-box">
                                    {!translation[lang] && suggestedTranslation && suggestedTranslation[lang] && (
                                        <span>
                                        Maybe <a href="#" className="suggested-translation" onClick={() => this.handleSuggestedTranslationClick(suggestedTranslation[lang], lang)}>{suggestedTranslation[lang]}</a>?
                                    </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            );
        }

        return <div className="wrapper">{content}</div>;
    }
}

ReactDOM.render(<App/>, document.getElementById('react-page'));