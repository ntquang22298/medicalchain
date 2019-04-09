const express = require("express");
const bodyparser = require("body-parser");
var network = require("./network");

const NAMESPACE = "org.example.medicalrecord"

var app = express();
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(express.static(__dirname + "/views"));

app.get("/", function (req, res) {
  res.sendfile(__dirname + "/views/index.html")
})

app.get("/api/patient/init", function(req, res) {
  let cardname = req.query.cardname;
  let data = {};
  network.getPersonalDetails(cardname).then(result => {
    data.user_info = result[0];
    network.getMedicalRecordsOfPatient(cardname).then(result => {
      let records = [];
      result.forEach(record => {
        r = {
          id: record.id,
          version: record.version,
          content: record.description,
          creatorId: record.author["$identifier"],
          ownerId: record.owner["$identifier"]
        }
        records.push(r);
      });
      data.medical_records = records;
      network.getPractitionerPublicProfileForPatient(cardname).then(result => {
        data.list_prac = result;
        res.send(data);
      })
    })
  })
})

app.get("/api/patient/medicalrecord-details", function (req, res) {
  let data = req.query.data;
  let cardname = req.query.cardname;

  network.getMedicalRecordDetailsOfPatient(cardname, data).then(histories => {
    res.send(histories);
  });
})

app.put("/api/patient", function (req, res) {
  let cardname = req.body.cardname;
  network.updatePersonalDetails(cardname, req.body.user_info).then(message => {
    if (message == "success") {
      res.json({
        message: "success"
      })
    }
    else {
      res.json({
        message: "fail"
      })
    }
  })
})

app.post("/api/grant-access-medical-record", function(req, res) {
  let data = req.body;
  let cardname = req.body.pat_id;
  network.grantAccessMedicalRecord(cardname, data.pat_id, data.prac_id).then(message => {
    if (message == "success") {
      network.getPersonalDetails(cardname).then(result => {
        ps_id = result[0].id;
        network.grantAccessPersonalDetails(cardname, data.prac_id, ps_id).then( result => {
          if (result == "success") {
            res.json({
              message: "success"
            })
          }
        })
      })
    }
  })
})

app.post("/api/revoke-access-medical-record", function(req, res) {
  let data = req.body;
  let cardname = req.body.pat_id;
  network.revokeAccessMedicalRecord(cardname, data.pat_id, data.prac_id).then( message => {
    if (message == "success") {
      network.getPersonalDetails(cardname).then( result => {
        ps_id = result[0].id;
        network.revokeAccessPersonalDetails(cardname, data.prac_id, ps_id).then(result => {
          if (result == "success") {
            res.json({
              message: "success"
            })
          }
        })
      })
    }
  })
})

app.get("/api/practitioner/init", function(req, res) {
  let cardname = req.query.cardname;
  let data = {};
  network.getPractitionerPublicProfile(cardname, cardname).then(profile => {
    data.user_info = profile;
    network.getMedicalRecordOfPractitioner(cardname).then(result => {
      let records = [];
      for (record of result) {
        r = {
          id: record.id,
          version: record.version,
          content: record.description,
          practitionerId: record.author["$identifier"],
          patientId: record.owner["$identifier"]
        }
        records.push(r);
      }
      data.medical_records = records;
      network.getListPatientofPractitioner(cardname).then(patients => {
        data.list_patient = patients;
        res.send(data);
      })
    })
  })
})


app.get("/api/practitioner/medicalrecord-details", function (req, res) {
  let data = req.query.data;
  let cardname = req.query.data.cardname;
  network.getMedicalRecordDetailsOfPractitioner(cardname ,data).then( histories => {
    res.send(histories);
  });
})

app.post("/api/practitioner/create-medical-record", function(req, res) {
  let data = req.body;
  let cardname = req.body.cardname;
  
  network.createMedicalRecord(cardname, data.pat_id, data.prac_id, data.content).then( message => {
    res.json({
      message: message
    })
  })
})

app.post("/api/practitioner/update-medical-record", function(req, res) {
  let data = req.body;
  let cardname = req.body.cardname;
  network.updateMedicalRecord(cardname, data.medicalrecord_id, data.prac_id, data.content).then(message => {
    res.json({
      message: message
    })
  })
})

app.post("/api/register-patient", function (req, res) {
  let data = req.body;
  
  network.registerPatient(data).then((message) => {
    if (message == "success") {
      res.json({
        message: "success"
      })
    }
    else {
      res.json({
        message: "fail"
      })
    }
  })
})

app.post("/api/register-practitioner", function (req, res) {
  let data = req.body;
  
  network.registerPractitioner(data).then((message) =>{
    if (message == "success") {
      res.json({
        message: "success"
      })
    }
    else {
      res.json({
        message: "fail"
      })
    }
  })
})

app.post("/api/login", function (req, res) {
  cardname = req.body.cardname;
  type_user = req.body.type_user;
  
  network.connect(cardname, type_user).then(result => {
    res.json(result)
  });
})

app.post("/api/logout", function (req, res) {
  network.logout(req.body.cardname).then((result) =>{
    res.json({
      message: result
    })
  })
})

app.listen(8000, function () {
  console.log("App listening on port 8000");
})
