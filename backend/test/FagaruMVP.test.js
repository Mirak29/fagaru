const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FagaruMVP", function () {
    let fagaruMVP;
    let owner, doctor, patient, admin;

    const DOCTOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("DOCTOR_ROLE"));
    const PATIENT_ROLE = ethers.keccak256(ethers.toUtf8Bytes("PATIENT_ROLE"));
    const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));

    beforeEach(async function () {
        [owner, doctor, patient, admin] = await ethers.getSigners();

        const FagaruMVP = await ethers.getContractFactory("FagaruMVP");
        fagaruMVP = await FagaruMVP.deploy();
        await fagaruMVP.waitForDeployment();

        await fagaruMVP.createUser("0x390F102EbEfBD00885E7D073C4C20f275DfE9D9e", DOCTOR_ROLE);
        await fagaruMVP.createUser("0x10c72decaAbC3E9a7B27FA29086e86D1F638ad73", PATIENT_ROLE);
        await fagaruMVP.createUser("0x523B5606924120e89c6cBC872E395B7f15773942", ADMIN_ROLE);
    });

    it("Should assign roles correctly", async function () {
        expect(await fagaruMVP.hasRole(DOCTOR_ROLE, doctor.address)).to.be.true;
        expect(await fagaruMVP.hasRole(PATIENT_ROLE, patient.address)).to.be.true;
        expect(await fagaruMVP.hasRole(ADMIN_ROLE, admin.address)).to.be.true;
    });

    it("Should allow a patient to grant access to a doctor", async function () {
        await expect(fagaruMVP.connect(patient).grantAccess(doctor.address))
            .to.emit(fagaruMVP, "AccessGranted")
            .withArgs(patient.address, doctor.address);
    });

    // it("Should allow a doctor to create a medical record", async function () {
    //     await fagaruMVP.connect(patient).grantAccess(doctor.address);
    //     await expect(fagaruMVP.connect(doctor).createMedicalRecord(patient.address, "ipfs_hash_here"))
    //         .to.emit(fagaruMVP, "MedicalRecordCreated");
    // });

    it("Should allow a doctor to create a medical record", async function () {
        await fagaruMVP.connect(patient).grantAccess(doctor.address);
    
        const tx = await fagaruMVP.connect(doctor).createMedicalRecord(patient.address, "ipfs_hash_here");
        const receipt = await tx.wait(); // Attendez que la transaction soit minée
    
        // Affichez les événements dans le reçu pour le débogage
        // console.log("Événements dans le reçu :", receipt.logs);
    
        // Vérifiez que l'événement MedicalRecordCreated a été émis
        console.log("Événements dans le reçu :", tx);
        const createEvent = receipt.events?.find(e => e.event === "MedicalRecordCreated");
        expect(createEvent, "L'événement MedicalRecordCreated est introuvable").to.not.be.undefined;
    
        // Récupération et affichage du recordId
        const recordId = createEvent.args.recordId;
        console.log("Record ID créé :", recordId.toString());
    });
    
    it("Should allow a doctor to update a medical record", async function () {
        // Le patient accorde l'accès au médecin
        await fagaruMVP.connect(patient).grantAccess(doctor.address);

        // Le médecin crée un dossier médical
        const tx = await fagaruMVP
            .connect(doctor)
            .createMedicalRecord(patient.address, "ipfs_hash_1");

        // Attente de la transaction et récupération des événements
        const receipt = await tx.wait();
        // console.log("Événements reçus :", receipt.events); // Debugging: Log events

        // Récupération de l'événement 'MedicalRecordCreated'
        const createEvent = receipt.events.find(
            (e) => e.event === "MedicalRecordCreated"
        );

        // Vérification que l'événement a été émis correctement
        expect(createEvent, "L'événement MedicalRecordCreated est introuvable").to.not.be.undefined;

        const recordId = createEvent.args.recordId;

        // Mise à jour du dossier médical par le médecin
        await expect(
            fagaruMVP.connect(doctor).updateMedicalRecord(recordId, "ipfs_hash_2")
        )
            .to.emit(fagaruMVP, "MedicalRecordUpdated")
            .withArgs(recordId);
    });

    it("Should allow authorized users to view a medical record", async function () {
        await fagaruMVP.connect(patient).grantAccess(doctor.address);
        const tx = await fagaruMVP.connect(doctor).createMedicalRecord(patient.address, "ipfs_hash");
        const receipt = await tx.wait();
        
        const createEvent = receipt.events.find(e => e.event === "MedicalRecordCreated");
        expect(createEvent).to.not.be.undefined;
        const recordId = createEvent.args.recordId;

        const recordByDoctor = await fagaruMVP.connect(doctor).getMedicalRecord(recordId);
        expect(recordByDoctor.dataHash).to.equal("ipfs_hash");

        const recordByPatient = await fagaruMVP.connect(patient).getMedicalRecord(recordId);
        expect(recordByPatient.dataHash).to.equal("ipfs_hash");

        const recordByAdmin = await fagaruMVP.connect(admin).getMedicalRecord(recordId);
        expect(recordByAdmin.dataHash).to.equal("ipfs_hash");
    });

    it("Should not allow unauthorized users to view a medical record", async function () {
        await fagaruMVP.connect(patient).grantAccess(doctor.address);
        const tx = await fagaruMVP.connect(doctor).createMedicalRecord(patient.address, "ipfs_hash");
        const receipt = await tx.wait();
        
        const createEvent = receipt.events.find(e => e.event === "MedicalRecordCreated");
        expect(createEvent).to.not.be.undefined;
        const recordId = createEvent.args.recordId;

        const unauthorizedDoctor = await ethers.getSigner();
        await expect(fagaruMVP.connect(unauthorizedDoctor).getMedicalRecord(recordId))
            .to.be.revertedWith("Not authorized to view this record");
    });
});