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
   * Create a new ViewSelector instance to be rendered inside of an
   * element with the id "view-selector-container".
   */
  var viewSelector = new gapi.analytics.ViewSelector({
    container: 'view-selector-container'
  });


  /**
   * Create a new DataChart instance with the given query parameters
   * and Google chart options. It will be rendered inside an element
   * with the id "chart-container".
   */
  var dataChart1 = new gapi.analytics.googleCharts.DataChart({
    query: {
      ids: 'ga:45206091',
      metrics: 'ga:sessions',
      dimensions: 'ga:date',
      'start-date': '7daysAgo',
      'end-date': 'yesterday'
    },
    chart: {
      container: 'chart-1-container',
      type: 'LINE',
      options: {
        width: '100%'
      }
    }
  });
  dataChart1.execute();

  var dataChart2 = new gapi.analytics.googleCharts.DataChart({
    query: {
      ids: 'ga:110038179',
      metrics: 'ga:sessions',
      dimensions: 'ga:date',
      'start-date': '7daysAgo',
      'end-date': 'yesterday'
    },
    chart: {
      container: 'chart-2-container',
      type: 'LINE',
      options: {
        width: '100%'
      }
    }
  });
  dataChart2.execute();

  var dataChart3 = new gapi.analytics.googleCharts.DataChart({
    query: {
      ids: 'ga:129299210',
      metrics: 'ga:sessions',
      dimensions: 'ga:date',
      'start-date': '7daysAgo',
      'end-date': 'yesterday'
    },
    chart: {
      container: 'chart-3-container',
      type: 'LINE',
      options: {
        width: '100%'
      }
    }
  });
  dataChart3.execute();

  var dataChart4 = new gapi.analytics.googleCharts.DataChart({
    query: {
      ids: 'ga:88864211',
      metrics: 'ga:sessions',
      dimensions: 'ga:date',
      'start-date': '7daysAgo',
      'end-date': 'today'
    },
    chart: {
      container: 'chart-4-container',
      type: 'LINE',
      options: {
        width: '100%'
      }
    }
  });
  dataChart4.execute();
  /**
   * Render the dataChart on the page whenever a new view is selected.
   */
  viewSelector.on('change', function(ids) {
    dataChart.set({query: {ids: ids}}).execute();
  });

});
