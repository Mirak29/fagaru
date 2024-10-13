// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract FagaruMVP is AccessControl, ReentrancyGuard, Initializable {
    using Counters for Counters.Counter;

    bytes32 public constant DOCTOR_ROLE = keccak256("DOCTOR_ROLE");
    bytes32 public constant PATIENT_ROLE = keccak256("PATIENT_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant HEALTH_AUTHORITY_ROLE = keccak256("HEALTH_AUTHORITY_ROLE");

    struct MedicalRecord {
        uint256 id;
        address patient;
        string dataHash;
        uint256 timestamp;
        bool isDeleted;
    }

    struct AccessLog {
        address accessor;
        uint256 timestamp;
        string action;
    }

    struct AccessRequest {
        address requester;
        uint256 timestamp;
        bool approved;
    }

    Counters.Counter private _recordIds;
    mapping(uint256 => MedicalRecord) private _medicalRecords;
    mapping(address => uint256[]) private _patientRecords;
    mapping(uint256 => address[]) private _recordAccessList;
    mapping(uint256 => AccessLog[]) private _recordAccessLogs;
    mapping(uint256 => AccessRequest[]) private _accessRequests;

    event MedicalRecordCreated(uint256 indexed recordId, address indexed patient, string dataHash);
    event MedicalRecordUpdated(uint256 indexed recordId, string newDataHash);
    event MedicalRecordDeleted(uint256 indexed recordId);
    event AccessGranted(uint256 indexed recordId, address indexed grantedTo);
    event AccessRevoked(uint256 indexed recordId, address indexed revokedFrom);
    event AccessRequested(uint256 indexed recordId, address indexed requester);
    event AccessRequestApproved(uint256 indexed recordId, address indexed approvedUser);
    event AccessRequestRejected(uint256 indexed recordId, address indexed rejectedUser);

    function initialize(address initialAdmin) public initializer {
        _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin);
        _grantRole(ADMIN_ROLE, initialAdmin);
    }

    function createMedicalRecord(string memory _dataHash) public onlyRole(PATIENT_ROLE) {
        _recordIds.increment();
        uint256 newRecordId = _recordIds.current();
        
        _medicalRecords[newRecordId] = MedicalRecord({
            id: newRecordId,
            patient: msg.sender,
            dataHash: _dataHash,
            timestamp: block.timestamp,
            isDeleted: false
        });

        _patientRecords[msg.sender].push(newRecordId);

        emit MedicalRecordCreated(newRecordId, msg.sender, _dataHash);
    }

    function updateMedicalRecord(uint256 _recordId, string memory _newDataHash) public {
        require(_medicalRecords[_recordId].patient == msg.sender, "Not your record");
        require(!_medicalRecords[_recordId].isDeleted, "Record has been deleted");

        _medicalRecords[_recordId].dataHash = _newDataHash;
        _medicalRecords[_recordId].timestamp = block.timestamp;

        emit MedicalRecordUpdated(_recordId, _newDataHash);
    }

    function deleteMedicalRecord(uint256 _recordId) public {
        require(_medicalRecords[_recordId].patient == msg.sender, "Not your record");
        require(!_medicalRecords[_recordId].isDeleted, "Record already deleted");

        _medicalRecords[_recordId].isDeleted = true;

        emit MedicalRecordDeleted(_recordId);
    }

    function grantAccess(uint256 _recordId, address _grantee) public {
        require(hasRole(PATIENT_ROLE, msg.sender), "Only patients can grant access");
        require(_medicalRecords[_recordId].patient == msg.sender, "Not your record");
        require(!isAuthorized(_grantee, _recordId), "Already has access");

        _recordAccessList[_recordId].push(_grantee);
        emit AccessGranted(_recordId, _grantee);
    }

    function revokeAccess(uint256 _recordId, address _revokee) public {
        require(hasRole(PATIENT_ROLE, msg.sender), "Only patients can revoke access");
        require(_medicalRecords[_recordId].patient == msg.sender, "Not your record");

        address[] storage accessList = _recordAccessList[_recordId];
        for (uint i = 0; i < accessList.length; i++) {
            if (accessList[i] == _revokee) {
                accessList[i] = accessList[accessList.length - 1];
                accessList.pop();
                emit AccessRevoked(_recordId, _revokee);
                return;
            }
        }

        revert("User does not have access");
    }

    function requestAccess(uint256 _recordId) public onlyRole(DOCTOR_ROLE) {
        require(!isAuthorized(msg.sender, _recordId), "Already has access");

        _accessRequests[_recordId].push(AccessRequest({
            requester: msg.sender,
            timestamp: block.timestamp,
            approved: false
        }));

        emit AccessRequested(_recordId, msg.sender);
    }

    function approveAccessRequest(uint256 _recordId, address _requester) public {
        require(_medicalRecords[_recordId].patient == msg.sender, "Not your record");

        AccessRequest[] storage requests = _accessRequests[_recordId];
        for (uint i = 0; i < requests.length; i++) {
            if (requests[i].requester == _requester && !requests[i].approved) {
                requests[i].approved = true;
                grantAccess(_recordId, _requester);
                emit AccessRequestApproved(_recordId, _requester);
                return;
            }
        }

        revert("No pending request found");
    }

    function rejectAccessRequest(uint256 _recordId, address _requester) public {
        require(_medicalRecords[_recordId].patient == msg.sender, "Not your record");

        AccessRequest[] storage requests = _accessRequests[_recordId];
        for (uint i = 0; i < requests.length; i++) {
            if (requests[i].requester == _requester && !requests[i].approved) {
                requests[i] = requests[requests.length - 1];
                requests.pop();
                emit AccessRequestRejected(_recordId, _requester);
                return;
            }
        }

        revert("No pending request found");
    }

    function getAccessHistory(uint256 _recordId) public view returns (AccessLog[] memory) {
        require(_medicalRecords[_recordId].patient == msg.sender || hasRole(ADMIN_ROLE, msg.sender), "Not authorized");
        return _recordAccessLogs[_recordId];
    }

    function getMedicalRecord(uint256 _recordId) public view returns (MedicalRecord memory) {
        require(_recordId > 0 && _recordId <= _recordIds.current(), "Invalid record ID");
        require(!_medicalRecords[_recordId].isDeleted, "Record has been deleted");
        require(
            hasRole(DOCTOR_ROLE, msg.sender) || 
            hasRole(ADMIN_ROLE, msg.sender) || 
            _medicalRecords[_recordId].patient == msg.sender || 
            isAuthorized(msg.sender, _recordId), 
            "Not authorized to view this record"
        );

        // Log access
        AccessLog memory log = AccessLog(msg.sender, block.timestamp, "view");
        _recordAccessLogs[_recordId].push(log);

        return _medicalRecords[_recordId];
    }

    function isAuthorized(address _user, uint256 _recordId) public view returns (bool) {
        address[] memory authorizedUsers = _recordAccessList[_recordId];
        for (uint i = 0; i < authorizedUsers.length; i++) {
            if (authorizedUsers[i] == _user) {
                return true;
            }
        }
        return false;
    }

    function getAggregatedData() public view onlyRole(HEALTH_AUTHORITY_ROLE) returns (uint256 totalRecords, uint256 activeRecords) {
        totalRecords = _recordIds.current();
        for (uint256 i = 1; i <= totalRecords; i++) {
            if (!_medicalRecords[i].isDeleted) {
                activeRecords++;
            }
        }
    }

    function assignRole(address _user, bytes32 _role) public onlyRole(ADMIN_ROLE) {
        grantRole(_role, _user);
    }

    function revokeRole(address _user, bytes32 _role) public onlyRole(ADMIN_ROLE) {
        revokeRole(_role, _user);
    }
}