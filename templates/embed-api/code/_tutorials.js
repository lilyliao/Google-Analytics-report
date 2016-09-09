gapi.analytics.ready(function() {

  /**
   * Authorize the user immediately if the user has already granted access.
   * If no access has been created, render an authorize button inside the
   * element with the ID "embed-api-auth-container".
   */
  gapi.analytics.auth.authorize({
    container: 'embed-api-auth-container',
    clientid: 'REPLACE WITH YOUR CLIENT ID'
  });


  /**
   * Create a ViewSelector for the first view to be rendered inside of an
   * element with the id "view-selector-1-container".
   */
  var viewSelector1 = new gapi.analytics.ViewSelector({
    container: 'view-selector-1-container'
  });

  /**
   * Create a ViewSelector for the second view to be rendered inside of an
   * element with the id "view-selector-2-container".
   */
  var viewSelector2 = new gapi.analytics.ViewSelector({
    container: 'view-selector-2-container'
  });


  var dataChart1 = new gapi.analytics.googleCharts.DataChart({
    query: {
      ids: 'ga:45206091',
      metrics: 'ga:sessions',
      dimensions: 'ga:week',
      'start-date': '2016-01-03',
      'end-date': 'today',
      filters: 'ga:pagePathLevel2=@Hadoop-tutorial'
    },
    chart: {
      container: 'chart-2-container',
      type: 'COLUMN',
      options: {
        width: '100%'
      }
    }
  });
  var dataChart2 = new gapi.analytics.googleCharts.DataChart({
    query: {
      ids: 'ga:45206091',
      metrics: 'ga:uniquePageviews',
      dimensions: 'ga:pageTitle',
      'start-date': '7daysAgo',
      'end-date': 'today',
      'max-results': 200,
      filters: 'ga:pagePathLevel2=@Hadoop-tutorial',
      sort: '-ga:uniquePageviews'
    },
    chart: {
      container: 'chart-1-container',
      type: 'BAR',
      options: {
        width: '100%',
        height: '3000'
      }
    }
  });
  // Render both view selectors to the page.
  dataChart1.execute();
  dataChart2.execute();
  /**
   * Update the second dataChart when the second view selecter is changed.
   */
  viewSelector1.on('change', function(ids) {
    dataChart1.set({query: {ids: ids}}).execute();
  });
  /**
   * Update the first dataChart when the first view selecter is changed.
   */
  viewSelector2.on('success', function(ids) {
    dataChart2.set({query: {ids: ids}}).execute();
  });



});
