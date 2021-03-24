const express = require('express');
var request = require('request');

const app = express()
const port = 8080;
var DynamicsWebApiURL = "https://forms-api.transdevtest.com/api/dynamics/phonecall";
var DynamicsEnvURL = "https://tumms-dev.crm4.dynamics.com/main.aspx?appid=4c2bf6e2-79dc-ea11-a813-000d3a6545ef&forceUCI=1&pagetype=entityrecord&etn=incident&id=";
app.get('/call', async(req, res) => {
  var CustomerPhone = req.query.CustomerPhone;
  var InboundPhone = req.query.InboundPhone;
    var call = await postCall(InboundPhone, CustomerPhone);
    if(typeof call.body.status == "undefined"){
      var incidentId = call.body.href.split('(')[1].split(')')[0];
      var url = DynamicsEnvURL + incidentId;
      res.redirect(url) 
    } else {
      res.json(call.body); 
    };
})
app.get('/getContacts/:filter', async(req, res) => {
  console.log(JSON.stringify(req.params))
  var data = await getAuthToken();
  var get = await getContacts(data.access_token, req.params.filter);
  res.json(get);
})

app.listen(port, () => {
  console.log(`Dynamics-CIC app listening at http://localhost:${port}`)
});

const postCall = async function(InboundPhone, CustomerPhone){
  var options = {
      uri: DynamicsWebApiURL,
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: {
          "Channel": InboundPhone,
          "Phonenumber": CustomerPhone,
      },
      json:true
    };
  
  return new Promise(
      (resolve, reject) => {
          request(options, function (error, response) {
              if (error) {
                  console.log(error)
                  reject(error);
              }
               resolve(response);
          });
      }
  );
}

const getContacts = async function(token,filter) {
  var options = {
      'method': 'GET',
      //'url': "https://tumms-dev.crm4.dynamics.com/api/data/v9.0/contacts?$select=emailaddress1&$filter=emailaddress1 eq 'testjochem@test.nl'",
      'url': "https://tumms-dev.crm4.dynamics.com/api/data/v9.0/contacts?" + filter,
      'headers': {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
      }
  };

  return new Promise(
      (resolve, reject) => {
          request(options, function (error, response) {
              if (error) {
                  reject(error);
              }
              resolve(JSON.parse(response.body));
          });
      }
  );
}
const getAuthToken = async function() {
  var options = {
      'method': 'POST',
      'url': 'https://login.microsoftonline.com/b4518aa8-0d3e-4d10-bc77-4cd7dede3446/oauth2/token',
      'headers': {
          'Authorization': 'Basic ' + new Buffer("916cbd73-56a8-4256-a318-97a69300956d:D6m_vm-6-z4o53u1LZw6i.nYgoiN_by6ww").toString('base64'),
          'Content-Type': 'application/x-www-form-encoded'
      },
      form: {
          'grant_type': 'client_credentials',
          'resource': 'https://tumms-dev.crm4.dynamics.com'
      }
  };

  return new Promise(
      (resolve, reject) => {
          request(options, function (error, response) {
              if (error) {
                  reject(error);
              }
              resolve(JSON.parse(response.body));
          });
      }
  );
}
