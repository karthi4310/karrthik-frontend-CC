import axios from "axios";
import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import logo3 from "../assets/rightlogo.png";
import logo4 from "../assets/middle.png";

import "../styles/Viewemployee.css";
import fallbackUserImg from "../assets/person.png";

const ViewEmployee = () => {
  // Debug: Log key variables on every render
  const { employeeId } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  console.log("[ViewEmployee] Render:", { employeeId, employee, loading, error });

  const methods = useForm();
  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = methods;

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setPhotoPreview(previewURL);
      setValue("photo", [file]); // Set as array to match react-hook-form
    }
  };

  const sidebarSteps = [
    "Employee Details",
    "Contact Details",
    "Other Details",
    "Address",
    "Professional Details",
    "Bank Details",
    "Documents",
    "Portal Access"
  ];

  const countries = [
    { id: 1, name: "India" },
    { id: 2, name: "USA" },
  ];

  const states = [
    { id: 1, name: "Telangana" },
    { id: 2, name: "Andhra Pradesh" },
  ];

  const districts = [
    { id: 1, name: "Hyderabad" },
    { id: 2, name: "Rangareddy" },
  ];

  const blocks = [
    { id: 1, name: "Madhapur" },
    { id: 2, name: "Gachibowli" },
  ];

  const villages = [
    { id: 1, name: "Village A" },
    { id: 2, name: "Village B" },
  ];

  const navigate = useNavigate();

useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("You are not logged in.");
    return;
  }

  // Check if employeeId is valid
  if (!employeeId || employeeId === "undefined") {
    console.error("Invalid employee ID:", employeeId);
    setError("Invalid employee ID. Please go back and try again.");
    setLoading(false);
    return;
  }

  setLoading(true);
  console.log("Fetching employee with ID:", employeeId);
  
  fetch(`http://localhost:8080/api/employees/${employeeId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      console.log("API employee data:", data); // Debug log
      console.log("[ViewEmployee] Fetched employee data:", data);
      console.log("Photo fields:", {
        photoFileName: data.photoFileName,
        photoUrl: data.photoUrl,
        photo: data.photo
      });
      
      if (!data || !data.id) {
        setError("Employee data not found or invalid response from server.");
        setLoading(false);
        return;
      }
      
      setEmployee(data);
      setLoading(false);
      
      // Map the data to form fields properly - using the same pattern as farmer
      const formData = {
        // Employee Details
        salutation: data.salutation || "",
        firstName: data.firstName || "",
        middleName: data.middleName || "",
        lastName: data.lastName || "",
        gender: data.gender || "",
        nationality: data.nationality || "",
        dob: data.dob ? data.dob.split('T')[0] : "", // Format date for input
        
        // Contact Details
        contactNumber: data.contactNumber || "",
        email: data.email || "",
        
        // Other Details
        relationType: data.relationType || "",
        relationName: data.relationName || "",
        altNumber: data.altNumber || "",
        altNumberType: data.altNumberType || "",
        
        // Address
        country: data.country || "",
        state: data.state || "",
        district: data.district || "",
        block: data.block || "",
        village: data.village || "",
        zipcode: data.zipcode || "",
        sector: data.sector || "",
        
        // Professional Details
        education: data.education || "",
        experience: data.experience || "",
        
        // Bank Details
        bankName: data.bankName || "",
        accountNumber: data.accountNumber || "",
        branchName: data.branchName || "",
        ifscCode: data.ifscCode || "",
        
        // Documents
        documentType: data.documentType || "",
        documentNumber: data.documentNumber || "",
        
        // Portal Access
        role: data.role || "",
        accessStatus: data.accessStatus || ""
      };
      
      // Reset form with all data at once
      reset(formData);
      
      // Set photo previews if photo exists - check multiple possible field names
      if (data.photoFileName || data.photoUrl || data.photo) {
        const photoUrl = data.photoFileName 
          ? `http://localhost:8080/uploads/${data.photoFileName}`
          : data.photoUrl 
            ? `http://localhost:8081${data.photoUrl}`
            : data.photo;
        setPhotoPreview(photoUrl);
        console.log("Photo URL set:", photoUrl);
      } else {
        setPhotoPreview(null);
        console.log("No photo URL found in data");
      }
      
      console.log("Employee data set successfully:", data);
    })
    .catch((err) => {
      console.error("❌ Failed to fetch employee:", err);
      
      if (err.response) {
        const status = err.response.status;
        
        switch (status) {
          case 401:
            setError("❌ Authentication failed. Please log in again.");
            break;
          case 403:
            setError("❌ Access denied. Please login again.");
            break;
          case 404:
            setError("❌ Employee not found. Please check the ID.");
            break;
          case 500:
            setError("❌ Server error. Please try again later.");
            break;
          default:
            setError(`❌ Error ${status}: Failed to load employee data.`);
        }
      } else if (err.request) {
        setError("❌ Network error. Please check your internet connection.");
      } else {
        setError("❌ Error loading employee data. Please try again.");
      }
      setLoading(false);
    });
}, [employeeId, reset]);

 
 
  return (
    <div className="employee-view-container">
      {/* Loading State */}
      {loading && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '18px',
          color: '#666'
        }}>
          Loading employee data...
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '18px',
          color: '#d32f2f',
          background: '#fffbe6',
          border: '1px solid #ffe082',
          borderRadius: '8px',
          margin: '40px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
        }}>
          <div style={{ marginBottom: '20px', fontWeight: 'bold' }}>❌ {error}</div>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              padding: '10px 20px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginBottom: '10px'
            }}
          >
            Retry
          </button>
          <button 
            onClick={() => window.history.back()} 
            style={{
              padding: '10px 20px',
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Go Back
          </button>
        </div>
      )}

      {/* Main Content - Only show if not loading and no error */}
      {!loading && !error && (
        <>
          <div className="employee-view-header">
            <img src={logo3} alt="DATE Logo" className="emploee-view-logo-img" />
            <div className="employee-header-user">
              <div className="employee-header-avatar">
                {photoPreview ? (
                  <img
                    src={imgError || !employee?.photoFileName ? fallbackUserImg : photoPreview}
                    alt="User Icon"
                    className="user-icon"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <span className="user-icon">User</span>
                )}
              </div>
              <span className="employee-header-username">{(watch("firstName") ?? "User") || "User"}</span>
            </div>
          </div>
       
          {/* Center Card with Photo + ID + Name over background image */}
          <div className="header-background">
            <img src={logo4} alt="Field" className="employee-bg-img" />
            <div className="photo-id-card">
              <div className="edit-photo-box">
                {photoPreview ? (
                  <img
                    src={imgError || !employee?.photoFileName ? fallbackUserImg : photoPreview}
                    alt="Employee Photo"
                    className="photo-preview"
                    style={{ width: "110px", height: "110px", objectFit: "cover", borderRadius: "50%" }}
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <span className="farmer-photo-placeholder"> Employee photo </span>
                )}
                {/* Show file name if present */}
                <div style={{ marginTop: "6px", fontSize: "0.95em", color: "#444", textAlign: "center" }}>
                  {employee?.photoFileName ? `Current: ${employee.photoFileName}` : null}
                </div>
              </div>
              <div className="farmer-id-name">
                <div className="farmer-id">ID: <strong>{employee?.id || employeeId || "--"}</strong></div>
                <div className="one">{(employee?.firstName || "") + (employee?.lastName ? " " + employee.lastName : "")}</div>
              </div>
            </div>
          </div>

          <div className="e-body-content">
            <div className="e-sidebar">
              {sidebarSteps.map((label, idx) => (
                <div
                  key={idx}
                  className={`e-sidebar-item ${currentStep === idx ? "active" : ""}`}
                  onClick={() => {
                    setCurrentStep(idx);
                    setIsEditMode(false);
                  }}
                >
                  {label}
                </div>
              ))}
              <div className="top-bar">
                <button
                  className="go-dashboard-button"
                  onClick={() => navigate("/dashboard")}
                  style={{ marginTop: "32px", width: "90%" }}
                >
                  ⬅ Go to Dashboard
                </button>
              </div>
            </div>
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit((data) => console.log("Submitted", data))} className="view-employee-form">
                <div className="employee-step-container">
     {currentStep === 0 && (
  <>
    <h2>Employee Details</h2>
    {!isEditMode ? (
      <>
        <button type="button" onClick={() => setIsEditMode(true)} className="employee-view-button">Edit</button>
        <div className="details-card">
          <div className="photo-row">
            <span className="photo-label">Photo:</span>
            <div className="photo-box">
              {photoPreview ? (
                <>
                  <img
                    src={imgError || !employee?.photoFileName ? fallbackUserImg : photoPreview}
                    alt="Employee"
                    onError={() => setImgError(true)}
                  />
                  <span className="photo-filename">
                    {employee?.photoFileName ? employee.photoFileName : null}
                  </span>
                </>
              ) : (
                <span>No photo uploaded</span>
              )}
            </div>
          </div>
          <div><strong>Salutation:</strong> <span>{watch("salutation") || "-"}</span></div>
          <div><strong>First Name:</strong> <span>{watch("firstName") || "-"}</span></div>
          <div><strong>Middle Name:</strong> <span>{watch("middleName") || "-"}</span></div>
          <div><strong>Last Name:</strong> <span>{watch("lastName") || "-"}</span></div>
          <div><strong>Gender:</strong> <span>{watch("gender") || "-"}</span></div>
          <div><strong>DOB:</strong> <span>{watch("dob") ? new Date(watch("dob")).toLocaleDateString("en-IN") : "-"}</span></div>
          <div><strong>Nationality:</strong> <span>{watch("nationality") || "-"}</span></div>
        </div>
      </>
    ) : (
      <>
        <div className="edit-main form-grid">
          {/* Photo Upload */}
          <div className="viewform-row">
            <label>Photo <span className="optional">(Optional)</span></label>
            <input
              type="file"
              accept="image/*"
              onChange={e => {
                const file = e.target.files[0];
                if (file) {
                  setPhotoPreview(URL.createObjectURL(file));
                  setValue("photo", [file]);
                }
              }}
            />
            {photoPreview && (
              <img
                src={imgError ? fallbackUserImg : photoPreview}
                alt="Preview"
                className="photo-preview"
                style={{ height: "100px", borderRadius: "8px", marginTop: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}
                onError={() => setImgError(true)}
              />
            )}
          </div>
          {/* Salutation */}
          <div className="viewform-row">
            <label>Salutation <span className="required">*</span></label>
            <select {...register("salutation")} className="input">
              <option value="">Select</option>
              <option value="Mr">Mr</option>
              <option value="Mrs.">Mrs.</option>
              <option value="Ms.">Ms.</option>
              <option value="Miss.">Miss.</option>
              <option value="Dr.">Dr.</option>
            </select>
            {errors.salutation && <p className="error">{errors.salutation.message}</p>}
          </div>
          {/* First Name */}
          <div className="viewform-row">
            <label>First Name <span className="required">*</span></label>
            <input {...register("firstName")} className="input" />
            {errors.firstName && <p className="error">{errors.firstName.message}</p>}
          </div>
          {/* Middle Name */}
          <div className="viewform-row">
            <label>Middle Name <span className="required">*</span></label>
            <input {...register("middleName")} className="input" />
            {errors.middleName && <p className="error">{errors.middleName.message}</p>}
          </div>
          {/* Last Name */}
          <div className="viewform-row">
            <label>Last Name <span className="required">*</span></label>
            <input {...register("lastName")} className="input" />
            {errors.lastName && <p className="error">{errors.lastName.message}</p>}
          </div>
          {/* Gender */}
          <div className="viewform-row">
            <label>Gender <span className="required">*</span></label>
            <select {...register("gender")} className="input">
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Transgender">Transgender</option>
            </select>
            {errors.gender && <p className="error">{errors.gender.message}</p>}
          </div>
          {/* DOB */}
          <div className="viewform-row">
            <label>DOB <span className="required">*</span></label>
            <input type="date" {...register("dob")} className="input" />
            {errors.dob && <p className="error">{errors.dob.message}</p>}
          </div>
          {/* Nationality */}
          <div className="viewform-row">
            <label>Nationality <span className="required">*</span></label>
            <select {...register("nationality")} className="input">
              <option value="">Select</option>
              <option value="Indian">Indian</option>
            </select>
            {errors.nationality && <p className="error">{errors.nationality.message}</p>}
          </div>
          <div className="action-buttons">
            <button type="button" className="employee-view-button" onClick={() => setIsEditMode(false)}>
              Save
            </button>
          </div>
        </div>
      </>
    )}
  </>
)}


              {/* Step 1: Contact Details */}
{currentStep === 1 && (
  <>
    <h2>Contact Details</h2>
 
    {!isEditMode ? (
      <>
        <button
          type="button"
          onClick={() => setIsEditMode(true)}
          className="employee-view-button"
        >
          Edit
        </button>
 
        <div className="viewinfo-row">
          <div><strong>Contact Number:</strong> {watch("contactNumber") || "-"}</div>
          <div><strong>Email:</strong> {watch("email") || "-"}</div>
        </div>
      </>
    ) : (
      <>
        <div className="edit-main form-grid">
          <div className="employeeform-leftgrid">
            {/* Contact Number */}
            <div>
              <label className="label">
                Contact Number <span className="required">*</span>
              </label>
              <input
                type="text"
                className="input"
                placeholder="10-digit number"
                {...register("contactNumber", {
                  required: "Contact Number is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Enter a valid 10-digit number",
                  },
                })}
              />
              {errors.contactNumber && (
                <p className="error">{errors.contactNumber.message}</p>
              )}
            </div>
 
            {/* Email */}
            <div>
              <label className="label">
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                className="input"
                placeholder="example@email.com"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email && <p className="error">{errors.email.message}</p>}
            </div>
                    <div className="action-buttons">
          <button type="submit" className="employee-view-button">Save</button>
        </div>
          </div>
        </div>
      </>
    )}
  </>
)}
     
      {currentStep === 2 && (
  <>
    <h2>Other Details</h2>
 
    {!isEditMode ? (
      <>
        <button
          type="button"
          onClick={() => setIsEditMode(true)}
          className="employee-view-button"
        >
          Edit
        </button>
 
        <div className="viewinfo-row">
          <div><strong>Relation:</strong> {watch("relationType") || "-"}</div>
          <div><strong>Father Name:</strong> {watch("relationName") || "-"}</div>
        </div>
        <div className="viewinfo-row">
          <div><strong>Alternative Number:</strong> {watch("altNumber") || "-"}</div>
          <div><strong>Alternative Type:</strong> {watch("altNumberType") || "-"}</div>
        </div>
      </>
    ) : (
      <>
        <div className="edit-main form-grid">
          <div className="employeeform-leftgrid">
            {/* Relation */}
            <div>
              <label className="label" htmlFor="relationType">
                Select <span className="required">*</span>
              </label>
              <select
                id="relationType"
                className="input"
                {...register("relationType", { required: "Please select a relation" })}
              >
                <option value="">-- Select --</option>
                <option value="do">D/O</option>
                <option value="so">S/O</option>
                <option value="wo">W/O</option>
              </select>
              {errors.relationType && <p className="error">{errors.relationType.message}</p>}
            </div>
 
            {/* Father Name */}
            <div>
              <label className="label">Father Name</label>
              <input
                type="text"
                placeholder="Krishna Kumar"
                className="input"
                {...register("relationName")}
              />
              {errors.relationName && <p className="error">{errors.relationName.message}</p>}
            </div>
          </div>
 
          <div className="employeeform-rightgrid">
            {/* Alternative Number */}
            <div>
              <label className="label">Alternative Number</label>
              <input
                type="text"
                placeholder="91-987xxxxxx16"
                className="input"
                {...register("altNumber")}
              />
              {errors.altNumber && <p className="error">{errors.altNumber.message}</p>}
            </div>
 
            {/* Alternative Type */}
            <div>
              <label className="label" htmlFor="altNumberType">
                Alternative Type <span className="required">*</span>
              </label>
              <select
                id="altNumberType"
                className="input"
                {...register("altNumberType", { required: "Please select an alternative type" })}
              >
                <option value="">Select Relation</option>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Brother">Brother</option>
                <option value="Sister">Sister</option>
                <option value="Son">Son</option>
                <option value="Daughter">Daughter</option>
                <option value="Spouse">Spouse</option>
                <option value="Other">Other</option>
              </select>
              {errors.altNumberType && <p className="error">{errors.altNumberType.message}</p>}
            </div>
          </div>
          <div className="action-buttons">
          <button type="submit" className="employee-view-button">Save</button>
         
        </div>
        </div>
 
       
      </>  
    )}
  </>
)}
   
          {currentStep === 3 && (
  <>
    <h2>Address Details</h2>
 
    {!isEditMode ? (
      <>
        <button
          type="button"
          onClick={() => setIsEditMode(true)}
          className="employee-view-button"
        >
          Edit
        </button>
 
        <div className="viewinfo-row">
          <div><strong>Country:</strong> {watch("country") || "-"}</div>
          <div><strong>State:</strong> {watch("state") || "-"}</div>
        </div>
        <div className="viewinfo-row">
          <div><strong>District:</strong> {watch("district") || "-"}</div>
          <div><strong>Block (Mandal):</strong> {watch("block") || "-"}</div>
        </div>
        <div className="viewinfo-row">
          <div><strong>Village:</strong> {watch("village") || "-"}</div>
          <div><strong>Zipcode:</strong> {watch("zipcode") || "-"}</div>
        </div>
      </>
    ) : (
      <>
        <div className="employee-edit-main-form-grid">
          <div className="employeeform-leftgrid">
            {/* Country */}
            <div>
              <label className="label">Country <span className="required">*</span></label>
              <select {...register("country")} className="input">
                <option value="">Select Country</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
              <p className="error">{errors.country?.message}</p>
            </div>
 
            {/* State */}
            <div>
              <label className="label">State <span className="required">*</span></label>
              <select {...register("state")} className="input">
                <option value="">Select State</option>
                {states.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
              <p className="error">{errors.state?.message}</p>
            </div>
 
            {/* District */}
            <div>
              <label className="label">District <span className="required">*</span></label>
              <select {...register("district")} className="input">
                <option value="">Select District</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
              <p className="error">{errors.district?.message}</p>
            </div>
             <div className="action-buttons">
          <button type="submit" className="employee-view-button">Save</button>
         
        </div>
          </div>
 
          <div className="employeeform-rightgrid">
            {/* Block (mandal) */}
            <div>
              <label className="label">Block (Mandal) <span className="required">*</span></label>
              <select {...register("block")} className="input">
                <option value="">Select Block</option>
                {blocks.map((b) => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
              <p className="error">{errors.block?.message}</p>
            </div>
 
            {/* Village */}
            <div>
              <label className="label">Village <span className="required">*</span></label>
              <select {...register("village")} className="input">
                <option value="">Select Village</option>
                {villages.map((v) => (
                  <option key={v.id} value={v.name}>{v.name}</option>
                ))}
              </select>
              <p className="error">{errors.village?.message}</p>
            </div>
 
            {/* Zipcode */}
            <div>
              <label className="label">Zipcode <span className="required">*</span></label>
              <input
                type="text"
                placeholder="56xxxx"
                className="input"
                {...register("zipcode")}
              />
              <p className="error">{errors.zipcode?.message}</p>
            </div>
          </div>
        </div>
      </>
    )}
  </>
)}
       
        {currentStep === 4 && (
  <>
    <h2>Professional Details</h2>
    {!isEditMode ? (
      <>
        <button
          type="button"
          onClick={() => setIsEditMode(true)}
          className="employee-view-button"
        >
          Edit
        </button>
        {/* Photo display for Professional Details */}
        <div className="viewinfo-row">
          <div className="viewinfo-column" style={{ flexBasis: "100%" }}>
            <strong>Photo:</strong>{" "}
            {photoPreview ? (
              <img
                src={imgError || !employee?.photoFileName ? fallbackUserImg : photoPreview}
                alt="Employee"
                style={{
                  height: "100px",
                  borderRadius: "8px",
                  marginTop: "10px",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
                }}
                onError={() => setImgError(true)}
              />
            ) : (
              "No photo uploaded"
            )}
            {/* Show file name if present */}
            <div style={{ marginTop: "6px", fontSize: "0.95em", color: "#444" }}>
              {employee?.photoFileName
                ? `Current: ${employee.photoFileName}`
                : null}
            </div>
          </div>
        </div>
        <div className="viewinfo-row">
          <div>
            <strong>Education:</strong>{" "}
            {watch("education") || "-"}
          </div>
          <div>
            <strong>Experience:</strong>{" "}
            {watch("experience") || "-"}
          </div>
        </div>
      </>
    ) : (
      <>
        <div className="edit-main form-grid">
          <div className="employeeform-leftgrid">
            {/* Education */}
            <div>
              <label className="label">Education</label>
              <select className="input" {...register("education")}>
                <option value="">Select</option>
                <option value="Primary Schooling">Primary Schooling</option>
                <option value="High School">High School</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Degree">Degree</option>
                <option value="Graduate">Graduate</option>
                <option value="Post-Graduate">Post-Graduate</option>
              </select>
            </div>
 
            {/* Experience */}
            <div>
              <label className="label">Experience</label>
              <input
                type="text"
                placeholder="e.g. 15 Years"
                className="input"
                {...register("experience")}
              />
            </div>
            <div className="action-buttons">
          <button type="submit" className="employee-view-button">Save</button>
        </div>
          </div>
        </div>
 
      </>
    )}
  </>
)}
     
      {currentStep === 5 && (
  <>
    <h2>Bank Details</h2>
    {!isEditMode ? (
      <>
        <button
          type="button"
          onClick={() => setIsEditMode(true)}
          className="employee-view-button"
        >
          Edit
        </button>
        {/* Photo display for Bank Details */}
        <div className="viewinfo-row">
          <div className="viewinfo-column" style={{ flexBasis: "100%" }}>
            <strong>Photo:</strong>{" "}
            {photoPreview ? (
              <img
                src={imgError || !employee?.photoFileName ? fallbackUserImg : photoPreview}
                alt="Employee"
                style={{
                  height: "100px",
                  borderRadius: "8px",
                  marginTop: "10px",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
                }}
                onError={() => setImgError(true)}
              />
            ) : (
              "No photo uploaded"
            )}
            {/* Show file name if present */}
            <div style={{ marginTop: "6px", fontSize: "0.95em", color: "#444" }}>
              {employee?.photoFileName
                ? `Current: ${employee.photoFileName}`
                : null}
            </div>
          </div>
        </div>
        <div className="viewinfo-row">
          <div><strong>Bank Name:</strong> {watch("bankName") || "-"}</div>
          <div><strong>Account Number:</strong> {watch("accountNumber") || "-"}</div>
        </div>
        <div className="viewinfo-row">
          <div><strong>Branch Name:</strong> {watch("branchName") || "-"}</div>
          <div><strong>IFSC Code:</strong> {watch("ifscCode") || "-"}</div>
        </div>
        <div className="viewinfo-row">
          <div>
            <strong>Passbook:</strong>{" "}
            {watch("passbook")?.name ? watch("passbook").name : "No file uploaded"}
          </div>
        </div>
      </>
    ) : (
      <>
        <div className="edit-main form-grid">
          <div className="employeeform-leftgrid">
            <div>
              <label className="label">Bank Name</label>
              <input
                type="text"
                placeholder="HDFC Bank"
                className="input"
                {...register("bankName")}
              />
            </div>
 
            <div>
              <label className="label">Account Number</label>
              <input
                type="text"
                placeholder="281398301653"
                className="input"
                {...register("accountNumber")}
              />
            </div>
 
            <div>
              <label className="label">Branch Name</label>
              <input
                type="text"
                placeholder="Madhapur"
                className="input"
                {...register("branchName")}
              />
            </div>
             <div className="action-buttons">
          <button type="submit" className="employee-view-button">Save</button>
   
        </div>
          </div>
 
          <div className="employeeform-rightgrid">
            <div>
              <label className="label">IFSC Code</label>
              <input
                type="text"
                placeholder="HDFC0028"
                className="input"
                {...register("ifscCode")}
              />
            </div>
 
            <div>
              <label className="label">Passbook</label>
              <input
                type="file"
                className="input"
                onChange={(e) => {
                  setValue("passbook", e.target.files[0]);
                }}
              />
              {watch("passbook")?.name && (
                <p>Uploaded: {watch("passbook").name}</p>
              )}
            </div>
          </div>
         
        </div>
 
       
      </>
    )}
  </>
)}
           
       {currentStep === 6 && (
  <>
    <h2>Documents</h2>
 
    {!isEditMode ? (
      <>
        <button
          type="button"
          onClick={() => setIsEditMode(true)}
          className="employee-view-button"
        >
          Edit
        </button>
 
        <div className="viewinfo-row">
          <div>
            <strong>Document Type:</strong>{" "}
            {watch("documentType") || "-"}
          </div>
          <div>
            <strong>File:</strong>{" "}
            {watch("documentNumber") || "No file uploaded"}
          </div>
        </div>
      </>
    ) : (
      <>
        <div className="edit-main form-grid">
          <div className="employeeform-leftgrid">
            {/* Document Type */}
            <div>
              <label className="label">Add Document <span className="required">*</span></label>
              <select
                className="input"
                {...register("documentType", { required: "Document type is required" })}
              >
                <option value="">Select</option>
                <option value="voter">ID/ Voter Card</option>
                <option value="aadhar">Aadhar Number</option>
                <option value="pan">PAN Number</option>
              </select>
              {errors.documentType && (
                <p className="error">{errors.documentType.message}</p>
              )}
            </div>
 
            {/* Upload File */}
            <div>
              <label className="label">Upload <span className="required">*</span></label>
              <input
                type="file"
                className="input"
                onChange={(e) => {
                  setValue("documentNumber", e.target.files?.[0]);
                }}
              />
              {watch("documentNumber")?.name && (
                <p>Uploaded: {watch("documentNumber").name}</p>
              )}
            </div>
           
        <div className="action-buttons">
          <button type="submit" className="employee-view-button">Save</button>
        </div>
          </div>
        </div>
 
      </>
    )}
  </>
)}
              {currentStep === 7 && (
  <>
    <h2>Portal Access Info</h2>
    {!isEditMode ? (
      <>
        <button
          type="button"
          onClick={() => setIsEditMode(true)}
          className="employee-view-button"
        >
          Edit
        </button>
        <div className="viewinfo-row">
          <div><strong>Role / Designation:</strong> {watch("role") || "-"}</div>
          <div><strong>Access Status:</strong> {watch("accessStatus") || "-"}</div>
        </div>
      </>
    ) : (
      <div className="employee-edit-main-form-grid">
        <div className="employeeform-leftgrid">
          <label className="label">Role / Designation <span className="required">*</span></label>
          <select className="input" {...register("role", { required: true })}>
            <option value="">Select</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
          </select>
          <div className="action-buttons">
          <button type="submit" className="employee-view-button">Save</button>
        </div>
        </div>
 
        <div className="employeeform-rightgrid">
          <label className="label">Access Status <span className="required">*</span></label>
          <select className="input" {...register("accessStatus", { required: true })}>
            <option value="">Select</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
    )}
  </>
)}
 
              {/* You can continue similarly for steps 1–6 */}
 
            </div>
          </form>
        </FormProvider>
      </div>
        </>
      )}
    </div>
  );
};
 
export default ViewEmployee;
 
 