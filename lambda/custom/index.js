'use strict';


const Alexa = require('alexa-sdk');
const APP_ID = 'amzn1.ask.skill.d6719b29-b464-402c-b5b1-120cbf204c9f';
const util = require('util');

const http = require('http'); 
const HOST = 'battlefield1408.tk';
const PORT = '5000';

const HELP_MESSAGE = 'You can say Alexa switch on all lights for 2 minutes or Alexa turn on all lights for 2 minutes';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!'


const handlers = {
    'LaunchRequest': function() {
        console.log('In LaunchRequest');
        onLauchRequest.call(this);
    },
    'Unhandled': function () {
        const speechOutput = HELP_MESSAGE;
        const reprompt = HELP_REPROMPT;

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = HELP_MESSAGE;
        const reprompt = HELP_REPROMPT;

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'manageLights': function(){
        console.log('In manageLights');
        let filledSlots = delegateSlotCollection.call(this);
        console.log('filledSlots: ' + JSON.stringify(filledSlots));

        if (!filledSlots) {
            return;
        }        
        //response
        const light = (filledSlots.SelectingLight.value).split(' ').join('_');
        const action = filledSlots.SelectingAction.value;
        
        console.log('resolutions: ' + JSON.stringify(filledSlots.SelectingLight.resolutions));
        
        const query = `${light}/${action}`;
        console.log('query: ' + query);

        httpGet(query,  (theResult) => {
            console.log("sent     : " + query);
            console.log("received : " + theResult);
                            
            const speechOutPut = theResult;
            const cardTitle = 'Switching on Settings';
            const imageObj = {
                smallImageUrl: 'https://icons8.com/icon/20183/light-on',
                largeImageUrl: 'https://icons8.com/icon/20183/light-on'
            };
            const cardContent = speechOutPut;
            this.response.speak(speechOutPut).cardRenderer(cardTitle, cardContent, imageObj);
            this.emit(':responseReady');
        });
    },
    'switchOnTheLight': function(){
        console.log('In switchOnTheLight');
        let filledSlots = delegateSlotCollection.call(this);

        

        if (!filledSlots) {
            return;
        }

        //response
        const light = filledSlots.SelectingLight.resolutions.resolutionsPerAuthority.values.value.name;
        const duration = filledSlots.SelectingDuration.resolutions.resolutionsPerAuthority.values.value.name;
        const query = `${light}/on`;

        httpGet(query,  (theResult) => {
            console.log("sent     : " + query);
            console.log("received : " + theResult);
                            
            const speechOutPut = theResult;
            const cardTitle = 'Switching on Settings';
            const imageObj = {
                smallImageUrl: 'https://icons8.com/icon/20183/light-on',
                largeImageUrl: 'https://icons8.com/icon/20183/light-on'
            };
            const cardContent = speechOutPut;
            this.response.speak(speechOutPut).cardRenderer(cardTitle, cardContent, imageObj);
            this.emit(':responseReady');
        });

    }
};


exports.handler = function(event, context, callback) {
    console.log('In index handler');
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};



/*
------------------ END OF HANDLERS ------------------
*/

// This function delegates multi-turn dialogs to Alexa.
// For more information about dialog directives see the link below.
// https://developer.amazon.com/docs/custom-skills/dialog-interface-reference.html
function delegateSlotCollection() {
    console.log("in delegateSlotCollection");
    console.log("current dialogState: " + this.event.request.dialogState);

    if (this.event.request.dialogState === "STARTED") {
        console.log("in STARTED");
        console.log(JSON.stringify(this.event));
        let updatedIntent = this.event.request.intent;
        // optionally pre-fill slots: update the intent object with slot values
        // for which you have defaults, then return Dialog.Delegate with this
        // updated intent in the updatedIntent property

        //disambiguateSlot.call(this);
        console.log("disambiguated: " + JSON.stringify(this.event));
        this.emit(":delegate", updatedIntent);
    } else if (this.event.request.dialogState !== "COMPLETED") {
        console.log("in not completed");
        let updatedIntent = this.event.request.intent;
        //console.log(JSON.stringify(this.event));

        //disambiguateSlot.call(this);
        this.emit(":delegate", updatedIntent);
    } else {
        console.log("in completed");
        console.log("returning: "+ JSON.stringify(this.event.request.intent));
        // Dialog is now complete and all required slots should be filled,
        // so call your normal intent handler.
        return this.event.request.intent.slots;
    }
    return null;
}


function onLauchRequest(){
    console.log('In onLauchRequest');
    const speechOutPut = 'What do you want to do?';
    const repromptSpeech = speechOutPut;
    const cardTitle = 'My Smart Home';
    const cardContent = speechOutPut;
    const imageObj = {
        smallImageUrl: 'https://cdn.shopify.com/s/files/1/0927/6714/files/smart-home-2005993_1280_large.png?v=1491870733',
        largeImageUrl: 'https://cdn.shopify.com/s/files/1/0927/6714/files/smart-home-2005993_1280_large.png?v=1491870733'
    };
    
    this.response.speak(speechOutPut)
            .listen(repromptSpeech)
            .cardRenderer(cardTitle, cardContent, imageObj);
    this.emit(':responseReady');
}



function httpGet(query, callback) {
    var options = {
        host: HOST,
        port: PORT,
        path: '/' + encodeURIComponent(query),
        method: 'GET',
    };

    var req = http.request(options, res => {
        res.setEncoding('utf8');
        var responseString = "";
        
        //accept incoming data asynchronously
        res.on('data', chunk => {
            responseString = responseString + chunk;
        });
        
        //return the data when streaming is complete
        res.on('end', () => {
            console.log(responseString);
            callback(responseString);
        });

    });
    req.end();
}