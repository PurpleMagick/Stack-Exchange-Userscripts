// ==UserScript==
// @name             Stack Comment History Checker
// @description      Review the status and reception of your comments and their parent posts
// @author           CertainPerformance
// @namespace        https://github.com/CertainPerformance/Stack-Exchange-Userscripts
// @version          1.0.0
// @include          /^https://(?:[^/]+\.)?(?:(?:stackoverflow|serverfault|superuser|stackexchange|askubuntu|stackapps)\.com|mathoverflow\.net)/(?:users/.*\?tab=activity|questions/\d|review/[^/]+(?:/\d+|$))/
// @grant            none
// ==/UserScript==

/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./build/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./build/commentDB.js":
/*!****************************!*\
  !*** ./build/commentDB.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/* The ultimate output bundle will not be minified, for the sake of easier debugging
 * But localforage, if imported ordinarily without minification, will be a HUGE part of the output bundle
 * despite its implementation being near-irrelevant to this script
 * So, the minified version of localforage is imported instead
 */
// @ts-ignore
const localforageUntyped = __webpack_require__(/*! ../node_modules/localforage/dist/localforage.min.js */ "./node_modules/localforage/dist/localforage.min.js");
const localforage = localforageUntyped;
// Only allow a get or set operation after the previous operation is complete:
let lastProm = Promise.resolve();
exports.getDB = async () => {
    await lastProm;
    lastProm = localforage.getItem('cpuserscriptCommentHistoryCheckerSavedComments');
    return (await lastProm) || {};
};
exports.setDB = async (newData) => {
    await lastProm;
    lastProm = localforage.setItem('cpuserscriptCommentHistoryCheckerSavedComments', newData);
    return lastProm;
};
// To debug the database, temporarily add this to the userscript metadata block (or insert it into the DOM as a script tag) so window.localforage can be used:
// @require          https://cdn.jsdelivr.net/npm/localforage@1.7.3/dist/localforage.min.js#sha256=1ff66c1e32922549d0c824076703e69fb5535857934c8faa8023f51a4881f732


/***/ }),

/***/ "./build/commentHrefToIds.js":
/*!***********************************!*\
  !*** ./build/commentHrefToIds.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.commentHrefToIds = (commentHref) => {
    // commentHref will be in a format like:
    // https://stackoverflow.com/questions/1732348/regex-match-open-tags-except-xhtml-self-contained-tags#comment1612336_1732454
    //                                     questionId                                                          commentId postId
    const match = commentHref.match(/\/questions\/(\d+)\/[^\/]+(?:\/\d+)?[^#]*#comment(\d+)_(\d+)/);
    // postId refers to the post the comment was made on - may be a question or answer
    const [, questionId, commentId, postId] = match.map(Number);
    return { questionId, commentId, postId, isAnswer: postId !== questionId };
};


/***/ }),

/***/ "./build/index.js":
/*!************************!*\
  !*** ./build/index.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const watchForCommentChanges_1 = __webpack_require__(/*! ./watchForCommentChanges */ "./build/watchForCommentChanges/index.js");
const watchForCommentTab_1 = __webpack_require__(/*! ./watchForCommentTab */ "./build/watchForCommentTab/index.js");
if (window.location.href.includes('?tab=activity')) {
    watchForCommentTab_1.watchForCommentTab();
}
else {
    watchForCommentChanges_1.watchForCommentChanges();
}


/***/ }),

/***/ "./build/watchForCommentChanges/index.js":
/*!***********************************************!*\
  !*** ./build/watchForCommentChanges/index.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const watchForNewComments_1 = __webpack_require__(/*! ./watchForNewComments */ "./build/watchForCommentChanges/watchForNewComments.js");
const watchForSelfDeletedComments_1 = __webpack_require__(/*! ./watchForSelfDeletedComments */ "./build/watchForCommentChanges/watchForSelfDeletedComments.js");
exports.watchForCommentChanges = () => {
    watchForSelfDeletedComments_1.watchForSelfDeletedComments();
    window.StackExchange.ready(() => {
        setTimeout(watchForNewComments_1.watchForNewComments);
    });
};


/***/ }),

/***/ "./build/watchForCommentChanges/makeSaveAllVisibleComments.js":
/*!********************************************************************!*\
  !*** ./build/watchForCommentChanges/makeSaveAllVisibleComments.js ***!
  \********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const commentDB_1 = __webpack_require__(/*! ../commentDB */ "./build/commentDB.js");
const saveComment_1 = __webpack_require__(/*! ./saveComment */ "./build/watchForCommentChanges/saveComment.js");
exports.makeSaveAllVisibleComments = (userHref) => async () => {
    const anchorsToSave = [...document.querySelectorAll('a.comment-user')]
        .filter(({ href }) => href === userHref);
    if (!anchorsToSave.length) {
        return;
    }
    const savedComments = await commentDB_1.getDB();
    const anyChangesMade = anchorsToSave.reduce((a, anchor) => saveComment_1.saveComment(anchor, savedComments) || a, false);
    if (anyChangesMade) {
        await commentDB_1.setDB(savedComments);
    }
};


/***/ }),

/***/ "./build/watchForCommentChanges/saveComment.js":
/*!*****************************************************!*\
  !*** ./build/watchForCommentChanges/saveComment.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const commentHrefToIds_1 = __webpack_require__(/*! ../commentHrefToIds */ "./build/commentHrefToIds.js");
const anchorExists = (element) => Boolean(element);
/**
 * Saves the comment surrounding this anchor in the database
 * @returns True if the database was changed, otherwise false
 */
exports.saveComment = (userCommentAnchor, savedComments) => {
    const dateElm = userCommentAnchor.nextElementSibling.querySelector('.relativetime-clean');
    const timestamp = new Date(dateElm.title).getTime();
    const commentHTML = userCommentAnchor.closest('.comment-body').children[0].innerHTML;
    const questionAnchor = document.querySelector('#question-header > h1 > a');
    if (!anchorExists(questionAnchor)) {
        // Spam/rude question - it's likely already in the database, just don't try to update it
        return false;
    }
    const questionTitle = questionAnchor.textContent;
    const commentHrefAttrib = userCommentAnchor.parentElement.querySelector('a.comment-link').getAttribute('href');
    const commentHref = questionAnchor.href + commentHrefAttrib;
    const { commentId } = commentHrefToIds_1.commentHrefToIds(commentHref);
    const newCommentObj = {
        commentHTML,
        commentHref,
        questionTitle,
        timestamp,
    };
    if (JSON.stringify(newCommentObj) !== JSON.stringify(savedComments[commentId])) {
        savedComments[commentId] = newCommentObj;
        // A change was made:
        return true;
    }
    // No changes were made:
    return false;
};


/***/ }),

/***/ "./build/watchForCommentChanges/saveDeletedComment.js":
/*!************************************************************!*\
  !*** ./build/watchForCommentChanges/saveDeletedComment.js ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const commentDB_1 = __webpack_require__(/*! ../commentDB */ "./build/commentDB.js");
exports.saveDeletedComment = async (commentId) => {
    const savedComments = await commentDB_1.getDB();
    const thisSavedComment = savedComments[commentId];
    // This probably shouldn't ever happen
    // if a comment is deleted, that comment *should* have been put into the DB, either on pageload, or when user clicks to show new or hidden comments
    if (!thisSavedComment) {
        return;
    }
    // I don't consider object spread to be sufficiently supported to use it
    savedComments[commentId] = Object.assign({}, thisSavedComment, { selfDeleted: true });
    await commentDB_1.setDB(savedComments);
};


/***/ }),

/***/ "./build/watchForCommentChanges/watchForNewComments.js":
/*!*************************************************************!*\
  !*** ./build/watchForCommentChanges/watchForNewComments.js ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const makeSaveAllVisibleComments_1 = __webpack_require__(/*! ./makeSaveAllVisibleComments */ "./build/watchForCommentChanges/makeSaveAllVisibleComments.js");
exports.watchForNewComments = async () => {
    const myProfile = document.querySelector('a.my-profile');
    if (!myProfile) {
        // not logged in
        return;
    }
    const userHref = myProfile.href;
    const saveAllVisibleComments = makeSaveAllVisibleComments_1.makeSaveAllVisibleComments(userHref);
    await saveAllVisibleComments();
    // Each post (question or answer) has a UL as a comment container
    // When changes are observed there with MutationObserver, save all of the user's comments on the page
    // Attach a MutationObserver to all ULs on pageload, and also on every ajaxComplete (when new answers, and thus new ULs, may have appeared)
    const ulsBeingObserved = new Set();
    const attachObserverToUL = (ul) => {
        if (ulsBeingObserved.has(ul)) {
            return;
        }
        ulsBeingObserved.add(ul);
        new MutationObserver(saveAllVisibleComments).observe(ul, { childList: true });
    };
    const attachObserverToAllULs = () => {
        // tslint:disable-next-line: no-unnecessary-type-assertion
        document.querySelectorAll('ul.comments-list').forEach(attachObserverToUL);
    };
    attachObserverToAllULs();
    window.$(document).ajaxComplete(attachObserverToAllULs);
};


/***/ }),

/***/ "./build/watchForCommentChanges/watchForSelfDeletedComments.js":
/*!*********************************************************************!*\
  !*** ./build/watchForCommentChanges/watchForSelfDeletedComments.js ***!
  \*********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const saveDeletedComment_1 = __webpack_require__(/*! ./saveDeletedComment */ "./build/watchForCommentChanges/saveDeletedComment.js");
exports.watchForSelfDeletedComments = () => {
    const responseJSONHasSuccessProp = (responseJSON) => 'Success' in responseJSON;
    window.$(document).ajaxComplete((_, jqXHR, ajaxOptions) => {
        if (!ajaxOptions || !ajaxOptions.url) {
            return;
        }
        // A self-deleted comment results in a request to /posts/comments/commentId/vote/10:
        const commentIdMatch = ajaxOptions.url.match(/^\/posts\/comments\/(\d+)\/vote\/10$/);
        if (!commentIdMatch) {
            return;
        }
        const deletedCommentId = Number(commentIdMatch[1]);
        const responseJSON = jqXHR.responseJSON;
        if (typeof responseJSON !== 'object' || responseJSON === null) {
            return;
        }
        if (responseJSONHasSuccessProp(responseJSON) && responseJSON.Success === true) {
            // The comment was deleted successfully
            // wait for all SE handlers to finish, and wait for the MutationObserver (watching the <UL>) in watchForNewComments to finish too
            setTimeout(saveDeletedComment_1.saveDeletedComment, 0, deletedCommentId);
        }
    });
};


/***/ }),

/***/ "./build/watchForCommentTab/fixCommentTab.js":
/*!***************************************************!*\
  !*** ./build/watchForCommentTab/fixCommentTab.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const commentDB_1 = __webpack_require__(/*! ../commentDB */ "./build/commentDB.js");
const getApi_1 = __webpack_require__(/*! ./getApi */ "./build/watchForCommentTab/getApi.js");
const insertMissingCommentTrs_1 = __webpack_require__(/*! ./insertMissingCommentTrs */ "./build/watchForCommentTab/insertMissingCommentTrs/index.js");
const insertTh_1 = __webpack_require__(/*! ./insertTh */ "./build/watchForCommentTab/insertTh.js");
const makeRowstatsContainers_1 = __webpack_require__(/*! ./makeRowstatsContainers */ "./build/watchForCommentTab/makeRowstatsContainers.js");
const processApiResponse_1 = __webpack_require__(/*! ./processApiResponse */ "./build/watchForCommentTab/processApiResponse/index.js");
const selectorToUserId = (selector) => {
    const anchor = document.querySelector(selector);
    if (!anchor) {
        return null;
    }
    return anchor.href.match(/\d+/)[0];
};
exports.fixCommentTab = async () => {
    const savedComments = await commentDB_1.getDB();
    const thisProfileIsLoggedIn = selectorToUserId('a.my-profile') === selectorToUserId('.subheader a[href^="/users/"]');
    // If not logged in, OR if you're viewing the comments of a different user's profile,
    // then no rows will be dynamically inserted, and all rows will be ordinary visible comments, without color-coding
    if (thisProfileIsLoggedIn) {
        insertMissingCommentTrs_1.insertMissingCommentTrs(savedComments);
    }
    insertTh_1.insertTh(thisProfileIsLoggedIn);
    const rowstatsContainersByIds = makeRowstatsContainers_1.makeRowstatsContainers();
    const apiData = await Promise.all([
        getApi_1.getApi('questions', [...rowstatsContainersByIds.byQuestion.keys()]),
        getApi_1.getApi('comments', [...rowstatsContainersByIds.byComment.keys()]),
    ]);
    processApiResponse_1.processApiResponse(apiData, rowstatsContainersByIds, savedComments);
};


/***/ }),

/***/ "./build/watchForCommentTab/getApi.js":
/*!********************************************!*\
  !*** ./build/watchForCommentTab/getApi.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const filters = {
    comments: '!SWJ_S9Hse(rWelcqk1',
    questions: '!5RCI6qPDF8)WPM-vVxWYF-1w0',
};
const thisSite = window.location.hostname
    .replace(/\.\w+$/, '') // Remove the TLD (.com, .net, ...)
    .replace(/\.stackexchange$/, ''); // The API does not need the ".stackexchange" suffix
const defaultParamsArr = [
    ['key', ')b5jvgz1hz0gdK)*4WvlPA(('],
    ['site', thisSite],
];
exports.getApi = async (method, ids) => {
    if (!ids.length) {
        return { items: [] };
    }
    const searchParams = new URLSearchParams(defaultParamsArr);
    searchParams.set('filter', filters[method]);
    const paramsString = `?${searchParams.toString()}`;
    const url = `https://api.stackexchange.com/2.2/${method}/${ids.join(';')}${paramsString}`;
    const response = await fetch(url);
    const responseObj = await response.json();
    return responseObj;
};


/***/ }),

/***/ "./build/watchForCommentTab/index.js":
/*!*******************************************!*\
  !*** ./build/watchForCommentTab/index.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const fixCommentTab_1 = __webpack_require__(/*! ./fixCommentTab */ "./build/watchForCommentTab/fixCommentTab.js");
const styleTag_1 = __webpack_require__(/*! ./styleTag */ "./build/watchForCommentTab/styleTag.js");
exports.watchForCommentTab = () => {
    // When user goes to comments tab, append style tag and call fixCommentTab
    // When user navigates to another tab under All Actions (they'll still be on the same page), remove the style tag if it's appended
    const mainBarFull = document.querySelector('#mainbar-full');
    const onMutation = () => {
        const commentTabHighlighted = document.querySelector('#user-tab-activity .youarehere').href.endsWith('&sort=comments');
        if (!commentTabHighlighted) {
            styleTag_1.styleTag.remove();
            return;
        }
        document.body.appendChild(styleTag_1.styleTag);
        // tslint:disable-next-line: no-floating-promises
        fixCommentTab_1.fixCommentTab();
    };
    new MutationObserver(onMutation)
        .observe(mainBarFull, { childList: true });
    window.StackExchange.ready(onMutation);
};


/***/ }),

/***/ "./build/watchForCommentTab/insertMissingCommentTrs/escapeHTML.js":
/*!************************************************************************!*\
  !*** ./build/watchForCommentTab/insertMissingCommentTrs/escapeHTML.js ***!
  \************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeHTML = (unsafe) => unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');


/***/ }),

/***/ "./build/watchForCommentTab/insertMissingCommentTrs/index.js":
/*!*******************************************************************!*\
  !*** ./build/watchForCommentTab/insertMissingCommentTrs/index.js ***!
  \*******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const commentHrefToIds_1 = __webpack_require__(/*! ../../commentHrefToIds */ "./build/commentHrefToIds.js");
const makeTr_1 = __webpack_require__(/*! ./makeTr */ "./build/watchForCommentTab/insertMissingCommentTrs/makeTr.js");
// Make sure to only select trs with data-postids;
// Old comments have year-indicator TRs show up in the table, eg <tr><th>2018</th></tr>, which we don't want to select
const getTrs = () => [...document.querySelectorAll('.history-table > tbody tr[data-postid]')];
const trToIds = (tr) => commentHrefToIds_1.commentHrefToIds(tr.querySelector('a[href^="/questions"]').href);
/**
 * Finds and inserts comments that, given the date range, are in the database and should exist in the table, but don't
 */
exports.insertMissingCommentTrs = (savedComments) => {
    /* All this function does is change the DOM to insert missing comments as TRs - no data is saved or returned
     * because the DOM can be treated as the source of truth:
     * From the trs (inserted by the userscript or not), everything needed can be retrieved - the comment hrefs contain all IDs needed later
     */
    // The keys of savedComments are the numeric commentIds, and so will already be in ascending numeric order in basically every implementation: no need to .sort
    // (until a commentId reaches the limit of array indicies, 2 ** 32 - 1, which is a long way off)
    const savedCommentsArrLatestFirst = Object.values(savedComments).reverse();
    const commentTrs = getTrs();
    const [startTRIndexInSavedCommentsArr, endTRIndexInSavedCommentsArr] = [commentTrs[0], commentTrs[commentTrs.length - 1]]
        .map((tr) => {
        const commentIdToFind = trToIds(tr).commentId;
        // In saved comments, find first commentId which is equal to (likely) or earlier than the commentId of this tr
        // (that is, a theoretical TR created from the found commentId should be the same, or come right below this `tr` being iterated over
        return savedCommentsArrLatestFirst.findIndex(({ commentHref }) => (commentHrefToIds_1.commentHrefToIds(commentHref).commentId <= commentIdToFind));
    });
    const thisPageNumber = document.querySelector('#user-tab-activity .page-numbers.current').textContent;
    const sliceStartIndex = (startTRIndexInSavedCommentsArr === -1 || thisPageNumber === '1')
        ? 0
        : startTRIndexInSavedCommentsArr;
    /* sliceEndIndex is usually endTRIndexInSavedCommentsArr + 7,
     * to show up to 7 deleted comments in between the buttom of this page and the top of the next page
     * The comments that would be visible if user navigates to the next page will be hidden later, once the SE API response is processed
     */
    const sliceEndIndex = endTRIndexInSavedCommentsArr === -1
        ? savedCommentsArrLatestFirst.length - 1
        : Math.min(endTRIndexInSavedCommentsArr + 7, savedCommentsArrLatestFirst.length - 1);
    const allCommentsToBeShownOnThisPage = savedCommentsArrLatestFirst.slice(sliceStartIndex, sliceEndIndex);
    const commentIdsAlreadyOnPage = new Set(commentTrs.map(tr => trToIds(tr).commentId));
    const tBody = commentTrs[0].parentElement;
    const lastOriginalTrCommentId = trToIds(commentTrs[commentTrs.length - 1]).commentId;
    const insertTr = (savedComment) => {
        const thisCommentId = commentHrefToIds_1.commentHrefToIds(savedComment.commentHref).commentId;
        // If a tr for this commentId already exists, nothing to create:
        if (commentIdsAlreadyOnPage.has(thisCommentId)) {
            return;
        }
        const trThisNewRowShouldBeInsertedBefore = getTrs().find(tr => trToIds(tr).commentId < thisCommentId);
        const isTrailing = thisCommentId < lastOriginalTrCommentId;
        const trToInsert = makeTr_1.makeTr(savedComment, isTrailing);
        // If trThisNewRowShouldBeInsertedBefore is null, the TR will be inserted at the end of the tbody, like appendChild, as desired:
        tBody.insertBefore(trToInsert, trThisNewRowShouldBeInsertedBefore || null);
    };
    allCommentsToBeShownOnThisPage.forEach(insertTr);
};


/***/ }),

/***/ "./build/watchForCommentTab/insertMissingCommentTrs/makeTr.js":
/*!********************************************************************!*\
  !*** ./build/watchForCommentTab/insertMissingCommentTrs/makeTr.js ***!
  \********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const commentHrefToIds_1 = __webpack_require__(/*! ../../commentHrefToIds */ "./build/commentHrefToIds.js");
const escapeHTML_1 = __webpack_require__(/*! ./escapeHTML */ "./build/watchForCommentTab/insertMissingCommentTrs/escapeHTML.js");
const timestampToDateDivHTML_1 = __webpack_require__(/*! ./timestampToDateDivHTML */ "./build/watchForCommentTab/insertMissingCommentTrs/timestampToDateDivHTML.js");
exports.makeTr = (savedComment, isTrailing) => {
    const { questionTitle, // This may be out of date if the question was edited - user will have to visit the question page to get an updated title, by design
    commentHTML, commentHref, timestamp, } = savedComment;
    const tr = document.createElement('tr');
    if (isTrailing) {
        tr.setAttribute('data-cpuserscript-unverified-trailing-row', '');
    }
    // Some of the below changes are not *necessary*, but they make the inserted rows' HTML consistent with the default markup
    tr.setAttribute('class', '');
    const partialHref = commentHref.match(/\/questions.+/)[0];
    // postId refers to the post the comment was made on - may be a question or answer:
    const { postId } = commentHrefToIds_1.commentHrefToIds(commentHref);
    tr.dataset.postid = String(postId);
    const dateDivHTML = timestampToDateDivHTML_1.timestampToDateDivHTML(timestamp);
    tr.innerHTML = `
    <td>
        ${dateDivHTML}
    </td>
    <td>comment</td>
    <td>
        <b><a href="${partialHref}" class="answer-hyperlink timeline-answers">${escapeHTML_1.escapeHTML(questionTitle)}</a></b>
        <br>
        <span class="comments">${commentHTML}</span>
    </td>
    `;
    return tr;
};


/***/ }),

/***/ "./build/watchForCommentTab/insertMissingCommentTrs/timestampToDateDivHTML.js":
/*!************************************************************************************!*\
  !*** ./build/watchForCommentTab/insertMissingCommentTrs/timestampToDateDivHTML.js ***!
  \************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const timestampToTimeAgoStr_1 = __webpack_require__(/*! ./timestampToTimeAgoStr */ "./build/watchForCommentTab/insertMissingCommentTrs/timestampToTimeAgoStr.js");
exports.timestampToDateDivHTML = (timestamp) => {
    const dateTitleAttr = new Date(timestamp).toISOString()
        .replace('T', ' ')
        .replace('.000', '');
    const timeAgoStr = timestampToTimeAgoStr_1.timestampToTimeAgoStr(timestamp);
    if (/^\d/.test(timeAgoStr)) {
        return `<div class="date" title="${dateTitleAttr}">${timeAgoStr}</div>`;
    }
    // This doesn't take into account years, but that's OK
    const [month, day] = timeAgoStr.split(' ');
    return `
    <div class="date">
      <div class="date_brick" title="${dateTitleAttr}">${month}<br>${day}</div>
    </div>
    `;
};


/***/ }),

/***/ "./build/watchForCommentTab/insertMissingCommentTrs/timestampToTimeAgoStr.js":
/*!***********************************************************************************!*\
  !*** ./build/watchForCommentTab/insertMissingCommentTrs/timestampToTimeAgoStr.js ***!
  \***********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * If difference between timestamp and now is more than 2 days, return "mon #" (eg "Jan 1").
 * Otherwise, return one of: "#d", "#h", "#m", "#s", or "now".
 * This aims to imitate the date string displayed in the comment table by default.
 * @param timestamp A timestamp ultimately taken from SE's HTML - this can be relied on to be accurate
 */
exports.timestampToTimeAgoStr = (timestamp) => {
    /* The user's machine's time (returned by Date.now()) may not be accurate
     * This is a problem, because the relative time ago given in each TR log (eg, "3m ago") must be accurate to be meaningful
     * SE handles this general issue by sending a serverTimeOffsetSec number with every page response
     * Use that information here to get an accurate secsDiff:
     */
    const secsDiff = window.StackExchange.options.serverTimeOffsetSec + ((Date.now() - timestamp) / 1000);
    const dayDiff = Math.floor(secsDiff / 86400);
    if (secsDiff < 2) {
        return 'now';
    }
    if (secsDiff < 60) {
        return `${Math.floor(secsDiff)}s`;
    }
    if (secsDiff < 3600) {
        return `${Math.floor(secsDiff / 60)}m`;
    }
    if (dayDiff === 0) {
        return `${Math.floor(secsDiff / 3600)}h`;
    }
    if (dayDiff <= 2) {
        return `${dayDiff}d`;
    }
    // So dayDiff > 2
    const date = new Date(timestamp);
    return `${date.toLocaleString(undefined, { month: 'short' })} ${date.getUTCDate()}`;
};


/***/ }),

/***/ "./build/watchForCommentTab/insertTh.js":
/*!**********************************************!*\
  !*** ./build/watchForCommentTab/insertTh.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.insertTh = (thisProfileIsLoggedIn) => {
    const table = document.querySelector('.history-table');
    const thead = table.insertBefore(document.createElement('thead'), table.children[0]);
    // Limitation: Below only makes sense on English sites
    thead.innerHTML = `
    <tr>
        <th></th>
        <th>
            <div data-cpuserscript-rowstats>
                <div data-cpuserscript-qa-box data-cpuserscript-parent-post>Q</div>
                <div data-cpuserscript-qa-box data-cpuserscript-parent-post>A</div>
                <div data-cpuserscript-comment-score>Score</div>
                <div data-cpuserscript-more-answers><span># of additional answers</span></div>
            </div>
        </th>
        <th>
            <div${!thisProfileIsLoggedIn ? ' style="visibility: hidden;"' : ''}>
                <div data-cpuserscript-self-deleted>Comment deleted by you</div>
                <div data-cpuserscript-post-removed>Parent post removed</div>
                <div data-cpuserscript-duplicate-removed>Possible Duplicate comment removed</div>
                <div data-cpuserscript-comment-removed>Comment deleted by mod/system</div>
            </div>
        </th>
    </tr>
    `;
};


/***/ }),

/***/ "./build/watchForCommentTab/makeRowstatsContainers.js":
/*!************************************************************!*\
  !*** ./build/watchForCommentTab/makeRowstatsContainers.js ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const commentHrefToIds_1 = __webpack_require__(/*! ../commentHrefToIds */ "./build/commentHrefToIds.js");
exports.makeRowstatsContainers = () => {
    // Map question / comment IDs to the second td in every tr, the tds which initially contain "Comment" on pageload
    const rowstatsContainersByIds = {
        byComment: new Map(),
        byQuestion: new Map(),
    };
    // Then replace the content of those TDs with the rowstats HTML framework,
    // which will be populated once the API response comes back
    document.querySelectorAll('.history-table > tbody tr[data-postid]').forEach((tr) => {
        const commentHref = tr.querySelector('a').href;
        const { questionId, commentId, isAnswer } = commentHrefToIds_1.commentHrefToIds(commentHref);
        const td = tr.children[1];
        td.textContent = '';
        const rowstatsContainer = td.appendChild(document.createElement('div'));
        rowstatsContainer.setAttribute('data-cpuserscript-rowstats', '');
        rowstatsContainer.innerHTML = `
            <div data-cpuserscript-qa-box></div>
            <div data-cpuserscript-qa-box></div>
        `;
        rowstatsContainer.children[isAnswer ? 1 : 0].setAttribute('data-cpuserscript-parent-post', '');
        if (!rowstatsContainersByIds.byQuestion.has(questionId)) {
            rowstatsContainersByIds.byQuestion.set(questionId, new Set());
        }
        rowstatsContainersByIds.byQuestion.get(questionId).add(rowstatsContainer);
        rowstatsContainersByIds.byComment.set(commentId, rowstatsContainer);
    });
    return rowstatsContainersByIds;
};


/***/ }),

/***/ "./build/watchForCommentTab/processApiResponse/highlightCommentsWithoutData.js":
/*!*************************************************************************************!*\
  !*** ./build/watchForCommentTab/processApiResponse/highlightCommentsWithoutData.js ***!
  \*************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Iterate through all rowstatsContainers on the page.
 * If the comment associated with a container is not in apiCommentIds,
 * identify the cause and set the appropriate attribute for color-coding
 */
exports.highlightCommentsWithoutData = (rowstatsContainersByIds, apiCommentIds, apiPostIds, savedComments) => {
    [...rowstatsContainersByIds.byComment.entries()].forEach(([commentId, rowstatsContainer]) => {
        if (apiCommentIds.has(commentId)) {
            // Comment still exists in system - nothing to highlight
            return;
        }
        // Either the post was deleted, or the comment was deleted:
        const tr = rowstatsContainer.closest('tr');
        const postId = Number(tr.dataset.postid);
        const commentIsPossibleDuplicateOf = tr.querySelector('td:nth-child(3) > span').textContent.startsWith('Possible duplicate of ');
        // Note that the the post deletion indicator takes priority over both comment self-deletion indicator and mod deletion indicator
        if (!apiPostIds.has(postId)) {
            // The parent post was deleted; the comment was not singled out
            tr.setAttribute('data-cpuserscript-post-removed', '');
        }
        else if (savedComments[commentId] && savedComments[commentId].selfDeleted) {
            // You deleted the comment:
            tr.setAttribute('data-cpuserscript-self-deleted', '');
        }
        else if (commentIsPossibleDuplicateOf) {
            // Comment starts with "Possible duplicate of" and no longer exists:
            tr.setAttribute('data-cpuserscript-duplicate-removed', '');
        }
        else {
            // The parent post still exists; the comment was deleted by a mod or the system:
            tr.setAttribute('data-cpuserscript-comment-removed', '');
        }
    });
};


/***/ }),

/***/ "./build/watchForCommentTab/processApiResponse/index.js":
/*!**************************************************************!*\
  !*** ./build/watchForCommentTab/processApiResponse/index.js ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const highlightCommentsWithoutData_1 = __webpack_require__(/*! ./highlightCommentsWithoutData */ "./build/watchForCommentTab/processApiResponse/highlightCommentsWithoutData.js");
const populateRowstatsWithApiData_1 = __webpack_require__(/*! ./populateRowstatsWithApiData */ "./build/watchForCommentTab/processApiResponse/populateRowstatsWithApiData.js");
const removeEmptyContainers_1 = __webpack_require__(/*! ./removeEmptyContainers */ "./build/watchForCommentTab/processApiResponse/removeEmptyContainers.js");
const removeRedundantTrs_1 = __webpack_require__(/*! ./removeRedundantTrs */ "./build/watchForCommentTab/processApiResponse/removeRedundantTrs.js");
exports.processApiResponse = ([questionData, commentData], rowstatsContainersByIds, savedComments) => {
    populateRowstatsWithApiData_1.populateRowstatsWithApiData(questionData, commentData, rowstatsContainersByIds);
    const apiQuestionIds = new Set(questionData.items.map(({ question_id }) => question_id));
    const apiAnswerIds = new Set([].concat(...questionData.items.map(({ answers = [] }) => answers.map(({ answer_id }) => answer_id))));
    const apiPostIds = new Set([...apiQuestionIds, ...apiAnswerIds]);
    const apiCommentIds = new Set(commentData.items.map(({ comment_id }) => comment_id));
    highlightCommentsWithoutData_1.highlightCommentsWithoutData(rowstatsContainersByIds, apiCommentIds, apiPostIds, savedComments);
    removeEmptyContainers_1.removeEmptyContainers();
    removeRedundantTrs_1.removeRedundantTrs(apiCommentIds);
};


/***/ }),

/***/ "./build/watchForCommentTab/processApiResponse/populateRowstatsWithApiData.js":
/*!************************************************************************************!*\
  !*** ./build/watchForCommentTab/processApiResponse/populateRowstatsWithApiData.js ***!
  \************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const getBestAnswer = (answers) => {
    if (!answers.length) {
        return null;
    }
    const acceptedAnswer = answers.find(({ is_accepted }) => is_accepted);
    if (acceptedAnswer) {
        return acceptedAnswer;
    }
    const highestScoreAnswer = answers.reduce((a, answer) => (answer.score > a.score ? answer : a));
    return highestScoreAnswer;
};
exports.populateRowstatsWithApiData = (questionData, commentData, rowstatsContainersByIds) => {
    /* Insert question scores (for all rows),
     * question acceptance attribute,
     * answer score (for the answer the comment is on, or for the best answer on the question),
     * answer acceptance attribute (for the same answer as above),
     * answer count (if >= 2 answers),
     * comment score (if score > 0)
     */
    questionData.items.forEach(({ answers = [], closed_reason, question_id, score }) => {
        const answersByAnswerId = answers.reduce((a, answer) => {
            a[answer.answer_id] = answer;
            return a;
        }, {});
        const plusMore = answers && answers.length > 1 ? answers.length - 1 : 0;
        rowstatsContainersByIds.byQuestion.get(question_id).forEach((rowstatsContainer) => {
            const [questionBox, answerBox] = rowstatsContainer.children;
            questionBox.textContent = String(score);
            if (plusMore) {
                rowstatsContainer.insertAdjacentHTML('beforeend', `<div data-cpuserscript-more-answers=""><span>+ ${plusMore} more</span></div>`);
            }
            const commentAnchor = rowstatsContainer.closest('td').nextElementSibling.querySelector('a');
            if (closed_reason && !commentAnchor.textContent.endsWith(']')) {
                commentAnchor.innerHTML += ` [${closed_reason}]`;
            }
            const bestAnswer = getBestAnswer(answers);
            if (bestAnswer && bestAnswer.is_accepted) {
                questionBox.setAttribute('data-cpuserscript-accepted', '');
            }
            const postId = Number(rowstatsContainer.closest('tr').dataset.postid);
            const postIsQuestion = commentAnchor.href.endsWith(String(question_id));
            const answerToDisplay = postIsQuestion ? bestAnswer : answersByAnswerId[postId];
            if (!answerToDisplay) {
                return;
            }
            if (answerToDisplay.is_accepted) {
                answerBox.setAttribute('data-cpuserscript-accepted', '');
            }
            answerBox.textContent = String(answerToDisplay.score);
        });
    });
    commentData.items.forEach(({ score, comment_id }) => {
        if (score > 0) {
            const rowstatsContainer = rowstatsContainersByIds.byComment.get(comment_id);
            rowstatsContainer.insertAdjacentHTML('beforeend', `<div data-cpuserscript-comment-score>${score}</div>`);
        }
    });
};


/***/ }),

/***/ "./build/watchForCommentTab/processApiResponse/removeEmptyContainers.js":
/*!******************************************************************************!*\
  !*** ./build/watchForCommentTab/processApiResponse/removeEmptyContainers.js ***!
  \******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.removeEmptyContainers = () => {
    const commentTrs = document.querySelectorAll('.history-table > tbody tr[data-postid]');
    commentTrs.forEach((commentTr) => {
        const rowstatsContainer = commentTr.querySelector('[data-cpuserscript-rowstats]');
        const [questionBox, answerBox] = rowstatsContainer.children;
        if (!questionBox.textContent) {
            // If there's no question info, there's no info at all; the question was deleted, remove the whole container
            rowstatsContainer.remove();
        }
        else if (!answerBox.textContent) {
            answerBox.remove();
        }
    });
};


/***/ }),

/***/ "./build/watchForCommentTab/processApiResponse/removeRedundantTrs.js":
/*!***************************************************************************!*\
  !*** ./build/watchForCommentTab/processApiResponse/removeRedundantTrs.js ***!
  \***************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const commentHrefToIds_1 = __webpack_require__(/*! ../../commentHrefToIds */ "./build/commentHrefToIds.js");
/**
 * Remove the TRs at the bottom of the comment table which will be visible if user navigates to the next page
 * so as to leave visible only the TRs for deleted comments which would have fallen through the cracks due to pagination
 */
exports.removeRedundantTrs = (apiCommentIds) => {
    /* Starting at the topmost invisible tr near the bottom (these TRs were all dynamically inserted),
     * make the trs visible until you come across one whose comment_id exists
     * do not show that tr, and don't show any trs after that one either
     * because they'll all be visible at the top of the next page
     */
    const trailingRows = document.querySelectorAll('[data-cpuserscript-unverified-trailing-row]');
    let haveFoundExistingPost = false;
    trailingRows.forEach((tr) => {
        const { commentId } = commentHrefToIds_1.commentHrefToIds(tr.querySelector('a').href);
        if (apiCommentIds.has(commentId)) {
            haveFoundExistingPost = true;
        }
        if (haveFoundExistingPost) {
            tr.remove();
        }
        else {
            // Make the row visible:
            tr.removeAttribute('data-cpuserscript-unverified-trailing-row');
        }
    });
};


/***/ }),

/***/ "./build/watchForCommentTab/styleTag.js":
/*!**********************************************!*\
  !*** ./build/watchForCommentTab/styleTag.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
// tslint:disable-next-line: no-implicit-dependencies
const styleText_css_1 = __webpack_require__(/*! raw-loader!./styleText.css */ "./node_modules/raw-loader/dist/cjs.js!./build/watchForCommentTab/styleText.css");
exports.styleTag = document.createElement('style');
exports.styleTag.textContent = styleText_css_1.default;


/***/ }),

/***/ "./node_modules/localforage/dist/localforage.min.js":
/*!**********************************************************!*\
  !*** ./node_modules/localforage/dist/localforage.min.js ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var require;var require;/*!
    localForage -- Offline Storage, Improved
    Version 1.7.3
    https://localforage.github.io/localForage
    (c) 2013-2017 Mozilla, Apache License 2.0
*/
!function(a){if(true)module.exports=a();else { var b; }}(function(){return function a(b,c,d){function e(g,h){if(!c[g]){if(!b[g]){var i="function"==typeof require&&require;if(!h&&i)return require(g,!0);if(f)return f(g,!0);var j=new Error("Cannot find module '"+g+"'");throw j.code="MODULE_NOT_FOUND",j}var k=c[g]={exports:{}};b[g][0].call(k.exports,function(a){var c=b[g][1][a];return e(c||a)},k,k.exports,a,b,c,d)}return c[g].exports}for(var f="function"==typeof require&&require,g=0;g<d.length;g++)e(d[g]);return e}({1:[function(a,b,c){(function(a){"use strict";function c(){k=!0;for(var a,b,c=l.length;c;){for(b=l,l=[],a=-1;++a<c;)b[a]();c=l.length}k=!1}function d(a){1!==l.push(a)||k||e()}var e,f=a.MutationObserver||a.WebKitMutationObserver;if(f){var g=0,h=new f(c),i=a.document.createTextNode("");h.observe(i,{characterData:!0}),e=function(){i.data=g=++g%2}}else if(a.setImmediate||void 0===a.MessageChannel)e="document"in a&&"onreadystatechange"in a.document.createElement("script")?function(){var b=a.document.createElement("script");b.onreadystatechange=function(){c(),b.onreadystatechange=null,b.parentNode.removeChild(b),b=null},a.document.documentElement.appendChild(b)}:function(){setTimeout(c,0)};else{var j=new a.MessageChannel;j.port1.onmessage=c,e=function(){j.port2.postMessage(0)}}var k,l=[];b.exports=d}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],2:[function(a,b,c){"use strict";function d(){}function e(a){if("function"!=typeof a)throw new TypeError("resolver must be a function");this.state=s,this.queue=[],this.outcome=void 0,a!==d&&i(this,a)}function f(a,b,c){this.promise=a,"function"==typeof b&&(this.onFulfilled=b,this.callFulfilled=this.otherCallFulfilled),"function"==typeof c&&(this.onRejected=c,this.callRejected=this.otherCallRejected)}function g(a,b,c){o(function(){var d;try{d=b(c)}catch(b){return p.reject(a,b)}d===a?p.reject(a,new TypeError("Cannot resolve promise with itself")):p.resolve(a,d)})}function h(a){var b=a&&a.then;if(a&&("object"==typeof a||"function"==typeof a)&&"function"==typeof b)return function(){b.apply(a,arguments)}}function i(a,b){function c(b){f||(f=!0,p.reject(a,b))}function d(b){f||(f=!0,p.resolve(a,b))}function e(){b(d,c)}var f=!1,g=j(e);"error"===g.status&&c(g.value)}function j(a,b){var c={};try{c.value=a(b),c.status="success"}catch(a){c.status="error",c.value=a}return c}function k(a){return a instanceof this?a:p.resolve(new this(d),a)}function l(a){var b=new this(d);return p.reject(b,a)}function m(a){function b(a,b){function d(a){g[b]=a,++h!==e||f||(f=!0,p.resolve(j,g))}c.resolve(a).then(d,function(a){f||(f=!0,p.reject(j,a))})}var c=this;if("[object Array]"!==Object.prototype.toString.call(a))return this.reject(new TypeError("must be an array"));var e=a.length,f=!1;if(!e)return this.resolve([]);for(var g=new Array(e),h=0,i=-1,j=new this(d);++i<e;)b(a[i],i);return j}function n(a){function b(a){c.resolve(a).then(function(a){f||(f=!0,p.resolve(h,a))},function(a){f||(f=!0,p.reject(h,a))})}var c=this;if("[object Array]"!==Object.prototype.toString.call(a))return this.reject(new TypeError("must be an array"));var e=a.length,f=!1;if(!e)return this.resolve([]);for(var g=-1,h=new this(d);++g<e;)b(a[g]);return h}var o=a(1),p={},q=["REJECTED"],r=["FULFILLED"],s=["PENDING"];b.exports=e,e.prototype.catch=function(a){return this.then(null,a)},e.prototype.then=function(a,b){if("function"!=typeof a&&this.state===r||"function"!=typeof b&&this.state===q)return this;var c=new this.constructor(d);if(this.state!==s){g(c,this.state===r?a:b,this.outcome)}else this.queue.push(new f(c,a,b));return c},f.prototype.callFulfilled=function(a){p.resolve(this.promise,a)},f.prototype.otherCallFulfilled=function(a){g(this.promise,this.onFulfilled,a)},f.prototype.callRejected=function(a){p.reject(this.promise,a)},f.prototype.otherCallRejected=function(a){g(this.promise,this.onRejected,a)},p.resolve=function(a,b){var c=j(h,b);if("error"===c.status)return p.reject(a,c.value);var d=c.value;if(d)i(a,d);else{a.state=r,a.outcome=b;for(var e=-1,f=a.queue.length;++e<f;)a.queue[e].callFulfilled(b)}return a},p.reject=function(a,b){a.state=q,a.outcome=b;for(var c=-1,d=a.queue.length;++c<d;)a.queue[c].callRejected(b);return a},e.resolve=k,e.reject=l,e.all=m,e.race=n},{1:1}],3:[function(a,b,c){(function(b){"use strict";"function"!=typeof b.Promise&&(b.Promise=a(2))}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{2:2}],4:[function(a,b,c){"use strict";function d(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function e(){try{if("undefined"!=typeof indexedDB)return indexedDB;if("undefined"!=typeof webkitIndexedDB)return webkitIndexedDB;if("undefined"!=typeof mozIndexedDB)return mozIndexedDB;if("undefined"!=typeof OIndexedDB)return OIndexedDB;if("undefined"!=typeof msIndexedDB)return msIndexedDB}catch(a){return}}function f(){try{if(!ua)return!1;var a="undefined"!=typeof openDatabase&&/(Safari|iPhone|iPad|iPod)/.test(navigator.userAgent)&&!/Chrome/.test(navigator.userAgent)&&!/BlackBerry/.test(navigator.platform),b="function"==typeof fetch&&-1!==fetch.toString().indexOf("[native code");return(!a||b)&&"undefined"!=typeof indexedDB&&"undefined"!=typeof IDBKeyRange}catch(a){return!1}}function g(a,b){a=a||[],b=b||{};try{return new Blob(a,b)}catch(f){if("TypeError"!==f.name)throw f;for(var c="undefined"!=typeof BlobBuilder?BlobBuilder:"undefined"!=typeof MSBlobBuilder?MSBlobBuilder:"undefined"!=typeof MozBlobBuilder?MozBlobBuilder:WebKitBlobBuilder,d=new c,e=0;e<a.length;e+=1)d.append(a[e]);return d.getBlob(b.type)}}function h(a,b){b&&a.then(function(a){b(null,a)},function(a){b(a)})}function i(a,b,c){"function"==typeof b&&a.then(b),"function"==typeof c&&a.catch(c)}function j(a){return"string"!=typeof a&&(console.warn(a+" used as a key, but it is not a string."),a=String(a)),a}function k(){if(arguments.length&&"function"==typeof arguments[arguments.length-1])return arguments[arguments.length-1]}function l(a){for(var b=a.length,c=new ArrayBuffer(b),d=new Uint8Array(c),e=0;e<b;e++)d[e]=a.charCodeAt(e);return c}function m(a){return new va(function(b){var c=a.transaction(wa,Ba),d=g([""]);c.objectStore(wa).put(d,"key"),c.onabort=function(a){a.preventDefault(),a.stopPropagation(),b(!1)},c.oncomplete=function(){var a=navigator.userAgent.match(/Chrome\/(\d+)/),c=navigator.userAgent.match(/Edge\//);b(c||!a||parseInt(a[1],10)>=43)}}).catch(function(){return!1})}function n(a){return"boolean"==typeof xa?va.resolve(xa):m(a).then(function(a){return xa=a})}function o(a){var b=ya[a.name],c={};c.promise=new va(function(a,b){c.resolve=a,c.reject=b}),b.deferredOperations.push(c),b.dbReady?b.dbReady=b.dbReady.then(function(){return c.promise}):b.dbReady=c.promise}function p(a){var b=ya[a.name],c=b.deferredOperations.pop();if(c)return c.resolve(),c.promise}function q(a,b){var c=ya[a.name],d=c.deferredOperations.pop();if(d)return d.reject(b),d.promise}function r(a,b){return new va(function(c,d){if(ya[a.name]=ya[a.name]||B(),a.db){if(!b)return c(a.db);o(a),a.db.close()}var e=[a.name];b&&e.push(a.version);var f=ua.open.apply(ua,e);b&&(f.onupgradeneeded=function(b){var c=f.result;try{c.createObjectStore(a.storeName),b.oldVersion<=1&&c.createObjectStore(wa)}catch(c){if("ConstraintError"!==c.name)throw c;console.warn('The database "'+a.name+'" has been upgraded from version '+b.oldVersion+" to version "+b.newVersion+', but the storage "'+a.storeName+'" already exists.')}}),f.onerror=function(a){a.preventDefault(),d(f.error)},f.onsuccess=function(){c(f.result),p(a)}})}function s(a){return r(a,!1)}function t(a){return r(a,!0)}function u(a,b){if(!a.db)return!0;var c=!a.db.objectStoreNames.contains(a.storeName),d=a.version<a.db.version,e=a.version>a.db.version;if(d&&(a.version!==b&&console.warn('The database "'+a.name+"\" can't be downgraded from version "+a.db.version+" to version "+a.version+"."),a.version=a.db.version),e||c){if(c){var f=a.db.version+1;f>a.version&&(a.version=f)}return!0}return!1}function v(a){return new va(function(b,c){var d=new FileReader;d.onerror=c,d.onloadend=function(c){var d=btoa(c.target.result||"");b({__local_forage_encoded_blob:!0,data:d,type:a.type})},d.readAsBinaryString(a)})}function w(a){return g([l(atob(a.data))],{type:a.type})}function x(a){return a&&a.__local_forage_encoded_blob}function y(a){var b=this,c=b._initReady().then(function(){var a=ya[b._dbInfo.name];if(a&&a.dbReady)return a.dbReady});return i(c,a,a),c}function z(a){o(a);for(var b=ya[a.name],c=b.forages,d=0;d<c.length;d++){var e=c[d];e._dbInfo.db&&(e._dbInfo.db.close(),e._dbInfo.db=null)}return a.db=null,s(a).then(function(b){return a.db=b,u(a)?t(a):b}).then(function(d){a.db=b.db=d;for(var e=0;e<c.length;e++)c[e]._dbInfo.db=d}).catch(function(b){throw q(a,b),b})}function A(a,b,c,d){void 0===d&&(d=1);try{var e=a.db.transaction(a.storeName,b);c(null,e)}catch(e){if(d>0&&(!a.db||"InvalidStateError"===e.name||"NotFoundError"===e.name))return va.resolve().then(function(){if(!a.db||"NotFoundError"===e.name&&!a.db.objectStoreNames.contains(a.storeName)&&a.version<=a.db.version)return a.db&&(a.version=a.db.version+1),t(a)}).then(function(){return z(a).then(function(){A(a,b,c,d-1)})}).catch(c);c(e)}}function B(){return{forages:[],db:null,dbReady:null,deferredOperations:[]}}function C(a){function b(){return va.resolve()}var c=this,d={db:null};if(a)for(var e in a)d[e]=a[e];var f=ya[d.name];f||(f=B(),ya[d.name]=f),f.forages.push(c),c._initReady||(c._initReady=c.ready,c.ready=y);for(var g=[],h=0;h<f.forages.length;h++){var i=f.forages[h];i!==c&&g.push(i._initReady().catch(b))}var j=f.forages.slice(0);return va.all(g).then(function(){return d.db=f.db,s(d)}).then(function(a){return d.db=a,u(d,c._defaultConfig.version)?t(d):a}).then(function(a){d.db=f.db=a,c._dbInfo=d;for(var b=0;b<j.length;b++){var e=j[b];e!==c&&(e._dbInfo.db=d.db,e._dbInfo.version=d.version)}})}function D(a,b){var c=this;a=j(a);var d=new va(function(b,d){c.ready().then(function(){A(c._dbInfo,Aa,function(e,f){if(e)return d(e);try{var g=f.objectStore(c._dbInfo.storeName),h=g.get(a);h.onsuccess=function(){var a=h.result;void 0===a&&(a=null),x(a)&&(a=w(a)),b(a)},h.onerror=function(){d(h.error)}}catch(a){d(a)}})}).catch(d)});return h(d,b),d}function E(a,b){var c=this,d=new va(function(b,d){c.ready().then(function(){A(c._dbInfo,Aa,function(e,f){if(e)return d(e);try{var g=f.objectStore(c._dbInfo.storeName),h=g.openCursor(),i=1;h.onsuccess=function(){var c=h.result;if(c){var d=c.value;x(d)&&(d=w(d));var e=a(d,c.key,i++);void 0!==e?b(e):c.continue()}else b()},h.onerror=function(){d(h.error)}}catch(a){d(a)}})}).catch(d)});return h(d,b),d}function F(a,b,c){var d=this;a=j(a);var e=new va(function(c,e){var f;d.ready().then(function(){return f=d._dbInfo,"[object Blob]"===za.call(b)?n(f.db).then(function(a){return a?b:v(b)}):b}).then(function(b){A(d._dbInfo,Ba,function(f,g){if(f)return e(f);try{var h=g.objectStore(d._dbInfo.storeName);null===b&&(b=void 0);var i=h.put(b,a);g.oncomplete=function(){void 0===b&&(b=null),c(b)},g.onabort=g.onerror=function(){var a=i.error?i.error:i.transaction.error;e(a)}}catch(a){e(a)}})}).catch(e)});return h(e,c),e}function G(a,b){var c=this;a=j(a);var d=new va(function(b,d){c.ready().then(function(){A(c._dbInfo,Ba,function(e,f){if(e)return d(e);try{var g=f.objectStore(c._dbInfo.storeName),h=g.delete(a);f.oncomplete=function(){b()},f.onerror=function(){d(h.error)},f.onabort=function(){var a=h.error?h.error:h.transaction.error;d(a)}}catch(a){d(a)}})}).catch(d)});return h(d,b),d}function H(a){var b=this,c=new va(function(a,c){b.ready().then(function(){A(b._dbInfo,Ba,function(d,e){if(d)return c(d);try{var f=e.objectStore(b._dbInfo.storeName),g=f.clear();e.oncomplete=function(){a()},e.onabort=e.onerror=function(){var a=g.error?g.error:g.transaction.error;c(a)}}catch(a){c(a)}})}).catch(c)});return h(c,a),c}function I(a){var b=this,c=new va(function(a,c){b.ready().then(function(){A(b._dbInfo,Aa,function(d,e){if(d)return c(d);try{var f=e.objectStore(b._dbInfo.storeName),g=f.count();g.onsuccess=function(){a(g.result)},g.onerror=function(){c(g.error)}}catch(a){c(a)}})}).catch(c)});return h(c,a),c}function J(a,b){var c=this,d=new va(function(b,d){if(a<0)return void b(null);c.ready().then(function(){A(c._dbInfo,Aa,function(e,f){if(e)return d(e);try{var g=f.objectStore(c._dbInfo.storeName),h=!1,i=g.openCursor();i.onsuccess=function(){var c=i.result;if(!c)return void b(null);0===a?b(c.key):h?b(c.key):(h=!0,c.advance(a))},i.onerror=function(){d(i.error)}}catch(a){d(a)}})}).catch(d)});return h(d,b),d}function K(a){var b=this,c=new va(function(a,c){b.ready().then(function(){A(b._dbInfo,Aa,function(d,e){if(d)return c(d);try{var f=e.objectStore(b._dbInfo.storeName),g=f.openCursor(),h=[];g.onsuccess=function(){var b=g.result;if(!b)return void a(h);h.push(b.key),b.continue()},g.onerror=function(){c(g.error)}}catch(a){c(a)}})}).catch(c)});return h(c,a),c}function L(a,b){b=k.apply(this,arguments);var c=this.config();a="function"!=typeof a&&a||{},a.name||(a.name=a.name||c.name,a.storeName=a.storeName||c.storeName);var d,e=this;if(a.name){var f=a.name===c.name&&e._dbInfo.db,g=f?va.resolve(e._dbInfo.db):s(a).then(function(b){var c=ya[a.name],d=c.forages;c.db=b;for(var e=0;e<d.length;e++)d[e]._dbInfo.db=b;return b});d=a.storeName?g.then(function(b){if(b.objectStoreNames.contains(a.storeName)){var c=b.version+1;o(a);var d=ya[a.name],e=d.forages;b.close();for(var f=0;f<e.length;f++){var g=e[f];g._dbInfo.db=null,g._dbInfo.version=c}return new va(function(b,d){var e=ua.open(a.name,c);e.onerror=function(a){e.result.close(),d(a)},e.onupgradeneeded=function(){e.result.deleteObjectStore(a.storeName)},e.onsuccess=function(){var a=e.result;a.close(),b(a)}}).then(function(a){d.db=a;for(var b=0;b<e.length;b++){var c=e[b];c._dbInfo.db=a,p(c._dbInfo)}}).catch(function(b){throw(q(a,b)||va.resolve()).catch(function(){}),b})}}):g.then(function(b){o(a);var c=ya[a.name],d=c.forages;b.close();for(var e=0;e<d.length;e++){d[e]._dbInfo.db=null}return new va(function(b,c){var d=ua.deleteDatabase(a.name);d.onerror=d.onblocked=function(a){var b=d.result;b&&b.close(),c(a)},d.onsuccess=function(){var a=d.result;a&&a.close(),b(a)}}).then(function(a){c.db=a;for(var b=0;b<d.length;b++)p(d[b]._dbInfo)}).catch(function(b){throw(q(a,b)||va.resolve()).catch(function(){}),b})})}else d=va.reject("Invalid arguments");return h(d,b),d}function M(){return"function"==typeof openDatabase}function N(a){var b,c,d,e,f,g=.75*a.length,h=a.length,i=0;"="===a[a.length-1]&&(g--,"="===a[a.length-2]&&g--);var j=new ArrayBuffer(g),k=new Uint8Array(j);for(b=0;b<h;b+=4)c=Da.indexOf(a[b]),d=Da.indexOf(a[b+1]),e=Da.indexOf(a[b+2]),f=Da.indexOf(a[b+3]),k[i++]=c<<2|d>>4,k[i++]=(15&d)<<4|e>>2,k[i++]=(3&e)<<6|63&f;return j}function O(a){var b,c=new Uint8Array(a),d="";for(b=0;b<c.length;b+=3)d+=Da[c[b]>>2],d+=Da[(3&c[b])<<4|c[b+1]>>4],d+=Da[(15&c[b+1])<<2|c[b+2]>>6],d+=Da[63&c[b+2]];return c.length%3==2?d=d.substring(0,d.length-1)+"=":c.length%3==1&&(d=d.substring(0,d.length-2)+"=="),d}function P(a,b){var c="";if(a&&(c=Ua.call(a)),a&&("[object ArrayBuffer]"===c||a.buffer&&"[object ArrayBuffer]"===Ua.call(a.buffer))){var d,e=Ga;a instanceof ArrayBuffer?(d=a,e+=Ia):(d=a.buffer,"[object Int8Array]"===c?e+=Ka:"[object Uint8Array]"===c?e+=La:"[object Uint8ClampedArray]"===c?e+=Ma:"[object Int16Array]"===c?e+=Na:"[object Uint16Array]"===c?e+=Pa:"[object Int32Array]"===c?e+=Oa:"[object Uint32Array]"===c?e+=Qa:"[object Float32Array]"===c?e+=Ra:"[object Float64Array]"===c?e+=Sa:b(new Error("Failed to get type for BinaryArray"))),b(e+O(d))}else if("[object Blob]"===c){var f=new FileReader;f.onload=function(){var c=Ea+a.type+"~"+O(this.result);b(Ga+Ja+c)},f.readAsArrayBuffer(a)}else try{b(JSON.stringify(a))}catch(c){console.error("Couldn't convert value into a JSON string: ",a),b(null,c)}}function Q(a){if(a.substring(0,Ha)!==Ga)return JSON.parse(a);var b,c=a.substring(Ta),d=a.substring(Ha,Ta);if(d===Ja&&Fa.test(c)){var e=c.match(Fa);b=e[1],c=c.substring(e[0].length)}var f=N(c);switch(d){case Ia:return f;case Ja:return g([f],{type:b});case Ka:return new Int8Array(f);case La:return new Uint8Array(f);case Ma:return new Uint8ClampedArray(f);case Na:return new Int16Array(f);case Pa:return new Uint16Array(f);case Oa:return new Int32Array(f);case Qa:return new Uint32Array(f);case Ra:return new Float32Array(f);case Sa:return new Float64Array(f);default:throw new Error("Unkown type: "+d)}}function R(a,b,c,d){a.executeSql("CREATE TABLE IF NOT EXISTS "+b.storeName+" (id INTEGER PRIMARY KEY, key unique, value)",[],c,d)}function S(a){var b=this,c={db:null};if(a)for(var d in a)c[d]="string"!=typeof a[d]?a[d].toString():a[d];var e=new va(function(a,d){try{c.db=openDatabase(c.name,String(c.version),c.description,c.size)}catch(a){return d(a)}c.db.transaction(function(e){R(e,c,function(){b._dbInfo=c,a()},function(a,b){d(b)})},d)});return c.serializer=Va,e}function T(a,b,c,d,e,f){a.executeSql(c,d,e,function(a,g){g.code===g.SYNTAX_ERR?a.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name = ?",[b.storeName],function(a,h){h.rows.length?f(a,g):R(a,b,function(){a.executeSql(c,d,e,f)},f)},f):f(a,g)},f)}function U(a,b){var c=this;a=j(a);var d=new va(function(b,d){c.ready().then(function(){var e=c._dbInfo;e.db.transaction(function(c){T(c,e,"SELECT * FROM "+e.storeName+" WHERE key = ? LIMIT 1",[a],function(a,c){var d=c.rows.length?c.rows.item(0).value:null;d&&(d=e.serializer.deserialize(d)),b(d)},function(a,b){d(b)})})}).catch(d)});return h(d,b),d}function V(a,b){var c=this,d=new va(function(b,d){c.ready().then(function(){var e=c._dbInfo;e.db.transaction(function(c){T(c,e,"SELECT * FROM "+e.storeName,[],function(c,d){for(var f=d.rows,g=f.length,h=0;h<g;h++){var i=f.item(h),j=i.value;if(j&&(j=e.serializer.deserialize(j)),void 0!==(j=a(j,i.key,h+1)))return void b(j)}b()},function(a,b){d(b)})})}).catch(d)});return h(d,b),d}function W(a,b,c,d){var e=this;a=j(a);var f=new va(function(f,g){e.ready().then(function(){void 0===b&&(b=null);var h=b,i=e._dbInfo;i.serializer.serialize(b,function(b,j){j?g(j):i.db.transaction(function(c){T(c,i,"INSERT OR REPLACE INTO "+i.storeName+" (key, value) VALUES (?, ?)",[a,b],function(){f(h)},function(a,b){g(b)})},function(b){if(b.code===b.QUOTA_ERR){if(d>0)return void f(W.apply(e,[a,h,c,d-1]));g(b)}})})}).catch(g)});return h(f,c),f}function X(a,b,c){return W.apply(this,[a,b,c,1])}function Y(a,b){var c=this;a=j(a);var d=new va(function(b,d){c.ready().then(function(){var e=c._dbInfo;e.db.transaction(function(c){T(c,e,"DELETE FROM "+e.storeName+" WHERE key = ?",[a],function(){b()},function(a,b){d(b)})})}).catch(d)});return h(d,b),d}function Z(a){var b=this,c=new va(function(a,c){b.ready().then(function(){var d=b._dbInfo;d.db.transaction(function(b){T(b,d,"DELETE FROM "+d.storeName,[],function(){a()},function(a,b){c(b)})})}).catch(c)});return h(c,a),c}function $(a){var b=this,c=new va(function(a,c){b.ready().then(function(){var d=b._dbInfo;d.db.transaction(function(b){T(b,d,"SELECT COUNT(key) as c FROM "+d.storeName,[],function(b,c){var d=c.rows.item(0).c;a(d)},function(a,b){c(b)})})}).catch(c)});return h(c,a),c}function _(a,b){var c=this,d=new va(function(b,d){c.ready().then(function(){var e=c._dbInfo;e.db.transaction(function(c){T(c,e,"SELECT key FROM "+e.storeName+" WHERE id = ? LIMIT 1",[a+1],function(a,c){var d=c.rows.length?c.rows.item(0).key:null;b(d)},function(a,b){d(b)})})}).catch(d)});return h(d,b),d}function aa(a){var b=this,c=new va(function(a,c){b.ready().then(function(){var d=b._dbInfo;d.db.transaction(function(b){T(b,d,"SELECT key FROM "+d.storeName,[],function(b,c){for(var d=[],e=0;e<c.rows.length;e++)d.push(c.rows.item(e).key);a(d)},function(a,b){c(b)})})}).catch(c)});return h(c,a),c}function ba(a){return new va(function(b,c){a.transaction(function(d){d.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name <> '__WebKitDatabaseInfoTable__'",[],function(c,d){for(var e=[],f=0;f<d.rows.length;f++)e.push(d.rows.item(f).name);b({db:a,storeNames:e})},function(a,b){c(b)})},function(a){c(a)})})}function ca(a,b){b=k.apply(this,arguments);var c=this.config();a="function"!=typeof a&&a||{},a.name||(a.name=a.name||c.name,a.storeName=a.storeName||c.storeName);var d,e=this;return d=a.name?new va(function(b){var d;d=a.name===c.name?e._dbInfo.db:openDatabase(a.name,"","",0),b(a.storeName?{db:d,storeNames:[a.storeName]}:ba(d))}).then(function(a){return new va(function(b,c){a.db.transaction(function(d){function e(a){return new va(function(b,c){d.executeSql("DROP TABLE IF EXISTS "+a,[],function(){b()},function(a,b){c(b)})})}for(var f=[],g=0,h=a.storeNames.length;g<h;g++)f.push(e(a.storeNames[g]));va.all(f).then(function(){b()}).catch(function(a){c(a)})},function(a){c(a)})})}):va.reject("Invalid arguments"),h(d,b),d}function da(){try{return"undefined"!=typeof localStorage&&"setItem"in localStorage&&!!localStorage.setItem}catch(a){return!1}}function ea(a,b){var c=a.name+"/";return a.storeName!==b.storeName&&(c+=a.storeName+"/"),c}function fa(){var a="_localforage_support_test";try{return localStorage.setItem(a,!0),localStorage.removeItem(a),!1}catch(a){return!0}}function ga(){return!fa()||localStorage.length>0}function ha(a){var b=this,c={};if(a)for(var d in a)c[d]=a[d];return c.keyPrefix=ea(a,b._defaultConfig),ga()?(b._dbInfo=c,c.serializer=Va,va.resolve()):va.reject()}function ia(a){var b=this,c=b.ready().then(function(){for(var a=b._dbInfo.keyPrefix,c=localStorage.length-1;c>=0;c--){var d=localStorage.key(c);0===d.indexOf(a)&&localStorage.removeItem(d)}});return h(c,a),c}function ja(a,b){var c=this;a=j(a);var d=c.ready().then(function(){var b=c._dbInfo,d=localStorage.getItem(b.keyPrefix+a);return d&&(d=b.serializer.deserialize(d)),d});return h(d,b),d}function ka(a,b){var c=this,d=c.ready().then(function(){for(var b=c._dbInfo,d=b.keyPrefix,e=d.length,f=localStorage.length,g=1,h=0;h<f;h++){var i=localStorage.key(h);if(0===i.indexOf(d)){var j=localStorage.getItem(i);if(j&&(j=b.serializer.deserialize(j)),void 0!==(j=a(j,i.substring(e),g++)))return j}}});return h(d,b),d}function la(a,b){var c=this,d=c.ready().then(function(){var b,d=c._dbInfo;try{b=localStorage.key(a)}catch(a){b=null}return b&&(b=b.substring(d.keyPrefix.length)),b});return h(d,b),d}function ma(a){var b=this,c=b.ready().then(function(){for(var a=b._dbInfo,c=localStorage.length,d=[],e=0;e<c;e++){var f=localStorage.key(e);0===f.indexOf(a.keyPrefix)&&d.push(f.substring(a.keyPrefix.length))}return d});return h(c,a),c}function na(a){var b=this,c=b.keys().then(function(a){return a.length});return h(c,a),c}function oa(a,b){var c=this;a=j(a);var d=c.ready().then(function(){var b=c._dbInfo;localStorage.removeItem(b.keyPrefix+a)});return h(d,b),d}function pa(a,b,c){var d=this;a=j(a);var e=d.ready().then(function(){void 0===b&&(b=null);var c=b;return new va(function(e,f){var g=d._dbInfo;g.serializer.serialize(b,function(b,d){if(d)f(d);else try{localStorage.setItem(g.keyPrefix+a,b),e(c)}catch(a){"QuotaExceededError"!==a.name&&"NS_ERROR_DOM_QUOTA_REACHED"!==a.name||f(a),f(a)}})})});return h(e,c),e}function qa(a,b){if(b=k.apply(this,arguments),a="function"!=typeof a&&a||{},!a.name){var c=this.config();a.name=a.name||c.name,a.storeName=a.storeName||c.storeName}var d,e=this;return d=a.name?new va(function(b){b(a.storeName?ea(a,e._defaultConfig):a.name+"/")}).then(function(a){for(var b=localStorage.length-1;b>=0;b--){var c=localStorage.key(b);0===c.indexOf(a)&&localStorage.removeItem(c)}}):va.reject("Invalid arguments"),h(d,b),d}function ra(a,b){a[b]=function(){var c=arguments;return a.ready().then(function(){return a[b].apply(a,c)})}}function sa(){for(var a=1;a<arguments.length;a++){var b=arguments[a];if(b)for(var c in b)b.hasOwnProperty(c)&&($a(b[c])?arguments[0][c]=b[c].slice():arguments[0][c]=b[c])}return arguments[0]}var ta="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(a){return typeof a}:function(a){return a&&"function"==typeof Symbol&&a.constructor===Symbol&&a!==Symbol.prototype?"symbol":typeof a},ua=e();"undefined"==typeof Promise&&a(3);var va=Promise,wa="local-forage-detect-blob-support",xa=void 0,ya={},za=Object.prototype.toString,Aa="readonly",Ba="readwrite",Ca={_driver:"asyncStorage",_initStorage:C,_support:f(),iterate:E,getItem:D,setItem:F,removeItem:G,clear:H,length:I,key:J,keys:K,dropInstance:L},Da="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",Ea="~~local_forage_type~",Fa=/^~~local_forage_type~([^~]+)~/,Ga="__lfsc__:",Ha=Ga.length,Ia="arbf",Ja="blob",Ka="si08",La="ui08",Ma="uic8",Na="si16",Oa="si32",Pa="ur16",Qa="ui32",Ra="fl32",Sa="fl64",Ta=Ha+Ia.length,Ua=Object.prototype.toString,Va={serialize:P,deserialize:Q,stringToBuffer:N,bufferToString:O},Wa={_driver:"webSQLStorage",_initStorage:S,_support:M(),iterate:V,getItem:U,setItem:X,removeItem:Y,clear:Z,length:$,key:_,keys:aa,dropInstance:ca},Xa={_driver:"localStorageWrapper",_initStorage:ha,_support:da(),iterate:ka,getItem:ja,setItem:pa,removeItem:oa,clear:ia,length:na,key:la,keys:ma,dropInstance:qa},Ya=function(a,b){return a===b||"number"==typeof a&&"number"==typeof b&&isNaN(a)&&isNaN(b)},Za=function(a,b){for(var c=a.length,d=0;d<c;){if(Ya(a[d],b))return!0;d++}return!1},$a=Array.isArray||function(a){return"[object Array]"===Object.prototype.toString.call(a)},_a={},ab={},bb={INDEXEDDB:Ca,WEBSQL:Wa,LOCALSTORAGE:Xa},cb=[bb.INDEXEDDB._driver,bb.WEBSQL._driver,bb.LOCALSTORAGE._driver],db=["dropInstance"],eb=["clear","getItem","iterate","key","keys","length","removeItem","setItem"].concat(db),fb={description:"",driver:cb.slice(),name:"localforage",size:4980736,storeName:"keyvaluepairs",version:1},gb=function(){function a(b){d(this,a);for(var c in bb)if(bb.hasOwnProperty(c)){var e=bb[c],f=e._driver;this[c]=f,_a[f]||this.defineDriver(e)}this._defaultConfig=sa({},fb),this._config=sa({},this._defaultConfig,b),this._driverSet=null,this._initDriver=null,this._ready=!1,this._dbInfo=null,this._wrapLibraryMethodsWithReady(),this.setDriver(this._config.driver).catch(function(){})}return a.prototype.config=function(a){if("object"===(void 0===a?"undefined":ta(a))){if(this._ready)return new Error("Can't call config() after localforage has been used.");for(var b in a){if("storeName"===b&&(a[b]=a[b].replace(/\W/g,"_")),"version"===b&&"number"!=typeof a[b])return new Error("Database version must be a number.");this._config[b]=a[b]}return!("driver"in a&&a.driver)||this.setDriver(this._config.driver)}return"string"==typeof a?this._config[a]:this._config},a.prototype.defineDriver=function(a,b,c){var d=new va(function(b,c){try{var d=a._driver,e=new Error("Custom driver not compliant; see https://mozilla.github.io/localForage/#definedriver");if(!a._driver)return void c(e);for(var f=eb.concat("_initStorage"),g=0,i=f.length;g<i;g++){var j=f[g];if((!Za(db,j)||a[j])&&"function"!=typeof a[j])return void c(e)}(function(){for(var b=function(a){return function(){var b=new Error("Method "+a+" is not implemented by the current driver"),c=va.reject(b);return h(c,arguments[arguments.length-1]),c}},c=0,d=db.length;c<d;c++){var e=db[c];a[e]||(a[e]=b(e))}})();var k=function(c){_a[d]&&console.info("Redefining LocalForage driver: "+d),_a[d]=a,ab[d]=c,b()};"_support"in a?a._support&&"function"==typeof a._support?a._support().then(k,c):k(!!a._support):k(!0)}catch(a){c(a)}});return i(d,b,c),d},a.prototype.driver=function(){return this._driver||null},a.prototype.getDriver=function(a,b,c){var d=_a[a]?va.resolve(_a[a]):va.reject(new Error("Driver not found."));return i(d,b,c),d},a.prototype.getSerializer=function(a){var b=va.resolve(Va);return i(b,a),b},a.prototype.ready=function(a){var b=this,c=b._driverSet.then(function(){return null===b._ready&&(b._ready=b._initDriver()),b._ready});return i(c,a,a),c},a.prototype.setDriver=function(a,b,c){function d(){g._config.driver=g.driver()}function e(a){return g._extend(a),d(),g._ready=g._initStorage(g._config),g._ready}function f(a){return function(){function b(){for(;c<a.length;){var f=a[c];return c++,g._dbInfo=null,g._ready=null,g.getDriver(f).then(e).catch(b)}d();var h=new Error("No available storage method found.");return g._driverSet=va.reject(h),g._driverSet}var c=0;return b()}}var g=this;$a(a)||(a=[a]);var h=this._getSupportedDrivers(a),j=null!==this._driverSet?this._driverSet.catch(function(){return va.resolve()}):va.resolve();return this._driverSet=j.then(function(){var a=h[0];return g._dbInfo=null,g._ready=null,g.getDriver(a).then(function(a){g._driver=a._driver,d(),g._wrapLibraryMethodsWithReady(),g._initDriver=f(h)})}).catch(function(){d();var a=new Error("No available storage method found.");return g._driverSet=va.reject(a),g._driverSet}),i(this._driverSet,b,c),this._driverSet},a.prototype.supports=function(a){return!!ab[a]},a.prototype._extend=function(a){sa(this,a)},a.prototype._getSupportedDrivers=function(a){for(var b=[],c=0,d=a.length;c<d;c++){var e=a[c];this.supports(e)&&b.push(e)}return b},a.prototype._wrapLibraryMethodsWithReady=function(){for(var a=0,b=eb.length;a<b;a++)ra(this,eb[a])},a.prototype.createInstance=function(b){return new a(b)},a}(),hb=new gb;b.exports=hb},{3:3}]},{},[4])(4)});
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/raw-loader/dist/cjs.js!./build/watchForCommentTab/styleText.css":
/*!**************************************************************************************!*\
  !*** ./node_modules/raw-loader/dist/cjs.js!./build/watchForCommentTab/styleText.css ***!
  \**************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = (".history-table > thead {\n  padding-bottom: 40px; }\n  .history-table > thead th {\n    padding: 5px;\n    text-align: center; }\n  .history-table > thead th:nth-child(3) > div {\n    margin-left: 70px;\n    display: grid; }\n    .history-table > thead th:nth-child(3) > div > div:nth-child(2) {\n      grid-column: 2 / 3; }\n\n.history-table [data-cpuserscript-rowstats] {\n  width: 120px;\n  display: grid;\n  grid-column-gap: 3px;\n  grid-template-rows: 23px;\n  grid-template-columns: 36px 36px; }\n  .history-table [data-cpuserscript-rowstats] > [data-cpuserscript-qa-box] {\n    border-width: 1px;\n    border-color: #b9b9b9;\n    text-align: center; }\n    .history-table [data-cpuserscript-rowstats] > [data-cpuserscript-qa-box][data-cpuserscript-parent-post] {\n      border-style: solid; }\n    .history-table [data-cpuserscript-rowstats] > [data-cpuserscript-qa-box]:not([data-cpuserscript-parent-post]) {\n      opacity: 0.5;\n      border-style: dotted; }\n    .history-table [data-cpuserscript-rowstats] > [data-cpuserscript-qa-box][data-cpuserscript-accepted] {\n      border-color: #5fba7d;\n      background: #5fba7d;\n      color: #fff; }\n  .history-table [data-cpuserscript-rowstats] > [data-cpuserscript-comment-score] {\n    grid-column: 3 / 4;\n    grid-row: 1 / 2;\n    justify-self: end; }\n  .history-table [data-cpuserscript-rowstats] > [data-cpuserscript-more-answers] {\n    grid-column: 2 / 3;\n    grid-row: 2 / 3;\n    justify-self: start; }\n    .history-table [data-cpuserscript-rowstats] > [data-cpuserscript-more-answers] > span {\n      position: absolute;\n      font-size: smaller; }\n\n.history-table [data-cpuserscript-unverified-trailing-row] {\n  display: none; }\n\n.history-table [data-cpuserscript-post-removed] {\n  background-color: #f4eaea; }\n\n.history-table [data-cpuserscript-duplicate-removed] {\n  background-color: #d3ffc9; }\n\n.history-table [data-cpuserscript-self-deleted] {\n  background-color: #ffffcc; }\n\n.history-table [data-cpuserscript-comment-removed] {\n  background-color: #e58080; }\n");

/***/ }),

/***/ "./node_modules/webpack/buildin/global.js":
/*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || new Function("return this")();
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ })

/******/ });