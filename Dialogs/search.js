module.exports = function(session, args, next) {
    // perform search
    var _ = require('lodash');
    if (session.userData.search === undefined) {
        session.userData.search = 'DuckDuckGo'
    }

    var messageText = args.intent.matched[1].trim();

    if (session.userData.search === 'DuckDuckGo') {

        request = require('request');
        var url = "https://api.duckduckgo.com/?q=" + encodeURIComponent(messageText) + "&format=json&pretty=1";
        console.log("data:", messageText);
        request(url, function(err, response, body) {
            if (err) console.log(err);
            if (response.statusCode == 200) {
                body = JSON.parse(body)
                session.sendTyping();
                console.log(body);
                if (!_.isEmpty(body.AbstractText)) {
                    console.log("answer:", AbstractText);
                    session.send(body.AbstractText);
                    session.send(body.Image);
                } else if (!_.isEmpty(body.RelatedTopics[0])) {
                    session.send(body.RelatedTopics[0].Icon.URL);
                    session.send(body.RelatedTopics[0].Text);
                } else {
                    session.send('https://duckduckgo.com/?q=%s', encodeURIComponent(messageText));
                }

            } else if (response.statusCode == 500) {
                session.send("error: server error");

            } else {
                session.send("error: problem with request code: " + response.statusCode)

            }
        });
        session.send('searching ' + messageText);
        session.send('Search Result For : ' + messageText);

    } else if (session.userData.search === 'Google') {
        session.send('https://www.google.com/search?q=%s&source=lnms&tbm=isch&sa=X&ved=0ahUKEwiWoeCvzdnYAhUIzbwKHZQ4DcsQ_AUICigB&biw=2320&bih=656&dpr=0.5#imgrc=Mp6U7RbYNomHIM:', encodeURIComponent(messageText));

    } else if (session.userData.search === 'Bing') {
        session.send('https://www.bing.com/search?q=%s', encodeURIComponent(messageText));
        // session.endDialog();
    } else if (session.userData.changeSearch === 'Tanduaysky') {
        session.send("The mix of", session.userData + "is" + "tanduay og ice");
    } else {
        session.send('I dont know from where should i search ' + messageText);
    }
    session.endDialog();

};