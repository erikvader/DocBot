const AssistantV1 = require("ibm-watson/assistant/v1");
const LanguageTranslatorV3 = require("watson-developer-cloud/language-translator/v3");

const assistant = new AssistantV1({
    iam_apikey: "DSDog8WIZFiSbvbL9b_8ZqicfswIuesBIP32w2kzfP56",
    url: "https://gateway-lon.watsonplatform.net/assistant/api",
    version: "2019-02-28"
});

const translator = new LanguageTranslatorV3({
    iam_apikey: "cV8-3ePlgpbtPtBByLjY1VGtZFzIdTJGdUcv0XLjMzj5",
    url: "https://gateway-lon.watsonplatform.net/language-translator/api",
    version: "2019-02-28"
});

/*
assistant.message(
  {
    input: { text: "I want to move in with my boyfriend" },
    workspace_id: "ffb2ebd3-e906-47e3-8d01-9fc1a5882360"
  })
  .then(result => {
    console.log(JSON.stringify(result, null, 2));
  })
  .catch(err => {
    console.log(err);
  });
*/

module.exports = {
    assistant,
    translator,
    workspace_id: "ceab0e85-4bb5-4618-9fa6-4db9dc95e315"
};
