import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SiteLayout, PageHero } from "@/components/SiteLayout";
import {
  Building2,
  UserCheck,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Upload,
  Send,
  Loader2,
  FileText,
  Lock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/teach")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      type: (search.type as "academy" | "instructor") || "academy",
    };
  },
  head: () => ({
    meta: [
      { title: "Teach & Partner — Staken Hub Academy" },
      { name: "description", content: "Partner with Staken Hub Academy as an Institution or become an Instructor." },
      { property: "og:title", content: "Teach & Partner — Staken Hub Academy" },
      { property: "og:description", content: "Join our network as a Partner Academy or Instructor." },
      { property: "og:url", content: "/teach" },
    ],
    links: [{ rel: "canonical", href: "/teach" }],
  }),
  component: TeachPage,
});

const TEACHING_AREAS_OPTIONS = [
  "Networking",
  "Cybersecurity",
  "Programming",
  "Python",
  "Java",
  "JavaScript",
  "Linux",
  "Cloud Computing",
  "Artificial Intelligence",
  "Data Science",
  "Digital Skills",
  "IoT",
];

function TeachPage() {
  const search = Route.useSearch();
  const [applicantType, setApplicantType] = useState<"academy" | "instructor">(search.type || "academy");

  // Step state: "terms" | "form" | "success"
  const [currentStep, setCurrentStep] = useState<"terms" | "form" | "success">("terms");

  // Terms declaration checkboxes
  const [termCheck1, setTermCheck1] = useState(false);
  const [termCheck2, setTermCheck2] = useState(false);
  const [termCheck3, setTermCheck3] = useState(false);
  const allTermsChecked = termCheck1 && termCheck2 && termCheck3;

  // Reset checkboxes whenever switching role types
  useEffect(() => {
    setTermCheck1(false);
    setTermCheck2(false);
    setTermCheck3(false);
  }, [applicantType]);

  // Academy Form State (3 Pages)
  const [academyPage, setAcademyPage] = useState<1 | 2 | 3>(1);
  const [academyData, setAcademyData] = useState({
    organization_name: "",
    contact_person: "",
    position: "",
    email: "",
    phone: "",
    website: "",
    country: "",
    city: "",
    physical_address: "",
    org_type: "Training Center / EdTech",
    year_established: "",
    num_students: "100 - 500",
    num_instructors: "5 - 20",
    training_areas: [] as string[],
    other_area: "",
    uses_lms: "No",
    partner_rationale: "",
    hear_about_us: "Social Media",
    documents_url: "",
  });

  // Instructor Form State (Single Page)
  const [instructorData, setInstructorData] = useState({
    full_name: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    education_level: "Bachelor's Degree",
    occupation: "",
    teaching_experience_years: "3 - 5 Years",
    teaching_areas: [] as string[],
    other_area: "",
    certifications: "",
    teaching_experience_details: "",
    cv_link: "",
    linkedin_profile: "",
    portfolio_website: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionRef, setSubmissionRef] = useState("");

  const handleAcademyAreaToggle = (area: string) => {
    setAcademyData((prev) => {
      const exists = prev.training_areas.includes(area);
      return {
        ...prev,
        training_areas: exists
          ? prev.training_areas.filter((a) => a !== area)
          : [...prev.training_areas, area],
      };
    });
  };

  const handleInstructorAreaToggle = (area: string) => {
    setInstructorData((prev) => {
      const exists = prev.teaching_areas.includes(area);
      return {
        ...prev,
        teaching_areas: exists
          ? prev.teaching_areas.filter((a) => a !== area)
          : [...prev.teaching_areas, area],
      };
    });
  };

  // Submit Handler
  const handleSubmitApplication = async () => {
    setIsSubmitting(true);
    const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || "68a85024-c2c2-4eca-a212-52221f2d0a17";
    const refCode = "STK-" + Math.floor(100000 + Math.random() * 900000);
    setSubmissionRef(refCode);

    try {
      if (applicantType === "academy") {
        const finalAreas = [...academyData.training_areas];
        if (academyData.other_area.trim()) finalAreas.push(`Other: ${academyData.other_area.trim()}`);

        const payload = {
          ...academyData,
          training_areas: finalAreas,
          terms_accepted: true,
          policy_version: "1.0",
          ref_code: refCode,
        };

        // 1. Send email via Web3Forms
        await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            access_key: accessKey,
            subject: `New Partner Academy Application: ${academyData.organization_name} (${refCode})`,
            from_name: "Staken Hub Partnership Portal",
            message: `
NEW PARTNER ACADEMY APPLICATION DETAILS:
----------------------------------------
Ref Code: ${refCode}
Organization Name: ${academyData.organization_name}
Contact Person: ${academyData.contact_person} (${academyData.position})
Official Email: ${academyData.email}
Phone Number: ${academyData.phone}
Website: ${academyData.website || "N/A"}
Location: ${academyData.city}, ${academyData.country}
Physical Address: ${academyData.physical_address}

ORGANIZATION DETAILS:
Organization Type: ${academyData.org_type}
Year Established: ${academyData.year_established}
Number of Students: ${academyData.num_students}
Number of Instructors: ${academyData.num_instructors}
Training Areas: ${finalAreas.join(", ")}
Currently Uses LMS: ${academyData.uses_lms}
Why Partner with Staken Hub: ${academyData.partner_rationale}
How Heard About Us: ${academyData.hear_about_us}
Supporting Documents: ${academyData.documents_url || "None provided"}
Terms Accepted: YES (Policy Version 1.0)
            `.trim(),
          }),
        });

        // 2. Save lean reference record to Supabase
        const { error: dbError } = await (supabase as any).from("academy_applications").insert({
          organization_name: academyData.organization_name,
          contact_person: academyData.contact_person,
          position: academyData.position,
          email: academyData.email,
          phone: academyData.phone,
          website: academyData.website,
          country: academyData.country,
          city: academyData.city,
          physical_address: academyData.physical_address,
          org_type: academyData.org_type,
          year_established: academyData.year_established,
          num_students: academyData.num_students,
          num_instructors: academyData.num_instructors,
          training_areas: finalAreas,
          uses_lms: academyData.uses_lms,
          partner_rationale: academyData.partner_rationale,
          hear_about_us: academyData.hear_about_us,
          documents_url: academyData.documents_url,
          status: "Pending",
          terms_accepted: true,
          policy_version: "1.0",
          full_details: payload,
        });

        if (dbError) {
          console.warn("Database record notice:", dbError);
          // Fallback to legacy applications table if new schema isn't created yet
          if (dbError.code === "PGRST205" || dbError.message?.includes("not find")) {
            await (supabase as any).from("applications").insert({
              type: "Academy",
              applicant_name: academyData.contact_person,
              email: academyData.email,
              phone: academyData.phone,
              institution: academyData.organization_name,
              details: payload,
              status: "pending",
            }).catch(() => {});
          }
        }
      } else {
        // Instructor Submission
        const finalAreas = [...instructorData.teaching_areas];
        if (instructorData.other_area.trim()) finalAreas.push(`Other: ${instructorData.other_area.trim()}`);

        const payload = {
          ...instructorData,
          teaching_areas: finalAreas,
          terms_accepted: true,
          policy_version: "1.0",
          ref_code: refCode,
        };

        // 1. Send email via Web3Forms
        await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            access_key: accessKey,
            subject: `New Instructor Application: ${instructorData.full_name} (${refCode})`,
            from_name: "Staken Hub Instructor Portal",
            message: `
NEW INSTRUCTOR APPLICATION DETAILS:
-----------------------------------
Ref Code: ${refCode}
Full Name: ${instructorData.full_name}
Email Address: ${instructorData.email}
Phone Number: ${instructorData.phone}
Location: ${instructorData.city}, ${instructorData.country}
Highest Education: ${instructorData.education_level}
Current Occupation: ${instructorData.occupation}
Teaching Experience Years: ${instructorData.teaching_experience_years}
Areas Can Teach: ${finalAreas.join(", ")}

QUALIFICATIONS & LINKS:
Professional Certifications: ${instructorData.certifications}
Teaching Experience Details: ${instructorData.teaching_experience_details}
CV Link: ${instructorData.cv_link || "N/A"}
LinkedIn Profile: ${instructorData.linkedin_profile || "N/A"}
Portfolio / Website: ${instructorData.portfolio_website || "N/A"}
Terms Accepted: YES (Policy Version 1.0)
            `.trim(),
          }),
        });

        // 2. Save lean reference record to Supabase
        const { error: dbError } = await (supabase as any).from("instructor_applications").insert({
          full_name: instructorData.full_name,
          email: instructorData.email,
          phone: instructorData.phone,
          country: instructorData.country,
          city: instructorData.city,
          education_level: instructorData.education_level,
          occupation: instructorData.occupation,
          teaching_experience_years: instructorData.teaching_experience_years,
          teaching_areas: finalAreas,
          certifications: instructorData.certifications,
          teaching_experience_details: instructorData.teaching_experience_details,
          cv_link: instructorData.cv_link,
          linkedin_profile: instructorData.linkedin_profile,
          portfolio_website: instructorData.portfolio_website,
          status: "Pending",
          terms_accepted: true,
          policy_version: "1.0",
          full_details: payload,
        });

        if (dbError) {
          console.warn("Database record notice:", dbError);
          if (dbError.code === "PGRST205" || dbError.message?.includes("not find")) {
            await (supabase as any).from("applications").insert({
              type: "Instructor",
              applicant_name: instructorData.full_name,
              email: instructorData.email,
              phone: instructorData.phone,
              details: payload,
              status: "pending",
            }).catch(() => {});
          }
        }
      }

      toast.success("Application submitted successfully!");
      setCurrentStep("success");
    } catch (err) {
      console.error("Application error:", err);
      toast.error("Submission failed. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Teach & Partner"
        title="Empower the Next Generation of Tech Leaders"
        subtitle="Join the Staken Hub ecosystem as a Partner Academy or an Expert Instructor."
      />

      <section className="py-12 bg-background border-b border-border/40">
        <div className="mx-auto w-full max-w-5xl px-6">
          {/* Type Selector Tabs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <button
              type="button"
              onClick={() => {
                setApplicantType("academy");
                setCurrentStep("terms");
                setTermCheck1(false);
                setTermCheck2(false);
                setTermCheck3(false);
              }}
              className={`w-full sm:w-auto px-8 py-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 text-base font-bold cursor-pointer ${
                applicantType === "academy"
                  ? "border-primary bg-primary/10 text-primary shadow-md"
                  : "border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              <Building2 className="size-6" />
              <span>Become a Partner Academy</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setApplicantType("instructor");
                setCurrentStep("terms");
                setTermCheck1(false);
                setTermCheck2(false);
                setTermCheck3(false);
              }}
              className={`w-full sm:w-auto px-8 py-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 text-base font-bold cursor-pointer ${
                applicantType === "instructor"
                  ? "border-primary bg-primary/10 text-primary shadow-md"
                  : "border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              <UserCheck className="size-6" />
              <span>Become an Instructor</span>
            </button>
          </div>

          {/* STEP 1: TERMS & CONDITIONS RESTRICTION WALL */}
          {currentStep === "terms" && (
            <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-xl space-y-8 animate-fade-in">
              <div className="border-b border-border pb-6 flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    <ShieldCheck className="size-4" />
                    Mandatory Agreement
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                    {applicantType === "academy"
                      ? "STAKEN HUB ACADEMY PARTNERSHIP TERMS & CONDITIONS"
                      : "STAKEN HUB INSTRUCTOR PARTNERSHIP TERMS & CONDITIONS"}
                  </h2>
                  <h3 className="text-lg font-semibold text-primary mt-1">Before You Continue</h3>
                </div>
              </div>

              <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed text-muted-foreground space-y-6 max-h-[440px] overflow-y-auto pr-4 border rounded-2xl p-5 bg-muted/30">
                {applicantType === "academy" ? (
                  <>
                    <p className="text-foreground font-medium">
                      Thank you for your institution's interest in partnering with the Staken Hub learning ecosystem.
                    </p>
                    <p>
                      At Staken Hub, we believe that institutional partnerships are built on transparency, professional standards, mutual respect, and academic excellence. As a prospective Partner Academy, please carefully review these Terms & Conditions and Privacy Notice before submitting your application.
                    </p>
                    <p>
                      These terms govern how institutional data is evaluated, how LMS and training collaboration operate, official representative obligations, and confidentiality during the partnership evaluation.
                    </p>
                    <p className="text-primary font-semibold">
                      By proceeding with this application, you confirm that you are an authorized representative of your organization and agree to these Terms & Conditions and Privacy Notice.
                    </p>

                    <div className="space-y-5 pt-2">
                      <div className="border-l-4 border-primary pl-4">
                        <h4 className="font-bold text-foreground text-base">1. Institutional Application & Partnership Eligibility</h4>
                        <p>
                          Submitting this application expresses your institution's interest in joining Staken Hub as a Partner Academy. Application submission does not guarantee approval, institutional affiliation, accreditation, or financial endorsement. All applications are evaluated individually based on institutional capacity, student population, training infrastructure, and academic alignment.
                        </p>
                      </div>

                      <div className="border-l-4 border-primary pl-4">
                        <h4 className="font-bold text-foreground text-base">2. Accuracy of Organization Data & Authority</h4>
                        <p>
                          You warrant that all submitted organization details, student and instructor estimates, physical address, and contact information are accurate, truthful, and complete. You confirm that you possess the legal authority to apply on behalf of your institution. Providing fraudulent institutional data will result in immediate disqualification.
                        </p>
                      </div>

                      <div className="border-l-4 border-primary pl-4">
                        <h4 className="font-bold text-foreground text-base">3. Use of Institutional Information</h4>
                        <p>
                          Information provided will be used exclusively to evaluate institutional fit, assess LMS integration capability, verify credentials, conduct partnership onboarding, and establish collaborative training programs within Staken Hub.
                        </p>
                      </div>

                      <div className="border-l-4 border-primary pl-4">
                        <h4 className="font-bold text-foreground text-base">4. Institutional Privacy & Confidentiality</h4>
                        <p>
                          Staken Hub implements technical and administrative safeguards to protect your institution's records. Access is restricted to authorized partnership officers. We do not sell or disclose institutional applicant data to third parties for commercial marketing.
                        </p>
                      </div>

                      <div className="border-l-4 border-primary pl-4">
                        <h4 className="font-bold text-foreground text-base">5. Intellectual Property & Branding</h4>
                        <p>
                          All Staken Hub logos, digital learning systems, courseware, and software remain the exclusive property of Staken Hub. Partner Academies shall not use Staken Hub branding or represent official partnership until a formal agreement is signed. Pre-existing institutional IP remains the property of the applicant academy.
                        </p>
                      </div>

                      <div className="border-l-4 border-primary pl-4">
                        <h4 className="font-bold text-foreground text-base">6. Official Communications</h4>
                        <p>
                          By submitting, you authorize Staken Hub to communicate with your designated contact person via official email, telephone, SMS, or video channels regarding your application and partnership opportunities.
                        </p>
                      </div>

                      <div className="border-l-4 border-primary pl-4">
                        <h4 className="font-bold text-foreground text-base">7. Review & Institutional Verification</h4>
                        <p>
                          Evaluation may involve document verification, institutional site visits, virtual assessments, and administrative discussions. Review timelines depend on application volume and verification speed.
                        </p>
                      </div>

                      <div className="border-l-4 border-primary pl-4">
                        <h4 className="font-bold text-foreground text-base">8. Limitation of Partnership Claims</h4>
                        <p>
                          Application submission creates no financial or legal obligation. Applicants must not advertise or announce partnership status prior to receiving official written approval.
                        </p>
                      </div>

                      <div className="border-l-4 border-primary pl-4">
                        <h4 className="font-bold text-foreground text-base">9. Policy Updates</h4>
                        <p>
                          Staken Hub reserves the right to update these terms. Revised institutional policies will be published on the platform and provided prior to contract finalization.
                        </p>
                      </div>

                      <div className="bg-primary/5 p-5 rounded-2xl border border-primary/20 mt-6 space-y-2">
                        <h4 className="font-bold text-primary text-base">ACADEMY PRIVACY NOTICE</h4>
                        <p className="text-xs sm:text-sm leading-relaxed">
                          Staken Hub securely collects and processes institution profiles, contact person details, training scope, and supporting documentation solely for partnership evaluation, institutional record-keeping, and operational administration. You may request data updates or deletion by contacting Staken Hub partnership support.
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-foreground font-medium">
                      Thank you for your interest in joining Staken Hub as an Expert Instructor.
                    </p>
                    <p>
                      At Staken Hub, our instructors are the foundation of student success. We seek passionate educators and industry practitioners who adhere to high standards of teaching, integrity, and student engagement. Please carefully read these Instructor Terms & Conditions before submitting your application.
                    </p>
                    <p>
                      These terms outline qualification verification, teaching standards, professional conduct, content rights, and communication protocols during the instructor onboarding process.
                    </p>
                    <p className="text-primary font-semibold">
                      By proceeding with this application, you acknowledge that you have read, understood, and agreed to these Instructor Terms & Conditions and Privacy Notice.
                    </p>

                    <div className="space-y-5 pt-2">
                      <div className="border-l-4 border-primary pl-4">
                        <h4 className="font-bold text-foreground text-base">1. Instructor Application & Evaluation</h4>
                        <p>
                          Submitting an application expresses your interest in teaching or mentoring within Staken Hub. Application submission does not constitute employment, hiring, or automatic course assignment. Every application undergoes rigorous review based on education, industry certifications, teaching experience, and subject expertise.
                        </p>
                      </div>

                      <div className="border-l-4 border-primary pl-4">
                        <h4 className="font-bold text-foreground text-base">2. Truthfulness of Qualifications & CV</h4>
                        <p>
                          You certify that all educational credentials, professional certifications, work history, teaching experience details, CV links, and portfolio links submitted are authentic, complete, and accurate. Misrepresenting qualifications will result in immediate rejection or contract termination.
                        </p>
                      </div>

                      <div className="border-l-4 border-primary pl-4">
                        <h4 className="font-bold text-foreground text-base">3. Use of Instructor Information</h4>
                        <p>
                          Instructor data (qualifications, teaching areas, experience, portfolio) is collected strictly to assess teaching suitability, verify credentials with issuing bodies, conduct onboarding interviews, and match subject areas with course demands.
                        </p>
                      </div>

                      <div className="border-l-4 border-primary pl-4">
                        <h4 className="font-bold text-foreground text-base">4. Privacy & Personal Confidentiality</h4>
                        <p>
                          Staken Hub implements security protocols to protect your resume, certifications, and contact details. Access is limited to authorized academic recruitment personnel. Your contact information will never be sold or shared with external recruiters.
                        </p>
                      </div>

                      <div className="border-l-4 border-primary pl-4">
                        <h4 className="font-bold text-foreground text-base">5. Intellectual Property & Course Material</h4>
                        <p>
                          All Staken Hub platform systems, curriculum templates, branding, and LMS tools remain Staken Hub IP. Pre-existing training materials owned by the instructor remain their property unless transferred under a specific written instruction agreement.
                        </p>
                      </div>

                      <div className="border-l-4 border-primary pl-4">
                        <h4 className="font-bold text-foreground text-base">6. Instructor Communications</h4>
                        <p>
                          You authorize Staken Hub to contact you regarding interview scheduling, credential checks, teaching assignments, and workshop opportunities via email, phone, SMS, or WhatsApp.
                        </p>
                      </div>

                      <div className="border-l-4 border-primary pl-4">
                        <h4 className="font-bold text-foreground text-base">7. Review & Technical Assessment</h4>
                        <p>
                          The evaluation process may include credential verification, reference checks, technical interviews, and mock teaching sessions. Submission of multiple applications does not fast-track approval.
                        </p>

                      </div>

                      <div className="border-l-4 border-primary pl-4">
                        <h4 className="font-bold text-foreground text-base">8. Representation & Conduct</h4>
                        <p>
                          Applicants must not represent themselves as official Staken Hub instructors or publish course offerings until formal approval and contract execution are completed.
                        </p>
                      </div>

                      <div className="border-l-4 border-primary pl-4">
                        <h4 className="font-bold text-foreground text-base">9. Terms Updates</h4>
                        <p>
                          These instructor terms may be updated as our academic model expands. Updated terms will be published on the platform for review.
                        </p>
                      </div>

                      <div className="bg-primary/5 p-5 rounded-2xl border border-primary/20 mt-6 space-y-2">
                        <h4 className="font-bold text-primary text-base">INSTRUCTOR PRIVACY NOTICE</h4>
                        <p className="text-xs sm:text-sm leading-relaxed">
                          Staken Hub securely processes instructor personal details, educational history, certifications, CV links, and portfolio data solely for academic recruitment, background verification, and instructor administration. You may request data access or deletion by contacting Staken Hub academic support.
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Declarations */}
              <div className="bg-card p-6 rounded-2xl border border-border space-y-4">
                <h4 className="font-bold text-foreground text-sm uppercase tracking-wide">Declaration & Consent</h4>

                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={termCheck1}
                    onChange={(e) => setTermCheck1(e.target.checked)}
                    className="mt-1 size-5 rounded text-primary focus:ring-primary accent-teal-600"
                  />
                  <span className="text-sm font-medium text-foreground">
                    I have read and understood the Staken Hub Terms & Conditions.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={termCheck2}
                    onChange={(e) => setTermCheck2(e.target.checked)}
                    className="mt-1 size-5 rounded text-primary focus:ring-primary accent-teal-600"
                  />
                  <span className="text-sm font-medium text-foreground">
                    I have read and understood the Privacy Notice.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={termCheck3}
                    onChange={(e) => setTermCheck3(e.target.checked)}
                    className="mt-1 size-5 rounded text-primary focus:ring-primary accent-teal-600"
                  />
                  <span className="text-sm font-medium text-foreground">
                    I consent to Staken Hub processing my information for the purposes described above.
                  </span>
                </label>
              </div>

              {/* Action Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground italic">
                  * You must accept all declarations above to proceed with the application.
                </p>
                <button
                  type="button"
                  disabled={!allTermsChecked}
                  onClick={() => setCurrentStep("form")}
                  className={`w-full sm:w-auto px-8 py-3.5 rounded-full font-bold transition-all flex items-center justify-center gap-2 ${
                    allTermsChecked
                      ? "bg-primary text-primary-foreground hover:bg-teal-deep shadow-lg cursor-pointer"
                      : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                  }`}
                >
                  <span>Continue Application</span>
                  <ArrowRight className="size-5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2A: ACADEMY APPLICATION FORM (3 PAGES) */}
          {currentStep === "form" && applicantType === "academy" && (
            <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-xl space-y-8 animate-fade-in">
              <div className="border-b border-border pb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-display font-bold text-foreground">Academy Partnership Application</h2>
                  <p className="text-sm text-muted-foreground">Step {academyPage} of 3</p>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3].map((p) => (
                    <div
                      key={p}
                      className={`size-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        academyPage === p
                          ? "bg-primary text-primary-foreground"
                          : academyPage > p
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {p}
                    </div>
                  ))}
                </div>
              </div>

              {/* PAGE 1: ORGANIZATION & CONTACT INFORMATION */}
              {academyPage === 1 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-foreground">Page 1 — Organization & Contact Information</h3>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase text-foreground mb-1">Organization Name *</label>
                      <input
                        type="text"
                        required
                        value={academyData.organization_name}
                        onChange={(e) => setAcademyData({ ...academyData, organization_name: e.target.value })}
                        className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm font-medium"
                        placeholder="e.g. Apex Tech Institute"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-foreground mb-1">Contact Person *</label>
                      <input
                        type="text"
                        required
                        value={academyData.contact_person}
                        onChange={(e) => setAcademyData({ ...academyData, contact_person: e.target.value })}
                        className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm font-medium"
                        placeholder="Full Name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-foreground mb-1">Position / Title *</label>
                      <input
                        type="text"
                        required
                        value={academyData.position}
                        onChange={(e) => setAcademyData({ ...academyData, position: e.target.value })}
                        className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm font-medium"
                        placeholder="e.g. Director, Head of Training"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-foreground mb-1">Official Email *</label>
                      <input
                        type="email"
                        required
                        value={academyData.email}
                        onChange={(e) => setAcademyData({ ...academyData, email: e.target.value })}
                        className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm font-medium"
                        placeholder="official@institution.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-foreground mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={academyData.phone}
                        onChange={(e) => setAcademyData({ ...academyData, phone: e.target.value })}
                        className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm font-medium"
                        placeholder="+254 700 000 000"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-foreground mb-1">Website (Optional)</label>
                      <input
                        type="url"
                        value={academyData.website}
                        onChange={(e) => setAcademyData({ ...academyData, website: e.target.value })}
                        className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm font-medium"
                        placeholder="https://institution.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-foreground mb-1">Country *</label>
                      <input
                        type="text"
                        required
                        value={academyData.country}
                        onChange={(e) => setAcademyData({ ...academyData, country: e.target.value })}
                        className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm font-medium"
                        placeholder="Kenya, Uganda, Nigeria..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-foreground mb-1">City *</label>
                      <input
                        type="text"
                        required
                        value={academyData.city}
                        onChange={(e) => setAcademyData({ ...academyData, city: e.target.value })}
                        className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm font-medium"
                        placeholder="Nairobi, Kampala..."
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase text-foreground mb-1">Physical Address *</label>
                      <input
                        type="text"
                        required
                        value={academyData.physical_address}
                        onChange={(e) => setAcademyData({ ...academyData, physical_address: e.target.value })}
                        className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm font-medium"
                        placeholder="Building, Street, Area"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      disabled={!academyData.organization_name || !academyData.contact_person || !academyData.email}
                      onClick={() => setAcademyPage(2)}
                      className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold hover:bg-teal-deep transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      Next: Organization Details
                      <ArrowRight className="size-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* PAGE 2: ORGANIZATION DETAILS */}
              {academyPage === 2 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-foreground">Page 2 — Organization Details</h3>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase text-foreground mb-1">Organization Type *</label>
                      <div className="relative w-full">
                        <select
                          value={academyData.org_type}
                          onChange={(e) => setAcademyData({ ...academyData, org_type: e.target.value })}
                          className="w-full h-11 px-4 pr-10 rounded-xl border border-border bg-background text-foreground text-sm font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary max-w-full"
                        >
                          <option className="bg-background text-foreground">Training Center / EdTech</option>
                          <option className="bg-background text-foreground">University / College</option>
                          <option className="bg-background text-foreground">TVET Institution</option>
                          <option className="bg-background text-foreground">Secondary / High School</option>
                          <option className="bg-background text-foreground">Corporate Academy</option>
                          <option className="bg-background text-foreground">Other</option>
                        </select>
                        <ChevronDown className="absolute right-3.5 top-3.5 size-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-foreground mb-1">Year Established</label>
                      <input
                        type="text"
                        value={academyData.year_established}
                        onChange={(e) => setAcademyData({ ...academyData, year_established: e.target.value })}
                        className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm font-medium"
                        placeholder="e.g. 2018"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-foreground mb-1">Number of Students</label>
                      <div className="relative w-full">
                        <select
                          value={academyData.num_students}
                          onChange={(e) => setAcademyData({ ...academyData, num_students: e.target.value })}
                          className="w-full h-11 px-4 pr-10 rounded-xl border border-border bg-background text-foreground text-sm font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary max-w-full"
                        >
                          <option className="bg-background text-foreground">Under 50</option>
                          <option className="bg-background text-foreground">50 - 200</option>
                          <option className="bg-background text-foreground">200 - 500</option>
                          <option className="bg-background text-foreground">500 - 1,000</option>
                          <option className="bg-background text-foreground">1,000+</option>
                        </select>
                        <ChevronDown className="absolute right-3.5 top-3.5 size-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-foreground mb-1">Number of Instructors</label>
                      <div className="relative w-full">
                        <select
                          value={academyData.num_instructors}
                          onChange={(e) => setAcademyData({ ...academyData, num_instructors: e.target.value })}
                          className="w-full h-11 px-4 pr-10 rounded-xl border border-border bg-background text-foreground text-sm font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary max-w-full"
                        >
                          <option className="bg-background text-foreground">1 - 5</option>
                          <option className="bg-background text-foreground">5 - 15</option>
                          <option className="bg-background text-foreground">15 - 50</option>
                          <option className="bg-background text-foreground">50+</option>
                        </select>
                        <ChevronDown className="absolute right-3.5 top-3.5 size-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase text-foreground mb-2">Training Areas Offered</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {TEACHING_AREAS_OPTIONS.map((area) => (
                          <label key={area} className="flex items-center gap-2 p-2.5 rounded-xl border border-border hover:bg-muted/40 cursor-pointer text-xs font-medium">
                            <input
                              type="checkbox"
                              checked={academyData.training_areas.includes(area)}
                              onChange={() => handleAcademyAreaToggle(area)}
                              className="rounded text-primary accent-teal-600"
                            />
                            <span>{area}</span>
                          </label>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="Other Training Areas (Specify)"
                        value={academyData.other_area}
                        onChange={(e) => setAcademyData({ ...academyData, other_area: e.target.value })}
                        className="w-full h-10 px-4 rounded-xl border border-border bg-background text-xs font-medium mt-3"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-foreground mb-1">Do you currently use an LMS? *</label>
                      <select
                        value={academyData.uses_lms}
                        onChange={(e) => setAcademyData({ ...academyData, uses_lms: e.target.value })}
                        className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm font-medium"
                      >
                        <option value="No">No</option>
                        <option value="Yes - Moodle">Yes - Moodle</option>
                        <option value="Yes - Canvas">Yes - Canvas</option>
                        <option value="Yes - Custom / Other">Yes - Custom / Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-foreground mb-1">How did you hear about us?</label>
                      <select
                        value={academyData.hear_about_us}
                        onChange={(e) => setAcademyData({ ...academyData, hear_about_us: e.target.value })}
                        className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm font-medium"
                      >
                        <option>Social Media</option>
                        <option>Website / Web Search</option>
                        <option>Referral / Partner</option>
                        <option>Event / Conference</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase text-foreground mb-1">Why would you like to partner with Staken Hub? *</label>
                      <textarea
                        required
                        rows={3}
                        value={academyData.partner_rationale}
                        onChange={(e) => setAcademyData({ ...academyData, partner_rationale: e.target.value })}
                        className="w-full p-4 rounded-xl border border-border bg-background text-sm font-medium"
                        placeholder="Briefly describe your objectives and what you expect from this partnership..."
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setAcademyPage(1)}
                      className="px-6 py-3 rounded-full border border-border text-foreground font-bold hover:bg-muted transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <ArrowLeft className="size-4" />
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={!academyData.partner_rationale}
                      onClick={() => setAcademyPage(3)}
                      className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold hover:bg-teal-deep transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      Next: Review & Submit
                      <ArrowRight className="size-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* PAGE 3: REVIEW & SUBMIT */}
              {academyPage === 3 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-foreground">Page 3 — Review & Submit Application</h3>

                  <div className="bg-muted/40 p-6 rounded-2xl border border-border space-y-4 text-sm">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-muted-foreground uppercase font-bold block">Organization</span>
                        <span className="font-bold text-foreground">{academyData.organization_name}</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground uppercase font-bold block">Contact Person</span>
                        <span className="font-bold text-foreground">{academyData.contact_person} ({academyData.position})</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground uppercase font-bold block">Official Email</span>
                        <span className="font-medium">{academyData.email}</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground uppercase font-bold block">Phone</span>
                        <span className="font-medium">{academyData.phone}</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground uppercase font-bold block">Location</span>
                        <span className="font-medium">{academyData.city}, {academyData.country}</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground uppercase font-bold block">Org Type</span>
                        <span className="font-medium">{academyData.org_type}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-foreground mb-1">
                      Upload Supporting Documents (Optional - Link or URL)
                    </label>
                    <input
                      type="url"
                      value={academyData.documents_url}
                      onChange={(e) => setAcademyData({ ...academyData, documents_url: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm font-medium"
                      placeholder="Google Drive, Dropbox, or Document Link..."
                    />
                    <p className="text-xs text-muted-foreground mt-1">Provide a link to accreditation docs, company profile, or certificates if available.</p>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setAcademyPage(2)}
                      className="px-6 py-3 rounded-full border border-border text-foreground font-bold hover:bg-muted transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <ArrowLeft className="size-4" />
                      Back to Edit
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleSubmitApplication}
                      className="px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-bold hover:bg-teal-deep transition-all flex items-center gap-2 shadow-lg cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="size-5 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="size-5" />
                          <span>Submit Application</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2B: INSTRUCTOR APPLICATION FORM (SINGLE PAGE) */}
          {currentStep === "form" && applicantType === "instructor" && (
            <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-xl space-y-8 animate-fade-in">
              <div className="border-b border-border pb-6">
                <h2 className="text-2xl font-display font-bold text-foreground">Instructor Application</h2>
                <p className="text-sm text-muted-foreground">Single Page Form — Fill out your background and qualifications</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase text-foreground mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={instructorData.full_name}
                    onChange={(e) => setInstructorData({ ...instructorData, full_name: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm font-medium"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-foreground mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={instructorData.email}
                    onChange={(e) => setInstructorData({ ...instructorData, email: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm font-medium"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-foreground mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={instructorData.phone}
                    onChange={(e) => setInstructorData({ ...instructorData, phone: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm font-medium"
                    placeholder="+254 700 000 000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-foreground mb-1">Country *</label>
                  <input
                    type="text"
                    required
                    value={instructorData.country}
                    onChange={(e) => setInstructorData({ ...instructorData, country: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm font-medium"
                    placeholder="Kenya, Rwanda, Ghana..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-foreground mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={instructorData.city}
                    onChange={(e) => setInstructorData({ ...instructorData, city: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm font-medium"
                    placeholder="Nairobi, Kigali..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-foreground mb-1">Highest Level of Education *</label>
                  <div className="relative w-full">
                    <select
                      value={instructorData.education_level}
                      onChange={(e) => setInstructorData({ ...instructorData, education_level: e.target.value })}
                      className="w-full h-11 px-4 pr-10 rounded-xl border border-border bg-background text-foreground text-sm font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary max-w-full"
                    >
                      <option className="bg-background text-foreground">High School</option>
                      <option className="bg-background text-foreground">Diploma</option>
                      <option className="bg-background text-foreground">Bachelor's Degree</option>
                      <option className="bg-background text-foreground">Master's Degree</option>
                      <option className="bg-background text-foreground">Doctorate / PhD</option>
                      <option className="bg-background text-foreground">Professional Certifications Only</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-3.5 size-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-foreground mb-1">Current Occupation *</label>
                  <input
                    type="text"
                    required
                    value={instructorData.occupation}
                    onChange={(e) => setInstructorData({ ...instructorData, occupation: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm font-medium"
                    placeholder="e.g. Senior Cybersecurity Engineer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-foreground mb-1">Years of Teaching Experience *</label>
                  <div className="relative w-full">
                    <select
                      value={instructorData.teaching_experience_years}
                      onChange={(e) => setInstructorData({ ...instructorData, teaching_experience_years: e.target.value })}
                      className="w-full h-11 px-4 pr-10 rounded-xl border border-border bg-background text-foreground text-sm font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary max-w-full"
                    >
                      <option className="bg-background text-foreground">Under 1 Year</option>
                      <option className="bg-background text-foreground">1 - 3 Years</option>
                      <option className="bg-background text-foreground">3 - 5 Years</option>
                      <option className="bg-background text-foreground">5 - 10 Years</option>
                      <option className="bg-background text-foreground">10+ Years</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-3.5 size-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-foreground mb-2">Areas You Can Teach (Check all that apply) *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {TEACHING_AREAS_OPTIONS.map((area) => (
                      <label key={area} className="flex items-center gap-2 p-2.5 rounded-xl border border-border hover:bg-muted/40 cursor-pointer text-xs font-medium">
                        <input
                          type="checkbox"
                          checked={instructorData.teaching_areas.includes(area)}
                          onChange={() => handleInstructorAreaToggle(area)}
                          className="rounded text-primary accent-teal-600"
                        />
                        <span>{area}</span>
                      </label>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Other Subject Areas (Specify)"
                    value={instructorData.other_area}
                    onChange={(e) => setInstructorData({ ...instructorData, other_area: e.target.value })}
                    className="w-full h-10 px-4 rounded-xl border border-border bg-background text-xs font-medium mt-3"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-foreground mb-1">Professional Certifications (Multi-line text)</label>
                  <textarea
                    rows={2}
                    value={instructorData.certifications}
                    onChange={(e) => setInstructorData({ ...instructorData, certifications: e.target.value })}
                    className="w-full p-4 rounded-xl border border-border bg-background text-sm font-medium"
                    placeholder="e.g. CEH, CISSP, AWS Certified Solutions Architect, CCNA, PMP..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-foreground mb-1">Brief Teaching Experience (Multi-line text) *</label>
                  <textarea
                    required
                    rows={3}
                    value={instructorData.teaching_experience_details}
                    onChange={(e) => setInstructorData({ ...instructorData, teaching_experience_details: e.target.value })}
                    className="w-full p-4 rounded-xl border border-border bg-background text-sm font-medium"
                    placeholder="Highlight your previous teaching, workshop facilitation, or mentoring experience..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-foreground mb-1">CV / Resume Link (Include URL)</label>
                  <input
                    type="url"
                    value={instructorData.cv_link}
                    onChange={(e) => setInstructorData({ ...instructorData, cv_link: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm font-medium"
                    placeholder="Google Drive, Dropbox link..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-foreground mb-1">LinkedIn Profile (Include URL)</label>
                  <input
                    type="url"
                    value={instructorData.linkedin_profile}
                    onChange={(e) => setInstructorData({ ...instructorData, linkedin_profile: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm font-medium"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-foreground mb-1">Portfolio / Personal Website (Include URL)</label>
                  <input
                    type="url"
                    value={instructorData.portfolio_website}
                    onChange={(e) => setInstructorData({ ...instructorData, portfolio_website: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm font-medium"
                    placeholder="https://mywebsite.com"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-border">
                <button
                  type="button"
                  onClick={() => setCurrentStep("terms")}
                  className="px-6 py-3 rounded-full border border-border text-foreground font-bold hover:bg-muted transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="size-4" />
                  Review Terms
                </button>

                <button
                  type="button"
                  disabled={isSubmitting || !instructorData.full_name || !instructorData.email || !instructorData.phone}
                  onClick={handleSubmitApplication}
                  className="px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-bold hover:bg-teal-deep transition-all flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="size-5" />
                      <span>Submit Application</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* SUCCESS SCREEN */}
          {currentStep === "success" && (
            <div className="bg-card border border-border rounded-3xl p-8 sm:p-12 shadow-2xl text-center space-y-6 max-w-2xl mx-auto animate-fade-in">
              <div className="size-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="size-12" />
              </div>
              <h2 className="text-3xl font-display font-bold text-foreground">Application Received!</h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                Thank you for applying to partner with <strong>Staken Hub Academy</strong>. Your application has been logged under reference code <span className="font-mono font-bold text-primary px-2 py-1 bg-primary/10 rounded-md">{submissionRef}</span>.
              </p>
              <div className="bg-muted p-4 rounded-2xl text-xs sm:text-sm text-foreground/80 space-y-1">
                <p>An official email notification has been dispatched to our review committee.</p>
                <p>Our admissions & partnership team will evaluate your details and respond within 3 business days.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCurrentStep("terms");
                  setTermCheck1(false);
                  setTermCheck2(false);
                  setTermCheck3(false);
                }}
                className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-bold hover:bg-teal-deep transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                Done / Back to Teach
              </button>
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
