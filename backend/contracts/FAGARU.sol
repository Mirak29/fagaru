// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title FAGARU
 * @dev Contrat pour la gestion des dossiers médicaux des patients
 */
contract FAGARU {
    struct Record {
        string cid;
        string fileName;
        address patientId;
        address doctorId;
        uint256 timeAdded;
    }

    struct Patient {
        address id;
        Record[] records;
    }

    struct Doctor {
        address id;
    }

    mapping(address => Patient) private patients;
    mapping(address => Doctor) private doctors;

    event PatientAdded(address indexed patientId);
    event DoctorAdded(address indexed doctorId);
    event RecordAdded(string indexed cid, address indexed patientId, address indexed doctorId);

    modifier senderExists() {
        require(
            doctors[msg.sender].id == msg.sender || patients[msg.sender].id == msg.sender,
            "Sender does not exist"
        );
        _;
    }

    modifier patientExists(address patientId) {
        require(patients[patientId].id == patientId, "Patient does not exist");
        _;
    }

    modifier senderIsDoctor() {
        require(doctors[msg.sender].id == msg.sender, "Sender is not a doctor");
        _;
    }

    /**
     * @dev Ajoute un nouveau patient
     * @param _patientId L'adresse du patient à ajouter
     */
    function addPatient(address _patientId) external senderIsDoctor {
        require(patients[_patientId].id != _patientId, "This patient already exists");
        patients[_patientId].id = _patientId;
        emit PatientAdded(_patientId);
    }

    /**
     * @dev Ajoute un nouveau docteur
     */
    function addDoctor() external {
        require(doctors[msg.sender].id != msg.sender, "This doctor already exists");
        doctors[msg.sender].id = msg.sender;
        emit DoctorAdded(msg.sender);
    }

    /**
     * @dev Ajoute un nouveau dossier médical pour un patient
     * @param _cid L'identifiant du contenu du dossier
     * @param _fileName Le nom du fichier du dossier
     * @param _patientId L'adresse du patient concerné
     */
    function addRecord(string memory _cid, string memory _fileName, address _patientId) 
        external 
        senderIsDoctor
        patientExists(_patientId)
    {
        Record memory record = Record({
            cid: _cid,
            fileName: _fileName,
            patientId: _patientId,
            doctorId: msg.sender,
            timeAdded: block.timestamp
        });
        patients[_patientId].records.push(record);
        emit RecordAdded(_cid, _patientId, msg.sender);
    }

    /**
     * @dev Récupère les dossiers médicaux d'un patient
     * @param _patientId L'adresse du patient
     * @return Un tableau des dossiers médicaux du patient
     */
    function getRecords(address _patientId) 
        external 
        view 
        senderExists
        patientExists(_patientId) 
        returns (Record[] memory)
    {
        return patients[_patientId].records;
    }

    /**
     * @dev Récupère le rôle de l'expéditeur
     * @return Le rôle de l'expéditeur ("doctor", "patient", ou "unknown")
     */
    function getSenderRole() external view returns (string memory) {
        if (doctors[msg.sender].id == msg.sender) {
            return "doctor";
        } else if (patients[msg.sender].id == msg.sender) {
            return "patient";
        } else {
            return "unknown";
        }
    }

    /**
     * @dev Vérifie si un patient existe
     * @param _patientId L'adresse du patient à vérifier
     * @return Booléen indiquant si le patient existe
     */
    function getPatientExists(address _patientId) external view senderIsDoctor returns (bool) {
        return patients[_patientId].id == _patientId;
    }
}