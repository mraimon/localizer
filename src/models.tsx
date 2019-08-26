export enum EMessageType {
    SET_CURRENT_LANGUAGE = 'SET_CURRENT_LANGUAGE',
    PUT_TRANSLATION = 'PUT_TRANSLATION',
    SEND_CURRENT_LANGUAGE = 'SEND_CURRENT_LANGUAGE',
    NO_CURRENT_NODE = 'NO_CURRENT_NODE',
    SEND_CURRENT_NODE = 'SEND_CURRENT_NODE',
}
export enum ELocalStorageKey {
    LANG = 'LANG'
}
export enum ELang {
    AZ = 'AZ',
    RU = 'RU',
    EN = 'EN',
}

export enum ENodeType {
    TEXT = 'TEXT'
}

export interface ITranslation {
    AZ: string;
    RU: string;
    EN: string;
}

export interface IPluginMessage {
    type: EMessageType;
    currentLang?: ELang;
    translation?: ITranslation;
    suggestedTranslation?: ITranslation;
    translations?: ITranslation[],
    nodeText?: string;
}

export interface IUiMessage {
    type: EMessageType;
    lang?: ELang;
    translation?: ITranslation;
}