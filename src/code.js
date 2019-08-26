import { ELang, ELocalStorageKey, EMessageType, ENodeType } from './models';
let currentSelection = figma.currentPage.selection;
figma.showUI(__html__, { width: 450, height: 220 });
figma.loadFontAsync({ family: "Rubik AZ", style: "Regular" });
sendCurrentNode();
// Check if selection has changed and send new selection into ui if needed
setInterval(() => {
    const newSelection = figma.currentPage.selection;
    if (currentSelection[0].id !== newSelection[0].id) {
        currentSelection = newSelection;
        sendCurrentNode();
    }
}, 1000);
function getCurrentNode() {
    return currentSelection.find((node) => node.type === ENodeType.TEXT);
}
function sendCurrentNode() {
    const currentNode = getCurrentNode();
    if (currentNode) {
        figma.clientStorage
            .getAsync(ELocalStorageKey.LANG)
            .then((lang) => {
            // Parse translation if exist
            const translation = parseJSON(figma.currentPage.getPluginData(currentNode.id));
            // Try to find suggested translation if some of translation is missing
            const suggestedTranslation = !translation || (translation && isSomeTranslationMissing(translation))
                ? findSuggestedTranslation(currentNode.id, currentNode.characters)
                : null;
            // Send information about current node to UI
            postMessage({
                type: EMessageType.SEND_CURRENT_NODE,
                currentLang: lang,
                translation,
                suggestedTranslation,
                nodeText: currentNode.characters,
            });
        });
    }
    else {
        postMessage({ type: EMessageType.NO_CURRENT_NODE });
    }
}
function postMessage(message) {
    figma.ui.postMessage(message);
}
// Find all text nodes on current page and translate them
function traverse(node, lang) {
    if (node.type === ENodeType.TEXT) {
        const translation = parseJSON(figma.currentPage.getPluginData(node.id));
        if (translation && translation[lang].length > 0)
            node.characters = translation[lang];
    }
    if ("children" in node) {
        for (const child of node.children) {
            traverse(child, lang);
        }
    }
}
function findSuggestedTranslation(id, word) {
    const textNodes = figma.currentPage.findAll((node) => node.type === ENodeType.TEXT);
    let suggestedTranslation = {
        AZ: null,
        RU: null,
        EN: null
    };
    for (const node of textNodes) {
        if (node.id !== id) {
            const translation = parseJSON(figma.currentPage.getPluginData(node.id));
            if (translation && hasTranslationWord(translation, word)) {
                for (const lang in translation) {
                    if (translation[lang].length > 0 && !suggestedTranslation[lang]) {
                        suggestedTranslation[lang] = translation[lang];
                    }
                }
            }
        }
        if (!isSomeTranslationMissing(suggestedTranslation))
            break;
    }
    return allTranslationsAreMissing(suggestedTranslation) ? null : suggestedTranslation;
}
function parseJSON(object) {
    return object && object.length > 0 ? JSON.parse(object) : null;
}
function hasTranslationWord(translation, word) {
    return Object.keys(ELang).some(lang => translation[lang] === word);
}
function isSomeTranslationMissing(translation) {
    return Object.keys(ELang).some((lang) => !translation[lang]);
}
function allTranslationsAreMissing(translation) {
    return Object.keys(ELang).every((lang) => !translation[lang]);
}
figma.ui.onmessage = (message) => {
    const { type, translation, lang } = message;
    switch (type) {
        case EMessageType.PUT_TRANSLATION:
            if (translation) {
                figma.currentPage.setPluginData(getCurrentNode().id, JSON.stringify(translation));
                figma.clientStorage
                    .getAsync(ELocalStorageKey.LANG)
                    .then((currentLang) => {
                    figma.currentPage.selection[0].characters = translation[currentLang];
                });
            }
            break;
        case EMessageType.SET_CURRENT_LANGUAGE:
            figma.clientStorage
                .setAsync(ELocalStorageKey.LANG, lang)
                .then(() => {
                traverse(figma.root, lang);
            });
    }
};
