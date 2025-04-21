"use strict";

const { extractGoogleSearchResultsScript } = require("./script-utils");
const { scrapeUrl } = require("./scrape-utils");

const googleUrl = "https://www.google.com/search?q=";
const siteUrlPath = "site:stackoverflow.com ";
const stackOverflowAnswersUrl =
  "https://api.stackexchange.com/2.3/questions/${questionId}/answers?site=stackoverflow&filter=withbody";

function createAnswerContent(googleResult, questionId, acceptedAnswers) {
  const content = acceptedAnswers
    .map((answer) => {
      const answerContent = `### Stack Overflow Answer
        Question ID: ${questionId}
        Title: ${googleResult.title}
        Description: ${googleResult.description}
        Source: ${googleResult.href}
        Score: ${answer.score}
        Answer:
        ${answer.body}`;
      return answerContent;
    })
    .join("\n\n");

  return content;
}

function getQuestionId(url) {
  const m = url.match(/questions\/(\d+)/);
  return m && m[1];
}

function handleStackOverflowResponse(data) {
  const acceptedAnswers = data.items.filter((item) => item.is_accepted);
  acceptedAnswers.sort((a, b) => b.score - a.score);
  console.log(
    `Got ${acceptedAnswers.length} accepted of ${data.items.length} answers`
  );
  return acceptedAnswers;
}

async function queryStackOverflow(questionId) {
  const url = stackOverflowAnswersUrl.replace("${questionId}", questionId);
  console.log(`Fetching answers for questionId: ${questionId}`);
  const response = await fetch(url, { method: "GET" })
    .then((response) => response.json())
    .then((data) => handleStackOverflowResponse(data))
    .catch((error) => console.error("Error:", error)); // TODO: handle error

  return response;
}

async function handleStackOverflow(window, question, maxItems) {
  const query = encodeURIComponent(`${siteUrlPath}${question}`);
  const url = `${googleUrl}${query}`;
  console.log(`Scraping URL: ${url}`);

  const script = extractGoogleSearchResultsScript();
  const googleResults = await scrapeUrl(window, url, script);

  const answerContexts = [];

  for (let i = 0; i < googleResults.length && i < maxItems; i++) {
    const googleResult = googleResults[i];
    const questionId = getQuestionId(googleResult.href);
    if (!questionId) {
      console.warn("Missing questionId:", googleResult.href);
      continue;
    }

    const acceptedAnswers = await queryStackOverflow(questionId);
    if (!acceptedAnswers.length) {
      console.log("No answers for questionId:", questionId);
      continue;
    }
    const answerContent = createAnswerContent(
      googleResult,
      questionId,
      acceptedAnswers
    );
    const answerContext = {
      name: `Stack Overflow #${questionId}`,
      description: `${googleResult.title}`,
      content: answerContent,
    };
    answerContexts.push(answerContext);
  }

  console.log("Stack Overflow answer contexts: ", answerContexts.length);

  if (answerContexts.length === 0) {
    console.log("No answers");
    return {
      name: `Stack Overflow`,
      description: `No answers available`,
      content: `No Stack Overflow answers available.`,
    };
  } else {
    return answerContexts;
  }
}

module.exports = {
  handleStackOverflow,
};
