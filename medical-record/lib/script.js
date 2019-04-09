/**
 *
 * @param {org.example.emr.UpdateMedicalRecord} update - update medical record
 * @transaction
*/

function updateMedicalRecord (update) {
  var medical_record = update.patient.medicalRecord
  if (medical_record.permissions.indexOf(update.practitioner.getIdentifier()) > -1) {
    medical_record.description = update.content
    medical_record.version += 1
    return getAssetRegistry('org.example.emr.MedicalRecord').then(function (assetRegistry) {
      assetRegistry.update(medical_record)
    })
  }
}

/**
 *
 * @param {org.example.emr.GrantAccess} grant - grant access
 * @transaction
*/

function grantAccess (grant) {
  console.log("Grant")
  prac_id = grant.practitioner.getIdentifier();
  authorized = grant.patient.authorized;
  medical_record = grant.patient.medicalRecord;
  if (authorized.indexOf(prac_id) <= -1) {
	authorized.push(prac_id);
    if(medical_record) {
      if (medical_record.permissions.indexOf(prac_id) <= -1) {
          medical_record.permissions.push(prac_id)
          getAssetRegistry("org.example.emr.MedicalRecord").then(function(m) {
              m.update(medical_record)
          })
      }
    }
    getParticipantRegistry("org.example.emr.Patient").then(function(p) {
    	p.update(grant.patient)
    })
  }
}

/**
 *
 * @param {org.example.emr.RevokeAccess} revoke - revoke access
 * @transaction
*/

function revokeAccess (revoke) {
  console.log("revoke")
  prac_id = revoke.practitioner.getIdentifier();
  authorized = revoke.patient.authorized;
  if( authorized.indexOf(prac_id) > -1) {
  	authorized.splice(authorized.indexOf(prac_id), 1);
    if (medical_record.permissions.indexOf(prac_id) > -1) {
    	medical_record.permissions.splice(medical_record.permissions.indexOf(prac_id), 1)
      	getAssetRegistry("org.example.emr.MedicalRecord").then(function(m) {
        	m.update(medical_record)
        })
    }
    getParticipantRegistry("org.example.emr.Patient").then(function(p) {
    	p.update(revoke.patient)
    })
  }
}

