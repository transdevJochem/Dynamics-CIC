const express = require('express');
var request = require('request');

const app = express()
const port = 3000
var DynamicsWebApiURL = "http://10.66.42.102:443/api/dynamics/phonecall";
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