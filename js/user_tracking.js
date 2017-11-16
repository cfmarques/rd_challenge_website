var UserTracking = (function () {
  var Store = {
    _get: function (key) {
      return JSON.parse(localStorage.getItem(key));
    },

    _set: function (key, value) {
      var stringifyValue = JSON.stringify(value);
      localStorage.setItem(key, stringifyValue);
    },

    userEmail: function () {
      return this._get('userEmail');
    },

    accessedPages: function () {
      var accessedPages = this._get('accessedPages') || [];

      if (accessedPages.length === 0) {
        this._set('accessedPages', accessedPages);
      }

      return accessedPages;
    },

    saveUserEmail: function (userEmail) {
      this._set('userEmail', userEmail);
    },

    addAccessedPage: function (accessedPage) {
      var accessedPages = this.accessedPages();
      accessedPages.push(accessedPage);
      this._set('accessedPages', accessedPages);
    },

    cleanAccessedPages: function () {
      this._set('accessedPages', []);
    }
  };

  var init = function () {
    saveAccessedPage();
    tryTrackUser();
    bindSendContactButton();
  };

  var currentPathname = function () {
    return window.location.pathname;
  };

  var currentUrl = function () {
    return window.location.href;
  };

  var currentDateTime = function () {
    return new Date().toLocaleString();
  };

  var currentAccessedPage = function () {
    return {
      url: currentUrl(),
      pathname: currentPathname(),
      datetime: currentDateTime()
    };
  };

  var tracking = function () {
    return {
      email: Store.userEmail(),
      accessed_pages: Store.accessedPages()
    }
  };

  var trackUser = function () {
    makeRequest({
      url: 'http://localhost:3000/track',
      method: 'POST',
      data: {
        tracking: tracking()
      },
      onSuccess: onTrackUserSuccess
    });
  };

  var tryTrackUser = function () {
    if (!Store.userEmail()) return;
    trackUser();
  };

  var saveAccessedPage = function () {
    Store.addAccessedPage(currentAccessedPage());
  };

  var sendContactButtonClicked = function () {
    var userEmailInput = document.getElementById('user_tracking_user_email'),
      userEmail = '';

    if (!userEmailInput) return;

    userEmail = userEmailInput.value;
    Store.saveUserEmail(userEmail);
    saveAccessedPage();
    trackUser();
  };

  var bindSendContactButton = function () {
    var sendContactButton = document.getElementById('user_tracking_send_contact'),
      that = this;

    if (!sendContactButton) return;

    sendContactButton.addEventListener('click', function () {
      sendContactButtonClicked();
    });
  };

  var onTrackUserSuccess = function () {
    Store.cleanAccessedPages();
  };

  var makeRequest = function (args) {
    var url = args.url || '',
      method = args.method || 'GET',
      onSuccess = args.onSuccess || function () {},
      onError = args.onError || function () {},
      data = args.data || {};

    axios({
      method: method,
      url: url,
      data: data
    }).then(function (response) {
      onSuccess(response);
    }).catch(function (error) {
      onError(error);
    });
  };

  return {
    init: init
  };
})();

window.addEventListener("load", UserTracking.init);
