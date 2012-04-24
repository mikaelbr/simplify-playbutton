
(function ($, window, undefined) {

    var methods = {
        baseURL: "http://localhost:5000/",

        init: function (options) {
            methods._ajaxSettings.call( this );
            methods._bindEventHandlers.call( this );
        },

        _ajaxSettings: function () {
            $.ajaxSetup({
                type: "GET",
                crossDomain: true,
                dataType: "jsonp",
                contentType: "application/json"
            });
        },

        _bindEventHandlers: function () {
            $("#play-generator").on("submit", methods._handleSubmit);
        },

        _handleSubmit: function (e) {
            e.preventDefault();

            // Get form values:
            // Should cache this in the init method.
            var elmUser = $("[name='username']"),
                elmTheme = $("[name='theme']"),
                elmView = $("[name='view']"),
                elmWidth = $("[name='width']"),
                elmHeight = $("[name='height']"),
                elmLimit = $("[name='limit']"),
                user   = elmUser.val().toLowerCase(),
                theme  = elmTheme.val().toLowerCase(),
                view   = elmView.val().toLowerCase(),
                limit  = parseInt(elmLimit.val(), 10),
                width  = parseInt(elmWidth.val(), 10),
                height = parseInt(elmHeight.val(), 10);

            $(this).find("li").removeClass("error");

            if (!methods._validateInput(elmUser, elmTheme, elmView, elmWidth, elmHeight, elmLimit)) {
                return false;
            }

            var data = methods._constructSubmitData(user, theme, view, width, height, limit);
            methods._fetch(data.url, data.data).done(methods._renderResponseCode);
            return false;
        },

        _constructSubmitData: function (user, theme, view, width, height, limit) {

            var url = methods.baseURL + user + ".json",
                data = {
                    theme: theme,
                    view: view,
                    width: width,
                    height: height,
                    limit: limit
                };

            return {
                url: url,
                data: data
            };

        },

        _validateInput: function (elmUser, elmTheme, elmView, elmWidth, elmHeight, elmLimit) {
            var validate = true,
                limit = parseInt(elmLimit.val(), 10),
                width = parseInt(elmWidth.val(), 10),
                height = parseInt(elmHeight.val(), 10);

            if (elmUser.val().length < 2) {
                methods._setValidateIndicator(elmUser);
                validate = false;
            }
            if (elmTheme.val().toLowerCase() !== "black" && elmTheme.val().toLowerCase() !== "white") {
                methods._setValidateIndicator(elmTheme);
                validate = false;
            }
            if (elmView.val().toLowerCase() !== "list" && elmView.val().toLowerCase() !== "coverart") {
                methods._setValidateIndicator(elmView);
                validate = false;
            }
            if (width < 250 || width > 640) {
                methods._setValidateIndicator(elmWidth);
                validate = false;
            }
            if (height < 80 || height > 720) {
                methods._setValidateIndicator(elmHeight);
                validate = false;
            }
            if (limit < 1 || limit > 20) {
                methods._setValidateIndicator(elmLimit);
                validate = false;
            }

            if ( !validate ) {
                $("li.error").first().find("input, select").focus();
            }

            return validate;
        },

        _setValidateIndicator: function ($elm) {
            $elm.parents("li").addClass("error");
        },

        _fetch: function (url, data) {
            return $.ajax({
                url: url,
                data: data
            });
        },

        _renderResponseCode: function (jsonData) {
            $("#generator-result").html(jsonData.HTML);
            $("[name='generator-code']").val(jsonData.HTML);
        }
    };

    $.playGenerator = function (method) {
        // Allow method calls (but not prefixed by _
        if ( typeof method === "string" && method.substr(0,1) !== "_" && methods[ method ] ) {
            return methods[method].apply(this, Array.prototype.slice.call( arguments, 1 ));
        }
        // If argument is object or not set, init plugin.
        else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        }
        // No method found by argument input. Could be a private method.
        else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.playGenerator' );
            return this;
        }
    };

    $.playGenerator();

}(jQuery, window));