var restify = require('restify');
var builder = require('botbuilder');
var _ = require('lodash');
let salesData  = require('./Dialogs/data.js');
salesData.func();
/*var express = require('express');*/

// Setup Restify Server pwede rasad express
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3001, function() {
    console.log('%s listening to %s', server.name, server.url);
});

//server
/*var app = express();*/

// connector para ma channel ang bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

var bot = new builder.UniversalBot(connector);


server.post('/api/messages', connector.listen());

try {
    require('fs').mkdirSync('./log');
} catch (e) {
    if (e.code != 'EEXIST') {
        console.error("Could not set up log directory, error was: ", e);
        process.exit(1);
    }
}

/**
 * Initialise log4js first, so we don't miss any log messages
 */
var log4js = require('log4js');
log4js.configure('./Configuration/log4js.json');
var log = log4js.getLogger("bot");

//=========================================================
// Bots Dialogs
//=========================================================
String.prototype.contains = function(content) {
    return this.indexOf(content) !== -1;
}

bot.dialog('/', function(session) {
    //setting default values
    if (session.userData.name === undefined) {
        session.userData.name = session.message.user.name
    }
    const Spinner = require('node-spintax');
    console.log(session.message.user.name + ' -> ' + session.message.text.toLowerCase());
    if (/^(hello|^hi|greetings)/i.test(session.message.text)) {

        var spinner = new Spinner('{Hi|Hello|Hi there|Hi ya} ' + session.userData.name + ' {How|how} {are you|ru} doing today {?|??|???}');
        session.send(spinner.unspinRandom(1));


    } else if ((m = /^(I'\m|I am|im) (?:doing)?[ ]?(good|ok|well|alright|fine|great)/i.exec(session.message.text)) !== null) {
        var spinner = new Spinner('{Awesome|cool|' + m[1] + ' also doing ' + m[2] + '}');
        session.send(spinner.unspinRandom(1));

    } else if ((m = /^(I'\m|I am not|I\'m not) (?:doing)?[ ]?(bad|good|feeling well|alright|fine| great)/i.exec(session.message.text)) !== null) {
        var spinner = new Spinner('{O sorry to hear that|so sorry|' + m[1] + ' also doing ' + m[2] + '}');
        session.send(spinner.unspinRandom(1));

    } else if ((m = /^\good (morning|evening|night)/i.exec(session.message.text)) !== null) {
        greets = Array('Good day to you too',
            'Wish you the same',
            'hmm',
            'Good ' + m[1]);
        session.send(_.sample(greets));

    } else if ((m = /^change (?:my)?[ ]?(name|search engine)/i.exec(session.message.text)) !== null) {

        if (m[1] == 'name') {
            session.beginDialog('changeName');
        } else if (m[1] == 'search engine') {
            session.beginDialog('changeSearch');
        } else {
            session.send('Sorry, I do not understand that yet..');
        }
    } else if ((m = /^show me(?:some)?[ ]?(mix|alcohol|different|samples|mixes|menu)/i.exec(session.message.text)) !== null) {
        if (m[1] == 'mix') {
            session.beginDialog('showSomeMixes');
        } else if(m[1] == 'alcohol') {
        	session.beginDialog('showSomeMixes');
       	} else if(m[1] == 'different') {
       		session.beginDialog('showSomeMixes');
       	} else if(m[1] == 'samples') {
       		session.beginDialog('showSampleS');
        } else if (m[1] == 'mixes') {
            session.beginDialog('getSalesData');
        } else if (m[1] == 'menu') {
            session.beginDialog('addDinnerItem');

        } else {
            console.log("Can't Provide You Some Mixes, error");
        }

    } else if ((m = /^reset(?:our)?[ ]?(convo|conversation|chat)/i.exec(session.message.text)) !== null) {
        if (m[1] == 'convo') {
            session.beginDialog('/');
        } else if (m[1] == 'conversation') {
            session.beginDialog('/')
        } else if (m[1] == 'chat') {
            session.beginDialog('/')
        } else {
            console.log("Can't Provide You Some Mixes, error");
        }


    } else if ((m = /^\I (love|like) (.*)/i.exec(session.message.text)) !== null) {
        replies = Array('I ' + m[1] + ' you too',
            '(blush)',
            'Thanks I ' + m[1] + ' you a lot too',
            'I ' + m[1] + ' to make new friends.',
            'i ' + m[1] + ' you too ' + session.userData.name);
        session.send(_.sample(replies));

    } else if ((m = /^\who (is|are) (you|bot)/i.exec(session.message.text)) !== null) {

        replies = Array('I am Bot Mixer',
            'I\'m Bot, at your service');
        session.send(_.sample(replies));
    } else if ((m = /^\what (can you|are you capable) (do|of)/i.exec(session.message.text)) !== null) {

        replies = Array('I can provide and give you different Alcohol Mixes',
            'I can give you an idea on mixing alcohol drinks');
        session.send(_.sample(replies));

    } else if ((m = /^\how are (you|chatti)/i.exec(session.message.text)) !== null) {
        replies = Array('I am doing good, how are you ?',
            'I\'m doing good',
            'So far so good');
        session.send(_.sample(replies));

    } else if ((m = /^(?:Tell|say) (?:something)?[ ]?(interesting|fact)/i.exec(session.message.text)) !== null) {
        request = require('request');
        session.sendTyping();
        request(`http://numbersapi.com/random/trivia`, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                session.send(body);
            }
        });

    } else if (session.message.text.toLowerCase().contains('who is me', 'tell me')) {
        session.send('Data:');
        session.send("Your name is " + session.userData.name);

    } else if (session.message.text.toLowerCase().contains('thank')) {
        session.send('You are welcome');
    } else {
        log.info(" -> " + session.message.text);
        replies = Array('Sorry I don\'t understand you...',
            'what do you mean ?',
            'Sorry, I do not understand that yet..',
            'I do not understand that yet..',
            'Can you please ask something else ?',
            ':|');
        session.send(_.sample(replies));
        console.log("datas:", _.sample(replies));
        /*if(results.response.entity == "okay") {
         session.send("Thanks good to hear , you can ask anything now");
        }*/
    }
});

// The dinner menu
var dinnerMenu = { 
     "Order dinner": {
        Description: "orderDinner",
        Price: 10
    },
    "Dinner reservation": {
        Description: "dinnerReservation",
        Price: 10
    },
    "Schedule shuttle": {
        Description: "scheduleShuttle",
        Price: 10
    },
    "Request wake-up call": {
        Description: "wakeupCall",
        Price: 10
    },
    "Check out": {
        Description: "Check out",
        Price: 0 // Order total. Updated as items are added to order.
    }

};

// Add dinner items to the list by repeating this dialog until the user says `check out`. 
bot.dialog("addDinnerItem", [
    function(session, args){
        if(args && args.reprompt){
            session.send("What else would you like to have for dinner tonight?");
        }
        else{
            // New order
            // Using the conversationData to store the orders
            session.conversationData.orders = new Array();
            session.conversationData.orders.push({ 
                Description: "Check out",
                Price: 0
            })
        }
        builder.Prompts.choice(session, "Dinner menu:", dinnerMenu);
    },
    function(session, results){
        if(results.response){
            if(results.response.entity.match(/^check out$/i)){
                session.endDialog("Checking out...");
            }
            else {
                var order = dinnerMenu[results.response.entity];
                session.conversationData.orders[0].Price += order.Price; // Add to total.
                var msg = `You ordered: ${order.Description} for a total of $${order.Price}.`;
                session.send(msg);
                session.conversationData.orders.push(order);
                session.replaceDialog("addDinnerItem", { reprompt: true }); // Repeat dinner menu
            }
        }
    }
])
.reloadAction(
    "restartOrderDinner", "Ok. Let's start over.",
    {
        matches: /^start over$/i
    }
);

bot.dialog('changeName', [
    function(session, next) {
        session.dialogData.NewName = " ";
        builder.Prompts.text(session, "Well that's new. What do you want me to call you?");
    },
    function(session, results) {
        session.dialogData.NewName = results.response;
        builder.Prompts.choice(session, "Are you sure you want me to call you " + session.dialogData.NewName + "?", ["Yes", "No"]);
    },
    function(session, results) {
        if (results.response.entity == "Yes") {
            session.userData.name = session.dialogData.NewName;
            session.endDialog("Alright " + session.userData.name + "!!!");
        } else {
            session.endDialog("Phew! I am anyways not good at remembering names.");
        }
    }
]);

bot.dialog('showSomeMixes', [
    function(session) {
        session.send("Welcome to the dinner reservation.");
        builder.Prompts.time(session, "Please provide a reservation date and time (e.g.: June 6th at 5pm)");
    },
    function(session, results) {
        session.dialogData.reservationDate = builder.EntityRecognizer.resolveTime([results.response]);
        builder.Prompts.text(session, "How many people are in your party?");
    },
    function(session, results) {
        session.dialogData.partySize = results.response;
        builder.Prompts.text(session, "Who's name will this reservation be under?");
    },
    function(session, results) {
        session.dialogData.reservationName = results.response;

        // Process request and display reservation details
        session.send(`Reservation confirmed. Reservation details: <br/>Date/Time: ${session.dialogData.reservationDate} <br/>Party size: ${session.dialogData.partySize} <br/>Reservation name: ${session.dialogData.reservationName}`);
        session.endDialog();
    }
]);

bot.dialog('showSampleS',  [
    function(session) {
        session.send("Below are the samples");
        session.dialogData.mixData = " ";
        builder.Prompts.choice(session, "Select from the following" ,  ["Tanduaysky", "Kinoter", "Mistesa", "Emplight"] );
    },
     function(session, results) {
        session.dialogData.mixData = results.response.entity;
        builder.Prompts.choice(session, "Are you sure you wanted to know the mix of" + session.dialogData.mixData + "?", ["Yes", "No"]);
    },
    function(session, results) {
        session.dialogData.partySize = results.response;
        builder.Prompts.text(session, "Who's name will this reservation be under?");
    },
    function(session, results) {
        session.dialogData.reservationName = results.response;

        // Process request and display reservation details
        session.send(`Reservation confirmed. Reservation details: <br/>Date/Time: ${session.dialogData.reservationDate} <br/>Party size: ${session.dialogData.partySize} <br/>Reservation name: ${session.dialogData.reservationName}`);
        session.endDialog();
    }
]);


bot.dialog('getSalesData', [
    function (session) {
        builder.Prompts.choice(session, "Which region would you like sales for?", salesData); 
    },
    function (session, results) {
        if (results.response) {
            var alcoholmix = salesData[results.response.entity];
            console.log("ang data:" , salesData[results.response.entity]);
            session.send(`The Mix Of ${alcoholmix.name} is ${alcoholmix.mix}.`); 
        } else {
            session.send("OK");
        }
    }
]);


bot.dialog('changeSearch', [
    function(session, next) {
        session.dialogData.NewSearch = " ";
        builder.Prompts.choice(session, "What do you want me to use to search results?", ["Bing", "Google", "DuckDuckGo", "tomon"]);
    },
    function(session, results) {
        session.dialogData.NewSearch = results.response.entity;
        builder.Prompts.choice(session, "Are you sure you want me use " + session.dialogData.NewSearch + "?", ["Yes", "No"]);
    },
    function(session, results) {
        if (results.response.entity == "Yes") {
            session.userData.search = session.dialogData.NewSearch;
            session.endDialog("Alright from now on in using " + session.userData.search + "!!!");
        } else {
            session.endDialog("I am not that good at remembering options.");
        }
    }
]);



/*var inMemoryStorage = new builder.MemoryBotStorage();
 */
// This is a dinner reservation bot that uses a waterfall technique to prompt users for input.
// search dialog
bot.dialog('search', require('./Dialogs/search'))
    .triggerAction({
        matches: /^(?:(?:what (?: is|a |is a| are |some))|search) (.*)/i,
        matches1: /^(?:(?:show me (?:a|some|example))|search) (.*)/i
    }); //regex pattern matching

bot.dialog('HelpDialog', require('./Dialogs/support'))
    .triggerAction({
        matches: [/help/i, /support/i, /problem/i]
    });

// reset bot dialog
bot.dialog('reset', function(session) {
    delete session.userData.name
    session.endDialog('Done , You can start new topic now :)');
}).triggerAction({ matches: /^reset/i });