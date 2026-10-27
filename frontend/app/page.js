"use client";

import { useMemo, useState } from "react";

const initialForm = {
  eventName: "",
  eventType: "",
  startDate: "",
  endDate: "",
  location: "",
  venue: "",
  category: "planner",
  categoryDetails: {
    serviceType: "",
    attendeeCount: "",
    plannerBudget: "",
    services: "",
    performerType: "",
    performerCount: "1",
    durationMinutes: "",
    performerBudget: "",
    equipment: "",
    crewRole: "",
    crewCount: "1",
    workingHours: "",
    crewBudget: "",
    additionalNotes: ""
  }
};

const categories = [
  { value: "planner", label: "Event Planner", icon: "🗓️", description: "Plan and coordinate the event" },
  { value: "performer", label: "Performer", icon: "🎤", description: "Book an artist or entertainer" },
  { value: "crew", label: "Crew", icon: "🧰", description: "Hire event staff and specialists" }
];

function Field({ label, name, value, onChange, error, type = "text", required = false, placeholder = "", min, children }) {
  return (
    <div className="col-md-6 mb-3">
      <label className="form-label" htmlFor={name}>
        {label}{required && <span className="text-danger"> *</span>}
      </label>
      {children || (
        <input
          id={name}
          className={`form-control ${error ? "is-invalid" : ""}`}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          min={min}
        />
      )}
      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  );
}

export default function HomePage() {
  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);
  const [submittedRequirement, setSubmittedRequirement] = useState(null);

  const categoryLabel = useMemo(
    () => categories.find((item) => item.value === form.category)?.label || "Event Planner",
    [form.category]
  );

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setNotice(null);
  }

  function updateDetail(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      categoryDetails: { ...current.categoryDetails, [name]: value }
    }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setNotice(null);
  }

  function validateStep(currentStep) {
    const nextErrors = {};
    if (currentStep === 1) {
      if (!form.eventName.trim()) nextErrors.eventName = "Enter an event name.";
      if (!form.eventType) nextErrors.eventType = "Select an event type.";
      if (!form.startDate) nextErrors.startDate = "Select a start date.";
      if (!form.endDate) nextErrors.endDate = "Select an end date.";
      if (form.startDate && form.endDate && form.endDate < form.startDate) {
        nextErrors.endDate = "End date cannot be before start date.";
      }
      if (!form.location.trim()) nextErrors.location = "Enter a location.";
      if (!form.category) nextErrors.category = "Choose a category.";
    }

    if (currentStep === 2) {
      const details = form.categoryDetails;
      if (form.category === "planner") {
        if (!details.serviceType) nextErrors.serviceType = "Choose the service required.";
        if (details.attendeeCount && Number(details.attendeeCount) < 1) nextErrors.attendeeCount = "Must be at least 1.";
        if (details.plannerBudget && Number(details.plannerBudget) < 0) nextErrors.plannerBudget = "Budget cannot be negative.";
      } else if (form.category === "performer") {
        if (!details.performerType) nextErrors.performerType = "Choose a performer type.";
        if (!details.performerCount || Number(details.performerCount) < 1) nextErrors.performerCount = "Enter at least 1 performer.";
        if (details.durationMinutes && Number(details.durationMinutes) < 1) nextErrors.durationMinutes = "Duration must be at least 1 minute.";
        if (details.performerBudget && Number(details.performerBudget) < 0) nextErrors.performerBudget = "Budget cannot be negative.";
      } else {
        if (!details.crewRole) nextErrors.crewRole = "Choose a crew role.";
        if (!details.crewCount || Number(details.crewCount) < 1) nextErrors.crewCount = "Enter at least 1 crew member.";
        if (details.crewBudget && Number(details.crewBudget) < 0) nextErrors.crewBudget = "Budget cannot be negative.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function nextStep() {
    setNotice(null);
    if (validateStep(step)) setStep((current) => Math.min(current + 1, 4));
  }

  function previousStep() {
    setNotice(null);
    setErrors({});
    setStep((current) => Math.max(current - 1, 1));
  }

  function buildPayload() {
    const d = form.categoryDetails;
    let categoryDetails = {};

    if (form.category === "planner") {
      categoryDetails = {
        serviceType: d.serviceType,
        attendeeCount: d.attendeeCount ? Number(d.attendeeCount) : null,
        budget: d.plannerBudget ? Number(d.plannerBudget) : null,
        services: d.services.trim(),
        additionalNotes: d.additionalNotes.trim()
      };
    } else if (form.category === "performer") {
      categoryDetails = {
        performerType: d.performerType,
        performerCount: Number(d.performerCount),
        durationMinutes: d.durationMinutes ? Number(d.durationMinutes) : null,
        budget: d.performerBudget ? Number(d.performerBudget) : null,
        equipment: d.equipment.trim(),
        additionalNotes: d.additionalNotes.trim()
      };
    } else {
      categoryDetails = {
        crewRole: d.crewRole,
        crewCount: Number(d.crewCount),
        workingHours: d.workingHours.trim(),
        budget: d.crewBudget ? Number(d.crewBudget) : null,
        additionalNotes: d.additionalNotes.trim()
      };
    }

    return {
      eventName: form.eventName.trim(),
      eventType: form.eventType,
      startDate: form.startDate,
      endDate: form.endDate,
      location: form.location.trim(),
      venue: form.venue.trim(),
      category: form.category,
      categoryDetails
    };
  }

  async function submitRequirement() {
    setSubmitting(true);
    setNotice(null);

    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api").replace(/\/$/, "");
      const response = await fetch(`${baseUrl}/requirements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload())
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        const message = Array.isArray(result.errors) ? result.errors.join(" ") : result.message;
        throw new Error(message || "Could not submit the requirement.");
      }

      setSubmittedRequirement(result.data);
      setNotice({ type: "success", text: "Your requirement has been submitted successfully." });
      setStep(4);
    } catch (error) {
      setNotice({
        type: "danger",
        text: error.message === "Failed to fetch"
          ? "Could not connect to the backend. Check that the API is running and the API URL is correct."
          : error.message
      });
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setForm(initialForm);
    setStep(1);
    setErrors({});
    setNotice(null);
    setSubmittedRequirement(null);
  }

  const details = form.categoryDetails;

  return (
    <main className="page-shell">
      <nav className="navbar navbar-expand-lg bg-white border-bottom">
        <div className="container py-2">
          <a className="navbar-brand fw-bold brand" href="#">goPratle<span>.</span></a>
          <span className="small text-secondary d-none d-sm-inline">Event requirements, made simple</span>
        </div>
      </nav>

      <section className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-9 col-xl-8">
            <div className="mb-4 text-center">
              <span className="eyebrow">POST A REQUIREMENT</span>
              <h1 className="display-6 fw-bold mt-2">Bring your event to life.</h1>
              <p className="text-secondary mb-0">Tell us what you need. We’ll help you organise the details.</p>
            </div>

            <div className="stepper mb-4" aria-label={`Step ${step} of 4`}>
              {[1, 2, 3, 4].map((number) => (
                <div className={`step-item ${step >= number ? "active" : ""}`} key={number}>
                  <div className="step-circle">{number < step ? "✓" : number}</div>
                  <span>{["Event basics", "Your needs", "Extra details", "Review"][number - 1]}</span>
                </div>
              ))}
            </div>

            <div className="card form-card border-0">
              <div className="card-body p-4 p-md-5">
                {notice && (
                  <div className={`alert alert-${notice.type}`} role="alert">
                    {notice.text}
                  </div>
                )}

                {submittedRequirement && notice?.type === "success" ? (
                  <div className="text-center py-4">
                    <div className="success-icon mb-3">✓</div>
                    <h2 className="h3 fw-bold">Requirement submitted!</h2>
                    <p className="text-secondary">Your {submittedRequirement.category} requirement has been saved.</p>
                    <div className="summary-box text-start my-4">
                      <div className="d-flex justify-content-between gap-3 py-2 border-bottom">
                        <span className="text-secondary">Reference ID</span>
                        <code className="text-break">{submittedRequirement._id}</code>
                      </div>
                      <div className="d-flex justify-content-between gap-3 py-2 border-bottom">
                        <span className="text-secondary">Event</span>
                        <strong>{submittedRequirement.eventName}</strong>
                      </div>
                      <div className="d-flex justify-content-between gap-3 py-2">
                        <span className="text-secondary">Category</span>
                        <strong className="text-capitalize">{submittedRequirement.category}</strong>
                      </div>
                    </div>
                    <button className="btn btn-primary px-4" onClick={resetForm}>Post another requirement</button>
                  </div>
                ) : (
                  <>
                    {step === 1 && (
                      <>
                        <div className="section-heading mb-4">
                          <span className="section-number">01</span>
                          <div><h2 className="h4 fw-bold mb-1">Event basics</h2><p className="text-secondary mb-0">Start with the key information.</p></div>
                        </div>
                        <div className="row">
                          <Field label="Event name" name="eventName" value={form.eventName} onChange={updateField} error={errors.eventName} required placeholder="e.g. College Cultural Fest" />
                          <Field label="Event type" name="eventType" value={form.eventType} onChange={updateField} error={errors.eventType} required>
                            <select id="eventType" name="eventType" className={`form-select ${errors.eventType ? "is-invalid" : ""}`} value={form.eventType} onChange={updateField}>
                              <option value="">Select event type</option>
                              <option>Wedding</option><option>College Event</option><option>Concert</option><option>Corporate Event</option><option>Private Party</option><option>Festival</option><option>Other</option>
                            </select>
                          </Field>
                          <Field label="Start date" name="startDate" type="date" value={form.startDate} onChange={updateField} error={errors.startDate} required min={new Date().toISOString().slice(0, 10)} />
                          <Field label="End date" name="endDate" type="date" value={form.endDate} onChange={updateField} error={errors.endDate} required min={form.startDate || new Date().toISOString().slice(0, 10)} />
                          <Field label="City / location" name="location" value={form.location} onChange={updateField} error={errors.location} required placeholder="e.g. Chennai" />
                          <Field label="Venue (optional)" name="venue" value={form.venue} onChange={updateField} placeholder="e.g. ABC Convention Hall" />
                        </div>
                        <hr className="my-3" />
                        <label className="form-label fw-semibold">What are you looking for?<span className="text-danger"> *</span></label>
                        <div className="row g-3">
                          {categories.map((category) => (
                            <div className="col-md-4" key={category.value}>
                              <button type="button" onClick={() => { setForm((current) => ({ ...current, category: category.value })); setErrors((current) => ({ ...current, category: "" })); }} className={`category-card w-100 ${form.category === category.value ? "selected" : ""}`}>
                                <span className="category-icon">{category.icon}</span>
                                <span className="d-block fw-semibold mt-2">{category.label}</span>
                                <span className="d-block small text-secondary mt-1">{category.description}</span>
                              </button>
                            </div>
                          ))}
                        </div>
                        {errors.category && <div className="text-danger small mt-2">{errors.category}</div>}
                      </>
                    )}

                    {step === 2 && (
                      <>
                        <div className="section-heading mb-4">
                          <span className="section-number">02</span>
                          <div><h2 className="h4 fw-bold mb-1">{categoryLabel} requirements</h2><p className="text-secondary mb-0">Tell us the main details you need.</p></div>
                        </div>
                        <div className="row">
                          {form.category === "planner" && (
                            <>
                              <Field label="Service required" name="serviceType" value={details.serviceType} onChange={updateDetail} error={errors.serviceType} required>
                                <select id="serviceType" name="serviceType" className={`form-select ${errors.serviceType ? "is-invalid" : ""}`} value={details.serviceType} onChange={updateDetail}>
                                  <option value="">Choose a service</option><option>Full event planning</option><option>Venue and vendor coordination</option><option>Decor and theme planning</option><option>On-day coordination</option>
                                </select>
                              </Field>
                              <Field label="Expected attendees" name="attendeeCount" type="number" min="1" value={details.attendeeCount} onChange={updateDetail} error={errors.attendeeCount} placeholder="e.g. 250" />
                              <Field label="Budget (₹)" name="plannerBudget" type="number" min="0" value={details.plannerBudget} onChange={updateDetail} error={errors.plannerBudget} placeholder="e.g. 50000" />
                              <Field label="Services / tasks" name="services" value={details.services} onChange={updateDetail} placeholder="e.g. Vendors, schedule, decoration" />
                            </>
                          )}
                          {form.category === "performer" && (
                            <>
                              <Field label="Performer type" name="performerType" value={details.performerType} onChange={updateDetail} error={errors.performerType} required>
                                <select id="performerType" name="performerType" className={`form-select ${errors.performerType ? "is-invalid" : ""}`} value={details.performerType} onChange={updateDetail}>
                                  <option value="">Choose performer type</option><option>Singer</option><option>DJ</option><option>Dancer</option><option>Band</option><option>Comedian</option><option>Host / MC</option><option>Other</option>
                                </select>
                              </Field>
                              <Field label="Number of performers" name="performerCount" type="number" min="1" value={details.performerCount} onChange={updateDetail} error={errors.performerCount} required />
                              <Field label="Performance duration (minutes)" name="durationMinutes" type="number" min="1" value={details.durationMinutes} onChange={updateDetail} error={errors.durationMinutes} placeholder="e.g. 45" />
                              <Field label="Budget (₹)" name="performerBudget" type="number" min="0" value={details.performerBudget} onChange={updateDetail} error={errors.performerBudget} placeholder="e.g. 15000" />
                              <Field label="Equipment requirements" name="equipment" value={details.equipment} onChange={updateDetail} placeholder="e.g. Microphone, speakers" />
                            </>
                          )}
                          {form.category === "crew" && (
                            <>
                              <Field label="Crew role" name="crewRole" value={details.crewRole} onChange={updateDetail} error={errors.crewRole} required>
                                <select id="crewRole" name="crewRole" className={`form-select ${errors.crewRole ? "is-invalid" : ""}`} value={details.crewRole} onChange={updateDetail}>
                                  <option value="">Choose crew role</option><option>Photographer</option><option>Videographer</option><option>Sound technician</option><option>Lighting technician</option><option>Security</option><option>Stage assistant</option><option>Event staff</option><option>Other</option>
                                </select>
                              </Field>
                              <Field label="Number of crew members" name="crewCount" type="number" min="1" value={details.crewCount} onChange={updateDetail} error={errors.crewCount} required />
                              <Field label="Working hours / shift" name="workingHours" value={details.workingHours} onChange={updateDetail} placeholder="e.g. 4 PM to 11 PM" />
                              <Field label="Budget (₹)" name="crewBudget" type="number" min="0" value={details.crewBudget} onChange={updateDetail} error={errors.crewBudget} placeholder="e.g. 8000" />
                            </>
                          )}
                        </div>
                      </>
                    )}

                    {step === 3 && (
                      <>
                        <div className="section-heading mb-4">
                          <span className="section-number">03</span>
                          <div><h2 className="h4 fw-bold mb-1">Extra details</h2><p className="text-secondary mb-0">Add any context that will help fulfil the requirement.</p></div>
                        </div>
                        <div className="mb-3">
                          <label className="form-label" htmlFor="additionalNotes">Additional instructions (optional)</label>
                          <textarea id="additionalNotes" name="additionalNotes" className="form-control" rows="5" maxLength="1000" value={details.additionalNotes} onChange={updateDetail} placeholder="Share preferences, special requirements, timings, or other useful details." />
                          <div className="form-text text-end">{details.additionalNotes.length}/1000</div>
                        </div>
                        {form.category === "performer" && (
                          <div className="alert alert-light border"><strong>Equipment:</strong> {details.equipment || "No specific equipment mentioned."}</div>
                        )}
                        {form.category === "planner" && (
                          <div className="alert alert-light border"><strong>Services:</strong> {details.services || "No additional services listed."}</div>
                        )}
                        {form.category === "crew" && (
                          <div className="alert alert-light border"><strong>Shift:</strong> {details.workingHours || "No shift details mentioned."}</div>
                        )}
                        <p className="small text-secondary mb-0">You can go back to change any previous answer before submitting.</p>
                      </>
                    )}

                    {step === 4 && (
                      <>
                        <div className="section-heading mb-4">
                          <span className="section-number">04</span>
                          <div><h2 className="h4 fw-bold mb-1">Review your requirement</h2><p className="text-secondary mb-0">Check the details before sending them.</p></div>
                        </div>
                        <div className="summary-box">
                          <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                            <div><span className="eyebrow">EVENT</span><h3 className="h5 fw-bold mt-1 mb-1">{form.eventName || "Untitled event"}</h3><p className="text-secondary small mb-0">{form.eventType || "Event type not selected"}</p></div>
                            <span className="badge rounded-pill text-bg-primary text-capitalize">{form.category}</span>
                          </div>
                          <div className="row g-3 small">
                            <div className="col-sm-6"><span className="text-secondary d-block">Dates</span><strong>{form.startDate || "—"} to {form.endDate || "—"}</strong></div>
                            <div className="col-sm-6"><span className="text-secondary d-block">Location</span><strong>{form.location || "—"}</strong></div>
                            <div className="col-sm-6"><span className="text-secondary d-block">Venue</span><strong>{form.venue || "Not specified"}</strong></div>
                            <div className="col-sm-6"><span className="text-secondary d-block">Selected category</span><strong>{categoryLabel}</strong></div>
                          </div>
                          <hr />
                          <h4 className="h6 fw-bold">Category details</h4>
                          <div className="small text-secondary">
                            {form.category === "planner" && <><p className="mb-1">Service: {details.serviceType || "—"}</p><p className="mb-1">Attendees: {details.attendeeCount || "Not specified"}</p><p className="mb-1">Budget: {details.plannerBudget ? `₹${details.plannerBudget}` : "Not specified"}</p><p className="mb-1">Services: {details.services || "Not specified"}</p></>}
                            {form.category === "performer" && <><p className="mb-1">Performer: {details.performerType || "—"}</p><p className="mb-1">Count: {details.performerCount || "—"}</p><p className="mb-1">Duration: {details.durationMinutes ? `${details.durationMinutes} minutes` : "Not specified"}</p><p className="mb-1">Budget: {details.performerBudget ? `₹${details.performerBudget}` : "Not specified"}</p><p className="mb-1">Equipment: {details.equipment || "Not specified"}</p></>}
                            {form.category === "crew" && <><p className="mb-1">Role: {details.crewRole || "—"}</p><p className="mb-1">Crew members: {details.crewCount || "—"}</p><p className="mb-1">Working hours: {details.workingHours || "Not specified"}</p><p className="mb-1">Budget: {details.crewBudget ? `₹${details.crewBudget}` : "Not specified"}</p></>}
                            <p className="mb-0 mt-2"><strong>Additional instructions:</strong> {details.additionalNotes || "None"}</p>
                          </div>
                        </div>
                        <div className="alert alert-info mt-3 mb-0 small">Submitting will send this data to the Express API and save it in MongoDB.</div>
                      </>
                    )}

                    <div className="d-flex justify-content-between align-items-center gap-3 mt-4 pt-3 border-top">
                      <button type="button" className="btn btn-outline-secondary px-4" onClick={previousStep} disabled={step === 1 || submitting}>Back</button>
                      <span className="small text-secondary d-none d-sm-inline">Step {step} of 4</span>
                      {step < 4 ? (
                        <button type="button" className="btn btn-primary px-4" onClick={nextStep}>Continue <span aria-hidden="true">→</span></button>
                      ) : (
                        <button type="button" className="btn btn-primary px-4" onClick={submitRequirement} disabled={submitting}>
                          {submitting ? <><span className="spinner-border spinner-border-sm me-2" />Submitting…</> : "Submit requirement"}
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
            <p className="text-center small text-secondary mt-4">Built as a full-stack demonstration · GoPratle assignment</p>
          </div>
        </div>
      </section>
    </main>
  );
}
