// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract FagaruMVP is AccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant DOCTOR_ROLE = keccak256("DOCTOR_ROLE");
    bytes32 public constant PATIENT_ROLE = keccak256("PATIENT_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    struct MedicalRecord {
        uint256 id;
        address patient;
        string dataHash;
        uint256 timestamp;
    }

    Counters.Counter private _recordIds;
    mapping(uint256 => MedicalRecord) private _medicalRecords;
    mapping(address => uint256[]) private _patientRecords;
    mapping(address => mapping(address => bool)) private _patientDoctorAccess;

    event MedicalRecordCreated(uint256 indexed recordId, address indexed patient);
    event MedicalRecordUpdated(uint256 indexed recordId);
    event AccessGranted(address indexed patient, address indexed doctor);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function initialize(address initialAdmin) public onlyRole(DEFAULT_ADMIN_ROLE) {
    require(!hasRole(ADMIN_ROLE, initialAdmin), "Admin already set");
    _grantRole(ADMIN_ROLE, initialAdmin);
    }


    function createUser(address user, bytes32 role) public onlyRole(ADMIN_ROLE) {
        grantRole(role, user);
    }

    function grantAccess(address doctor) public onlyRole(PATIENT_ROLE) {
        require(!_patientDoctorAccess[msg.sender][doctor], "Access already granted");
        _patientDoctorAccess[msg.sender][doctor] = true;
        emit AccessGranted(msg.sender, doctor);
    }

    function createMedicalRecord(address patient, string memory dataHash) 
        public 
        onlyRole(DOCTOR_ROLE) 
        returns (uint256)
    {
        require(_patientDoctorAccess[patient][msg.sender], "No access to this patient");
        _recordIds.increment();
        uint256 newRecordId = _recordIds.current();
        
        
        MedicalRecord memory newRecord = MedicalRecord({
            id: newRecordId,
            patient: patient,
            dataHash: dataHash,
            timestamp: block.timestamp
        });
        
        _medicalRecords[newRecordId] = newRecord;
        _patientRecords[patient].push(newRecordId);
        
        emit MedicalRecordCreated(newRecordId, patient);
        return newRecordId;
    }

    function updateMedicalRecord(uint256 recordId, string memory newDataHash) 
        public 
        onlyRole(DOCTOR_ROLE) 
    {
        require(_patientDoctorAccess[_medicalRecords[recordId].patient][msg.sender], "No access to this patient");
        
        _medicalRecords[recordId].dataHash = newDataHash;
        _medicalRecords[recordId].timestamp = block.timestamp;
        
        emit MedicalRecordUpdated(recordId);
    }

    function getMedicalRecord(uint256 recordId) 
        public 
        view 
        returns (MedicalRecord memory) 
    {
        require(
            hasRole(ADMIN_ROLE, msg.sender) || 
            _medicalRecords[recordId].patient == msg.sender ||
            _patientDoctorAccess[_medicalRecords[recordId].patient][msg.sender], 
            "Not authorized to view this record"
        );
        
        return _medicalRecords[recordId];
    }

    function getPatientRecords(address patient) 
        public 
        view 
        returns (uint256[] memory) 
    {
        require(
            hasRole(ADMIN_ROLE, msg.sender) || 
            patient == msg.sender ||
            _patientDoctorAccess[patient][msg.sender], 
            "Not authorized to view these records"
        );
        
        return _patientRecords[patient];
    }
}