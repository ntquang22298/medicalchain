const AdminConnection = require("composer-admin").AdminConnection;
const BusinessNetworkConnection = require("composer-client")
  .BusinessNetworkConnection;
const {
  BusinessNetworkDefinition,
  CertificateUtil,
  IdCard
} = require("composer-common");

//declate namespace
const namespace = "org.example.medicalrecord";

//in-memory card store for testing so cards are not persisted to the file system
const cardStore = require("composer-common").NetworkCardStoreManager.getCardStore(
  { type: "composer-wallet-inmemory" }
);

//admin connection to the blockchain, used to deploy the business network
let adminConnection;

//this is the business network connection the tests will use.
let businessNetworkConnection;

let businessNetworkName = "medicalrecord";
let factory;

async function importCardForIdentity(cardName, identity) {
  //use admin connection
  adminConnection = new AdminConnection();
  businessNetworkName = "medicalrecord";

  //declare metadata
  const metadata = {
    userName: identity.userID,
    version: 1,
    enrollmentSecret: identity.userSecret,
    businessNetwork: businessNetworkName
  };

  //get connectionProfile from json, create Idcard
  const connectionProfile = require("./local_connection.json");
  const card = new IdCard(metadata, connectionProfile);

  //import card
  await adminConnection.importCard(cardName, card);
}

module.exports = {
  registerPatient: async function(data) {
    businessNetworkConnection = new BusinessNetworkConnection();
    await businessNetworkConnection.connect("admin@medicalrecord");

    try {
      let factory = businessNetworkConnection.getBusinessNetwork().getFactory();
      let patient = factory.newResource(namespace, "Patient", data.cardname);
      patient.authorized = [];

      const participantRegistry = await businessNetworkConnection.getParticipantRegistry(
        namespace + ".Patient"
      );

      await participantRegistry.add(patient);

      const identity = await businessNetworkConnection.issueIdentity(
        namespace + ".Patient#" + data.cardname,
        data.cardname
      );

      await importCardForIdentity(
        data.cardname + "@" + businessNetworkName,
        identity
      );

      const assetRegistry = await businessNetworkConnection.getAssetRegistry(
        namespace + ".PersonalDetails"
      );

      let personaldetail_id = Math.floor(Math.random() * 10000).toString();
      let personal_detail = factory.newResource(
        namespace,
        "PersonalDetails",
        personaldetail_id
      );
      personal_detail.firstname = data.firstname;
      personal_detail.lastname = data.lastname;
      personal_detail.email = data.email;
      personal_detail.Dob = 0;
      personal_detail.permissions = [];
      let patient_relationship = factory.newRelationship(
        namespace,
        "Patient",
        data.cardname
      );
      personal_detail.owner = patient_relationship;
      let address = factory.newConcept(namespace, "Address");
      address.street = "";
      address.city = "";
      address.house = "";
      personal_detail.address = address;

      await assetRegistry.add(personal_detail);

      await businessNetworkConnection.disconnect("admin@medicalrecord");

      return "success";
    } catch (error) {
      console.log(error);
      
      return "fail"
    }
  },
  registerPractitioner: async function(data) {
    businessNetworkConnection = new BusinessNetworkConnection();
    await businessNetworkConnection.connect("admin@medicalrecord");
    try {
      let factory = businessNetworkConnection.getBusinessNetwork().getFactory();
      let practitioner = factory.newResource(namespace, "Practitioner", data.cardname);
      practitioner.patients = [];

      const participantRegistry = await businessNetworkConnection.getParticipantRegistry(
        namespace + ".Practitioner"
      );

      await participantRegistry.add(practitioner);

      const identity = await businessNetworkConnection.issueIdentity(
        namespace + ".Practitioner#" + data.cardname,
        data.cardname
      );

      await importCardForIdentity(
        data.cardname + "@" + businessNetworkName,
        identity
      );

      const assetRegistry = await businessNetworkConnection.getAssetRegistry(
        namespace + ".PractitionerPublicProfile"
      );

      let publicprofile_id = Math.floor(Math.random() * 10000).toString();
      let publicprofile = factory.newResource(
        namespace,
        "PractitionerPublicProfile",
        publicprofile_id
      );
      publicprofile.firstname = data.firstname;
      publicprofile.lastname = data.lastname;
      publicprofile.email = data.email;
      publicprofile.Dob = 0;
      publicprofile.qualifications = [];
      let practitioner_relationship = factory.newRelationship(
        namespace,
        "Practitioner",
        data.cardname
      );
      publicprofile.owner = practitioner_relationship;

      let workplace = factory.newConcept(namespace, "Workplace");
      workplace.name = ""
      let address = factory.newConcept(namespace, "Address");
      address.street = "";
      address.city = "";
      address.house = "";
      workplace.address = address;
      publicprofile.workplace = workplace;

      await assetRegistry.add(publicprofile);

      await businessNetworkConnection.disconnect("admin@medicalrecord");

      return "success";
    } catch (error) {
      console.log(error);
      
      return "fail"
    }
  },
  logout: async function(cardname) {
    try {
      await businessNetworkConnection.disconnect(cardname);
      return "success";
    } catch (error) {
      return "error";
    }
  },
  connect: async function(cardname, type_user) {
    businessNetworkConnection = new BusinessNetworkConnection();
    let full_cardname = cardname + "@" + businessNetworkName;

    try {
      await businessNetworkConnection.connect(
        full_cardname
      );
      participant = await businessNetworkConnection.getParticipantRegistry(
        namespace + "." + type_user
      );

      user = await participant.get(cardname);

      await businessNetworkConnection.disconnect(full_cardname);

      return {
        user: user,
        message: "success"
      };
    } catch (error) {
      console.log(error);
      
      return {
        message: "fail"
      };
    }
  },
  getBusiness() {
    return businessNetworkConnection;
  },
  getPersonalDetails: async function(cardname) {
    businessNetworkConnection = new BusinessNetworkConnection();
    let full_cardname = cardname + "@" + businessNetworkName;
    await businessNetworkConnection.connect(full_cardname);

    let asset = await businessNetworkConnection.getAssetRegistry(namespace + ".PersonalDetails");
    result = await asset.getAll();

    await businessNetworkConnection.disconnect(full_cardname);
    return result;
  },
  getMedicalRecordsOfPatient: async function(cardname) {
    businessNetworkConnection = new BusinessNetworkConnection();
    let full_cardname = cardname + "@" + businessNetworkName;
    await businessNetworkConnection.connect(full_cardname);

    let asset = await businessNetworkConnection.getAssetRegistry(namespace + ".MedicalRecord")
    result = await asset.getAll();

    await businessNetworkConnection.disconnect(full_cardname);

    return result;
  },
  getMedicalRecordDetailsOfPatient: async function(cardname, data) {
    businessNetworkConnection = new BusinessNetworkConnection();
    let full_cardname = cardname + "@" + businessNetworkName;
    await businessNetworkConnection.connect(full_cardname);

    let histories = [];

    transactionRegistry = await businessNetworkConnection.getTransactionRegistry(`${namespace}.UpdateMedicalRecord`);
    
    trans = await transactionRegistry.getAll();
    for (t of trans) {
      if (t.medicalRecord["$identifier"] == data.mr_id) {
        let time = new Date(t.timestamp);
        time = time.toString().substring(4,24);
        his = {
          type: "Update",
          timestamp: time,
          content: t.content
        };
        histories.push(his);
      }
    }

    transactionRegistry2 = await businessNetworkConnection.getTransactionRegistry(`${namespace}.CreateMedicalRecord`);
    trans2 = await transactionRegistry2.getAll();
    for (t of trans2) {
      if (
        t.patient["$identifier"] == data.pat_id &&
        t.practitioner["$identifier"] == data.prac_id &&
        t.medicalRecordId == data.mr_id
      ) {
        let time = new Date(t.timestamp);
        time = time.toString().substring(4,24);

        his = {
          type: "Create",
          timestamp: time,
          content: t.content
        };
        histories.push(his);
      }
    }

    await businessNetworkConnection.disconnect(full_cardname);

    return histories;
  },
  updatePersonalDetails: async function(cardname, data) {
    businessNetworkConnection = new BusinessNetworkConnection();
    let full_cardname = cardname + "@" + businessNetworkName;
    await businessNetworkConnection.connect(full_cardname);

    try {
      let serializer = businessNetworkConnection.getBusinessNetwork().getSerializer();

      personal_details = serializer.fromJSON(data);

      asset = await businessNetworkConnection.getAssetRegistry(namespace + ".PersonalDetails")
      await asset.update(personal_details);

      await businessNetworkConnection.disconnect(full_cardname);
      return "success"
    } catch (error) {
      console.log(error);
      return "error"
    }
  },
  getPractitionerPublicProfileForPatient: async function(cardname) {
    businessNetworkConnection = new BusinessNetworkConnection();
    let full_cardname = cardname + "@" + businessNetworkName;
    await businessNetworkConnection.connect(full_cardname);

    try {
      let asset = await businessNetworkConnection.getAssetRegistry(namespace + ".PractitionerPublicProfile");
      let practitioners = await asset.getAll();
      let participant = await businessNetworkConnection.getParticipantRegistry(namespace + ".Patient");
      let patients = await participant.getAll();
      let current_patient = patients[0];

      list_authorized_prac = [];
      list_unauthorized_prac = [];
      for (prac of practitioners) {
        tmp_prac = {
          id: prac.owner["$identifier"],
          firstname: prac.firstname,
          lastname: prac.lastname,
          dob: prac.Dob,
          email: prac.email,
          workplace: {
            name: prac.workplace.name,
            address: {
              street: prac.workplace.address.street,
              house: prac.workplace.address.house,
              city: prac.workplace.address.city
            }
          },
          qualifications: prac.qualifications
        };
        if (
          current_patient.authorized.indexOf(
            prac.owner["$identifier"]
          ) > -1
        ) {
          list_authorized_prac.push(tmp_prac);
        } else {
          list_unauthorized_prac.push(tmp_prac);
        }
      }

      await businessNetworkConnection.disconnect(full_cardname);

      return {
        list_authorized_prac: list_authorized_prac,
        list_unauthorized_prac: list_unauthorized_prac
      };
    } catch (error) {
      console.log(error);
      return "error"
    }
    
  },
  grantAccessPersonalDetails: async function(cardname, prac_id, ps_id) {
    businessNetworkConnection = new BusinessNetworkConnection();
    let full_cardname = cardname + "@" + businessNetworkName;
    await businessNetworkConnection.connect(full_cardname);
    let serializer = businessNetworkConnection.getBusinessNetwork().getSerializer();

    try {
      let resource = await serializer.fromJSON({
        $class: "org.example.medicalrecord.GrantAccessPersonalDetails",
        practitioner: `resource:org.example.medicalrecord.Practitioner#${prac_id}`,
        patientPersonalDetails: `resource:org.example.medicalrecord.PersonalDetails#${ps_id}`
      });
  
      await businessNetworkConnection.submitTransaction(resource);

      await businessNetworkConnection.disconnect(full_cardname);

      return "success"
    } catch (error) {
      console.log(error);
      return "error"
    }
  },
  revokeAccessPersonalDetails: async function(cardname, prac_id, ps_id) {
    businessNetworkConnection = new BusinessNetworkConnection();
    let full_cardname = cardname + "@" + businessNetworkName;
    await businessNetworkConnection.connect(full_cardname);
    let serializer = businessNetworkConnection.getBusinessNetwork().getSerializer();

    try {
      let resource = await serializer.fromJSON({
        $class: "org.example.medicalrecord.RevokeAccessPersonalDetails",
        practitioner: `resource:org.example.medicalrecord.Practitioner#${prac_id}`,
        patientPersonalDetails: `resource:org.example.medicalrecord.PersonalDetails#${ps_id}`
      });
  
      await businessNetworkConnection.submitTransaction(resource);

      await businessNetworkConnection.disconnect(full_cardname);

      return "success"
    } catch (error) {
      console.log(error);
      return "error"
    }
  },
  grantAccessMedicalRecord: async function(cardname, patient_id, prac_id) {
    businessNetworkConnection = new BusinessNetworkConnection();
    let full_cardname = cardname + "@" + businessNetworkName;
    await businessNetworkConnection.connect(full_cardname);
    let serializer = businessNetworkConnection.getBusinessNetwork().getSerializer();

    try {
      let resource = await serializer.fromJSON({
        $class: "org.example.medicalrecord.GrantAccessMedicalRecord",
        practitioner: `resource:org.example.medicalrecord.Practitioner#${prac_id}`,
        patient: `resource:org.example.medicalrecord.Patient#${patient_id}`
      });

      await businessNetworkConnection.submitTransaction(resource);

      await businessNetworkConnection.disconnect(full_cardname);

      return "success"
    } catch (error) {
      console.log(error);
      return "error"
    }
  },
  revokeAccessMedicalRecord: async function(cardname, patient_id, prac_id) {
    businessNetworkConnection = new BusinessNetworkConnection();
    let full_cardname = cardname + "@" + businessNetworkName;
    await businessNetworkConnection.connect(full_cardname);
    let serializer = businessNetworkConnection.getBusinessNetwork().getSerializer();

    try {
      let resource = await serializer.fromJSON({
        $class: "org.example.medicalrecord.RevokeAccessMedicalRecord",
        practitioner: `resource:org.example.medicalrecord.Practitioner#${prac_id}`,
        patient: `resource:org.example.medicalrecord.Patient#${patient_id}`
      });

      await businessNetworkConnection.submitTransaction(resource);

      await businessNetworkConnection.disconnect(full_cardname);

      return "success"
    } catch (error) {
      console.log(error);
      return "error"
    }
  },
  getPractitionerPublicProfile: async function(cardname, prac_id) {
    businessNetworkConnection = new BusinessNetworkConnection();
    let full_cardname = cardname + "@" + businessNetworkName;
    await businessNetworkConnection.connect(full_cardname);

    let asset = await businessNetworkConnection.getAssetRegistry(namespace + ".PractitionerPublicProfile")
    let profiles = await asset.getAll()
    for (p of profiles) {
      if (p.owner["$identifier"] == prac_id) {
        tmp_prac = {
          id: p.owner["$identifier"],
          firstname: p.firstname,
          lastname: p.lastname,
          dob: p.Dob,
          email: p.email,
          workplace: {
            name: p.workplace.name,
            address: {
              street: p.workplace.address.street,
              house: p.workplace.address.house,
              city: p.workplace.address.city
            }
          },
          qualifications: p.qualifications.join(", ")
        };

        await businessNetworkConnection.disconnect(full_cardname);
        return tmp_prac
      }
    }
  },
  getMedicalRecordOfPractitioner: async function(cardname) {
    businessNetworkConnection = new BusinessNetworkConnection();
    let full_cardname = cardname + "@" + businessNetworkName;
    await businessNetworkConnection.connect(full_cardname);

    let asset = await businessNetworkConnection.getAssetRegistry(namespace + ".MedicalRecord")
    let result = await asset.getAll();

    await businessNetworkConnection.disconnect(full_cardname);
    return result;
  },
  getMedicalRecordDetailsOfPractitioner: async function(cardname, data) {
    businessNetworkConnection = new BusinessNetworkConnection();
    let full_cardname = cardname + "@" + businessNetworkName;
    await businessNetworkConnection.connect(full_cardname);

    let histories = [];

    let transactionRegistry = await businessNetworkConnection.getTransactionRegistry(`${namespace}.UpdateMedicalRecord`)
    let trans = await transactionRegistry.getAll();
    for (t of trans) {
      if (t.medicalRecord["$identifier"] == data.mr_id) {
        let time = new Date(t.timestamp);
        time = time.toString().substring(4,24);
        his = {
          type: "Update",
          timestamp: time,
          content: t.content
        };
        histories.push(his);
      }
    }

    let transactionRegistry2 = await businessNetworkConnection.getTransactionRegistry(`${namespace}.CreateMedicalRecord`)
    let trans2 = await transactionRegistry2.getAll();
    for (t of trans2) {
      if (
        t.patient["$identifier"] == data.pat_id &&
        t.practitioner["$identifier"] == data.prac_id &&
        t.medicalRecordId == data.mr_id
      ) {
        let time = new Date(t.timestamp);
        time = time.toString().substring(4,24);
        his = {
          type: "Create",
          timestamp: time,
          content: t.content
        };
        histories.push(his);
      }
    }

    await businessNetworkConnection.disconnect(full_cardname);
    return histories;
  },
  getListPatientofPractitioner: async function(cardname) {
    businessNetworkConnection = new BusinessNetworkConnection();
    let full_cardname = cardname + "@" + businessNetworkName;
    await businessNetworkConnection.connect(full_cardname);

    let asset = await businessNetworkConnection.getAssetRegistry(namespace + ".PersonalDetails");
    let result = await asset.getAll();

    await businessNetworkConnection.disconnect(full_cardname);
    return result;
  },
  createMedicalRecord: async function(cardname, patient_id, prac_id, content) {
    businessNetworkConnection = new BusinessNetworkConnection();
    let full_cardname = cardname + "@" + businessNetworkName;
    await businessNetworkConnection.connect(full_cardname);
    let serializer = businessNetworkConnection.getBusinessNetwork().getSerializer();

    try {
      let id = Math.floor(Math.random() * 10000).toString();
      let resource = await serializer.fromJSON({
        $class: "org.example.medicalrecord.CreateMedicalRecord",
        practitioner: `resource:org.example.medicalrecord.Practitioner#${prac_id}`,
        patient: `resource:org.example.medicalrecord.Patient#${patient_id}`,
        content: content,
        medicalRecordId: id
      });

      await businessNetworkConnection.submitTransaction(resource);

      await businessNetworkConnection.disconnect(full_cardname);
      return "success"
    } catch (error) {
      console.log(error);
      return "error"
    }
  },
  updateMedicalRecord: async function(cardname, medicalrecord_id, prac_id, content) {
    businessNetworkConnection = new BusinessNetworkConnection();
    let full_cardname = cardname + "@" + businessNetworkName;
    await businessNetworkConnection.connect(full_cardname);
    let serializer = businessNetworkConnection.getBusinessNetwork().getSerializer();

    try {
      let resource = await serializer.fromJSON({
        $class: "org.example.medicalrecord.UpdateMedicalRecord",
        practitioner: `resource:org.example.medicalrecord.Practitioner#${prac_id}`,
        medicalRecord: `resource:org.example.medicalrecord.MedicalRecord#${medicalrecord_id}`,
        content: content
      });

      await businessNetworkConnection.submitTransaction(resource);
      await businessNetworkConnection.disconnect(full_cardname);
      return "success"
    } catch (error) {
      console.log(error);
      return "error"
    }
  }
};
