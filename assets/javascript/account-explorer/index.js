// Copyright 2014 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


/* global gapi */
var $ = require('jquery');
var accountSummaries = require('javascript-api-utils/lib/account-summaries');


function setup() {
  $('#search-box').on('input', handleSearch);
  $('#search-box').trigger('focus');

  accountSummaries.get().then(function(summaries) {
    var urlHash = getMapFromHash();
    var validIds = returnValidIds(summaries, urlHash);
    var allIds = getAllIds(summaries, validIds);

    setViewSelector(summaries, allIds.viewId);
  });
}


/**
 * Handler for search box. Searches the user input for account, property, and
 * view names and ids. Not case sensitive. Displays the results in the DOM.
 */
function handleSearch() {

  var searchTerm = $('#search-box').val().toLowerCase();

  accountSummaries.get().then(function(summaries) {
    var results = [];
    if (searchTerm) {
      for (var i = 0; i < summaries.all().length; i++) {
        var account = summaries.all()[i];
        if (!account.webProperties) {
          continue;
        }
        for (var j = 0; j < account.webProperties.length; j++) {
          var property = account.webProperties[j];
          if (!property.profiles) {
            continue;
          }
          for (var k = 0; k < property.profiles.length; k++) {
            var view = property.profiles[k];
            var tableId = 'ga:' + view.id;
            var match = tableId.indexOf(searchTerm) > -1 ||
                        view.id.indexOf(searchTerm) > -1 ||
                        view.name.toLowerCase().indexOf(searchTerm) > -1 ||
                        property.id.toLowerCase().indexOf(searchTerm) > -1 ||
                        property.name.toLowerCase().indexOf(searchTerm) > -1 ||
                        account.id.indexOf(searchTerm) > -1 ||
                        account.name.toLowerCase().indexOf(searchTerm) > -1;
            if (match) {
              results.push({account: account, property: property, view: view});
            }
          }
        }
      }
    }
    updateResults(results, $('#search-box').val());
  });
}

/**
 * Updates the DOM with a table of account, property, and view names and ids.
 * @param {Array} results The results to be added to the DOM.
 * @param {string} opt_query The user inputed search text.
 */
function updateResults(results, opt_query) {
  $('#results-container').html('<table>' +
    '<thead>' +
      '<tr>' +
        '<th>Account</th>' +
        '<th>Property (Tracking ID)</th>' +
        '<th>View</th>' +
        '<th>Table ID (ids)</th>' +
      '</tr>' +
    '</thead>' +
    '<tbody id="results-body"></tbody>' +
  '</table>');

  function mark(text) {
    if (opt_query) {
      var regex = new RegExp('(' + opt_query + ')', 'ig');
      return text.replace(regex, '<mark>$1</mark>');
    }
    else {
      return text;
    }
  }

  var searchResults = $('#results-body');
  if (results.length === 0) {
    searchResults.append('<td colspan="4">No results found</td>');
  }
  else {
    for (var i = 0; i < results.length; i++) {
      searchResults.append('<tr class="view-result"><td>' +
        mark(results[i].account.name) + ' <div class="AccountExplorerResults-id">' +
        mark(results[i].account.id) + '</div></td><td>' +
        mark(results[i].property.name) + ' <div class="AccountExplorerResults-id">' +
        mark(results[i].property.id) + '</div></td><td>' +
        '<a href="//www.google.com/analytics/web/#report/visitors-overview/a' +
        results[i].account.id + 'w' + results[i].property.internalWebPropertyId + 'p' +
        results[i].view.id + '" title="Open this view in Google Analytics">' +
        mark(results[i].view.name) + ' ' +
        '<svg class="Icon" viewBox="0 0 16 16">' +
          '<use xlink:href="/public/images/icons.svg#icon-popout"></use>' +
        '</svg></a> ' +
        '<div class="AccountExplorerResults-id">' +
        mark(results[i].view.id) + '</div></td><td><div ' + 'class="AccountExplorerResults-id">' +
        mark('ga:' + results[i].view.id) + '</div></td></tr>');
    }
  }

  if (typeof opt_query == 'string') {
    $('#results-title').text('Showing results for "' + opt_query + '"');
  }
}

/**
 * Creates and sets the viewSelector
 * @param {Object} summaries The account summaries response.
 * @param {String} viewId The view ID to set the viewSelector to
 */
function setViewSelector(summaries, viewId) {
  var viewSelector = new gapi.analytics.ext.ViewSelector2({
   container: 'view-selector-container'
  }).execute();
  viewSelector.set({viewId: viewId});

  function getIdsAndUpdateResults() {
    // Use a try/catch block in case we have sparse properties or accounts.
    try {
      var allIds = {
        viewId: viewSelector.view.id,
        propertyId: viewSelector.property.id,
        accountId: viewSelector.account.id
      };
      var allObjects = {
        view: viewSelector.view,
        property: viewSelector.property,
        account: viewSelector.account
      };
      updateResults([allObjects]);
      $('#search-box').val('');
      $('#results-title').text('Showing view selected above');
    }
    catch (e) {}
  }

  viewSelector.on('change', getIdsAndUpdateResults);
  $('#view-selector-container').on('focusout', getIdsAndUpdateResults);
}


/**
 * Given a potentially invalid view and/or property and/or account ID(s),
 * returns an object with only the valid view, property, and account IDs
 * (among those given).
 * @param {Object} summaries The account summaries response.
 * @param {Object} ids An object with one or more of the following: viewId,
 *     property ID, account ID.
 * @return {Object} An object with only the valid view, property, and account
 *     IDs (among those given).
 */
function returnValidIds(summaries, ids) {
  if (ids.viewId) {
    var view = summaries.getProfile(ids.viewId);
    ids.viewId = view ? view.id : null;
  }
  if (ids.propertyId) {
    var property = summaries.getProperty(ids.propertyId);
    ids.propertyId = property ? property.id : null;
  }
  if (ids.accountId) {
    var account = summaries.getAccount(ids.accountId);
    ids.accountId = account ? account.id : null;
  }
  return ids;
}


/**
 * Given a valid view and/or property and/or account ID(s), returns an
 * object with the associated view, property, and account IDs. If no view is
 * given, it will return the first view in the property. Similarly, if no
 * property is given, it will return the first property in the account and the
 * first view in the property.
 * @param {Object} summaries The account summaries response.
 * @param {Object} ids An object with the viewId, the property ID, and the
 *     account ID.
 * @param {Boolean} returnObject If true, will return the view, property, and
 *     account object. If false, will return the IDs.
 * @return {Object} All the associated view, property, and account IDs. If
 *     returnObject is true, will return the account objects, not the IDs.
 */
function getAllIds(summaries, ids, returnObject) {
  var accountObject = {};
  if (ids.viewId) {
    accountObject.view = summaries.getView(ids.viewId);
    accountObject.property = summaries.getPropertyByViewId(ids.viewId);
    accountObject.account = summaries.getAccountByViewId(ids.viewId);
  }
  else if (ids.propertyId) {
    accountObject.property = summaries.getProperty(ids.propertyId);
    accountObject.account =
        summaries.getAccountByWebPropertyId(ids.propertyId);
    // pick first profile
    accountObject.view = accountObject.property.views[0];
  }
  else if (ids.accountId) {
    accountObject.account = summaries.getAccount(ids.accountId);
    // pick first property and first profile
    accountObject.property = accountObject.account.properties[0];
    accountObject.view =
        summaries.getProperty(accountObject.property.id).views[0];
  }
  else {
    // pick first view property and account
    accountObject.account = summaries.all()[0];
    accountObject.property = accountObject.account.properties[0];
    accountObject.view = accountObject.property.views[0];
  }

  return returnObject ? accountObject : {viewId: accountObject.view.id,
                                         propertyId: accountObject.property.id,
                                         accountId: accountObject.account.id};
}


/**
 * Gets the URL hash and returns it as an object with each parameter as the
 * key and the parameter value as the value.
 * E.g. getMapFromHash('#viewId=123&propertyId=UA-123-4') would return
 * {viewId: '123', propertyId: 'UA-123-4'}
 * @return {Object} An object containing the parameters and values in the hash
 */
function getMapFromHash() {
  var urlHash = document.location.hash.substr(1);
  var params = urlHash.split('&');
  var map = {};
  for (var i = 0, param; param = params[i]; i++) {
    var fragment = param.split('=');
    map[fragment[0]] = fragment[1];
  }
  return map;
}


module.exports = {
  init: function() {
    gapi.analytics.ready(function() {
      if (gapi.analytics.auth.isAuthorized()) {
        setup();
      }
      else {
        gapi.analytics.auth.once('success', setup);
      }
    });
  }
};