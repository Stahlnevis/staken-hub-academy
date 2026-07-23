import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/SiteLayout";
import { COHORTS } from "@/lib/programmes";
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  Smartphone,
  CreditCard,
  Lock,
  ArrowLeft,
  Check,
  Info,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useCmsRows } from "@/lib/useCmsRows";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/apply")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      programme: (search.programme as string) || undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Apply Now — Staken Hub Academy" },
      { name: "description", content: "Apply to join the next cohort at Staken Hub Academy." },
      { property: "og:title", content: "Apply — Staken Hub Academy" },
      { property: "og:description", content: "Start your application today." },
      { property: "og:url", content: "/apply" },
    ],
    links: [{ rel: "canonical", href: "/apply" }],
  }),
  component: ApplyPage,
});

function ApplyPage() {
  const [step, setStep] = useState<"form" | "payment" | "success">("form");
  const [applicationData, setApplicationData] = useState<any>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);
  const [hasCoupon, setHasCoupon] = useState<"yes" | "no">("no");
  const [couponError, setCouponError] = useState<string | null>(null);

  const { rows: dbProgrammes, loading: loadingProgrammes } = useCmsRows<any>("programmes", { orderBy: "sort_order" });
  const { rows: dbBootcamps, loading: loadingBootcamps } = useCmsRows<any>("bootcamps", { orderBy: "sort_order" });
  const { rows: dbCorpServices, loading: loadingCorpServices } = useCmsRows<any>("corporate_services", { orderBy: "sort_order" });
  const search = Route.useSearch();
  const [selectedProgramme, setSelectedProgramme] = useState("");
  const [applyCategory, setApplyCategory] = useState<"programme" | "bootcamp" | "corp">("programme");

  // Payment State
  const [paymentType, setPaymentType] = useState<"mpesa" | "paypal">("mpesa");
  const [amountOption, setAmountOption] = useState<"50" | "100" | "custom">("100");
  const [customAmount, setCustomAmount] = useState("");
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [stkStatus, setStkStatus] = useState<"idle" | "initiating" | "prompted" | "success" | "failed">("idle");
  const [lastMpesaReceipt, setLastMpesaReceipt] = useState("");

  // Coupons State
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  // Find price from DB or default (check programmes, bootcamps, then corporate services)
  const matchedItem = dbProgrammes.find(
    (p: any) => p.title.toLowerCase() === selectedProgramme.toLowerCase()
  ) || dbBootcamps.find(
    (b: any) => b.title.toLowerCase() === selectedProgramme.toLowerCase()
  ) || dbCorpServices.find(
    (c: any) => c.title.toLowerCase() === selectedProgramme.toLowerCase()
  );
  
  // Default to 20000 for Corporate Training, and 10000 for Programmes/Bootcamps if price field is not present
  const rawPrice = matchedItem?.price;

  // Robust price parser: handles numbers, "12,000", "10000 KSH", "KES 5,000", null, undefined, etc.
  const parsePrice = (val: unknown): number => {
    if (typeof val === "number" && !isNaN(val)) return val;
    if (!val) return 0;
    const cleaned = String(val).replace(/[^0-9.]/g, "");
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  };

  const parsedPrice = parsePrice(rawPrice);
  const priceNumber = parsedPrice > 0 ? parsedPrice : (applyCategory === "corp" ? 20000 : 10000);
  
  // Math check: Apply discount if coupon is selected & verified
  const finalPrice = Math.max(0, priceNumber - (hasCoupon === "yes" ? couponDiscount : 0));
  const minDeposit = finalPrice * 0.5;

  // Update selected program if URL query param matches
  useEffect(() => {
    if (search.programme) {
      const progMatch = dbProgrammes.find(
        (p: any) => p.title.toLowerCase() === search.programme?.toLowerCase()
      );
      const bootcampMatch = dbBootcamps.find(
        (b: any) => b.title.toLowerCase() === search.programme?.toLowerCase()
      );
      const corpMatch = dbCorpServices.find(
        (c: any) => c.title.toLowerCase() === search.programme?.toLowerCase()
      );
      
      if (progMatch) {
        setApplyCategory("programme");
        setSelectedProgramme(progMatch.title);
      } else if (bootcampMatch) {
        setApplyCategory("bootcamp");
        setSelectedProgramme(bootcampMatch.title);
      } else if (corpMatch) {
        setApplyCategory("corp");
        setSelectedProgramme(corpMatch.title);
      } else {
        const cohortMatch = COHORTS.find(
          (c) => c.programme.toLowerCase() === search.programme?.toLowerCase()
        );
        if (cohortMatch) {
          setApplyCategory("programme");
          setSelectedProgramme(cohortMatch.programme);
        }
      }
    } else {
      if (dbProgrammes.length > 0 && !selectedProgramme) {
        setApplyCategory("programme");
        setSelectedProgramme(dbProgrammes[0].title);
      }
    }
  }, [search.programme, dbProgrammes, dbBootcamps, dbCorpServices, selectedProgramme]);

  // Sync payment amounts on selection/option changes
  useEffect(() => {
    if (amountOption === "100") {
      setPaymentAmount(finalPrice);
    } else if (amountOption === "50") {
      setPaymentAmount(minDeposit);
    } else {
      const parsed = parseFloat(customAmount);
      setPaymentAmount(isNaN(parsed) ? 0 : parsed);
    }
  }, [selectedProgramme, amountOption, customAmount, finalPrice, minDeposit]);

  // Debounced Coupon Validation Effect
  useEffect(() => {
    if (hasCoupon === "no" || !couponCode.trim()) {
      setCouponError(null);
      setCouponSuccess(null);
      setCouponDiscount(0);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsValidatingCoupon(true);
      setCouponError(null);
      setCouponSuccess(null);
      setCouponDiscount(0);

      try {
        const { data, error } = await supabase
          .from("coupons")
          .select("*")
          .eq("code", couponCode.trim())
          .maybeSingle();

        if (error || !data) {
          setCouponError("This coupon code does not exist.");
        } else if (data.programme.toLowerCase() !== selectedProgramme.toLowerCase()) {
          setCouponError(`This coupon code is only valid for the "${data.programme}" programme.`);
        } else {
          const discount = parseFloat(data.discount_amount) || 0;
          setCouponDiscount(discount);
          setCouponSuccess(`Coupon applied! KES ${discount.toLocaleString()} discount.`);
        }
      } catch (err) {
        console.error("Coupon validation error:", err);
        setCouponError("Error validating coupon code. Please try again.");
      } finally {
        setIsValidatingCoupon(false);
      }
    }, 600);

    return () => clearTimeout(delayDebounce);
  }, [couponCode, selectedProgramme, hasCoupon]);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    if (hasCoupon === "yes") {
      if (couponError || !couponCode.trim() || couponDiscount === 0) {
        setIsSubmitting(false);
        return;
      }
    }
    
    setIsSubmitting(false);

    // Save the student details and advance to checkout
    setApplicationData(data);
    setMpesaPhone(String(data.phone || ""));
    setStep("payment");
  };

  const handleMpesaCheckout = async () => {
    // Compute the amount to charge right now — avoids stale state race conditions
    const effectiveAmount =
      amountOption === "100"
        ? finalPrice
        : amountOption === "50"
          ? minDeposit
          : parseFloat(customAmount) || 0;

    if (effectiveAmount < minDeposit || effectiveAmount <= 0 || !mpesaPhone) return;
    setStkStatus("initiating");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 seconds timeout

    try {
      // Initiate STK Push via Supabase Edge Function.
      // We pass all student data here so the edge function can pre-insert the
      // application row BEFORE the STK push fires. This guarantees the row
      // exists in DB when Safaricom fires the callback with the real receipt code.
      const { data: res, error: invokeErr } = await supabase.functions.invoke("mpesa", {
        body: {
          action: "initiate",
          phone: mpesaPhone,
          amount: effectiveAmount,
          programme: selectedProgramme,
          // Student data for pre-insert in edge function
          firstName: applicationData?.firstName || "",
          lastName: applicationData?.lastName || "",
          email: applicationData?.email || "",
          mode: applicationData?.mode || "Online",
          goals: applicationData?.goals || "",
          couponCode: couponCode || null,
        },
        abortSignal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (invokeErr) {
        throw invokeErr;
      }

      console.log("STK push initiated response:", res);

      if (res && res.ResponseCode === "0") {
        setStkStatus("prompted");
        const checkoutRequestId = res.CheckoutRequestID;
        // Application row is already pre-inserted by the edge function above.

        // Start polling Safaricom for payment confirmation
        let attempts = 0;
        const interval = setInterval(async () => {
          attempts++;
          if (attempts > 30) { // 90 seconds timeout
            clearInterval(interval);
            setStkStatus("failed");
            return;
          }

          try {
            const { data: queryRes, error: queryErr } = await supabase.functions.invoke("mpesa", {
              body: {
                action: "query",
                checkoutRequestId,
              },
            });

            if (queryErr) {
              throw queryErr;
            }

            console.log("STK push query status:", queryRes);

            if (queryRes.status === "success") {
              clearInterval(interval);
              setStkStatus("success");
              setIsSubmitting(true);
              const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || "";

              // Safaricom's query endpoint does NOT return the receipt code (MpesaReceiptNumber).
              // The real receipt code (e.g. UGNKU0EL6T) is ONLY sent via Safaricom's Callback.
              // Poll the DB for up to 15s to get the real code written by the callback.
              let mpesaRef = "";
              for (let i = 0; i < 5; i++) {
                await new Promise((r) => setTimeout(r, 3000));
                try {
                  const { data: appRow } = await supabase
                    .from("applications")
                    .select("mpesa_reference")
                    .eq("checkout_request_id", checkoutRequestId)
                    .maybeSingle();

                  const ref = appRow?.mpesa_reference || "";
                  if (ref && ref !== "Pending PIN" && !ref.startsWith("ws_CO_") && !ref.startsWith("kensab")) {
                    mpesaRef = ref; // Real receipt code from callback (e.g. UGNKU0EL6T)
                    break;
                  }
                } catch (_) {}
              }

              // Show real receipt if found, otherwise show empty (avoid showing ws_CO_... to user)
              setLastMpesaReceipt(mpesaRef);

              // Update application with confirmed status and receipt
              try {
                await supabase
                  .from("applications")
                  .update({
                    amount_paid: `KES ${paymentAmount.toLocaleString()}`,
                    payment_status: "Completed",
                    ...(mpesaRef ? { mpesa_reference: mpesaRef } : {}),
                  })
                  .eq("checkout_request_id", checkoutRequestId);
              } catch (dbErr) {
                console.error("Supabase update error:", dbErr);
              }

              try {
                await fetch("https://api.web3forms.com/submit", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                  },
                  body: JSON.stringify({
                    access_key: accessKey || "YOUR_WEB3FORMS_ACCESS_KEY_HERE",
                    subject: `New Application & M-Pesa Payment - ${selectedProgramme}`,
                    from_name: "Staken Hub Admissions Alert",
                    ...applicationData,
                    paymentMethod: "M-Pesa Auto Pay",
                    mpesaPhoneNumber: mpesaPhone,
                    amountPaid: `KES ${paymentAmount.toLocaleString()}`,
                    tuitionPrice: `KES ${finalPrice.toLocaleString()}`,
                    couponCode: couponCode || "None",
                    transactionReference: mpesaRef || "(Receipt code sent to applicant via SMS)",
                    checkoutRequestId: checkoutRequestId,
                    paymentStatus: "Completed",
                  }),
                });
                setStep("success");
              } catch (err) {
                console.error("Web3Forms error:", err);
                setStep("success");
              } finally {
                setIsSubmitting(false);
              }
            } else if (queryRes.status === "failed") {
              clearInterval(interval);
              setStkStatus("failed");
            }
          } catch (err) {
            console.error("Error polling M-Pesa query:", err);
          }
        }, 3000);
      } else {
        setStkStatus("failed");
      }
    } catch (err: any) {
      console.error("Failed to initiate M-Pesa STK Push:", err);
      let errMsg = "Failed to trigger payment";
      if (err.context && typeof err.context.text === "function") {
        try {
          const bodyText = await err.context.text();
          console.error("M-Pesa error context body:", bodyText);
          try {
            const errObj = JSON.parse(bodyText);
            if (errObj.error) {
              try {
                const inner = JSON.parse(errObj.error);
                errMsg = inner.errorMessage || inner.ResultDesc || errObj.error;
              } catch (_) {
                errMsg = errObj.error;
              }
            } else if (errObj.errorMessage) {
              errMsg = errObj.errorMessage;
            }
          } catch (_) {
            if (bodyText) errMsg = bodyText.slice(0, 100);
          }
        } catch (_) {}
      } else if (err.message) {
        errMsg = err.message;
      }
      toast.error(`M-Pesa Error: ${errMsg}`);
      setStkStatus("failed");
    }
  };

  const handleRequestInvoice = async () => {
    if (paymentAmount < minDeposit) return;
    setIsSubmitting(true);
    setSubmitStatus(null);

    const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || "";

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: accessKey || "YOUR_WEB3FORMS_ACCESS_KEY_HERE",
          subject: `Invoice Request & Application - ${selectedProgramme}`,
          from_name: "Staken Hub Admissions Alert",
          ...applicationData,
          paymentMethod: "PayPal / Visa Card (Invoice Request)",
          amountRequested: `KES ${paymentAmount.toLocaleString()}`,
          tuitionPrice: `KES ${finalPrice.toLocaleString()}`,
          couponCode: couponCode || "None",
          paymentStatus: "Pending Invoice",
        }),
      });

      const result = await response.json();
      if (result.success) {
        // Insert application data to Supabase
        try {
          await supabase.from("applications").insert({
            first_name: applicationData.firstName,
            last_name: applicationData.lastName,
            email: applicationData.email,
            phone: applicationData.phone,
            programme: selectedProgramme,
            mode: applicationData.mode || "Online",
            goals: applicationData.goals,
            coupon_code: couponCode || null,
            child_name: null,
            child_age: null,
            payment_method: "PayPal / Visa Card (Invoice Request)",
            amount_paid: `KES ${paymentAmount.toLocaleString()}`,
            payment_status: "Pending Invoice",
          });
        } catch (dbErr) {
          console.error("Supabase insert error:", dbErr);
        }
        setStep("success");
      } else {
        console.error("Web3Forms error:", result);
        setSubmitStatus("error");
      }
    } catch (err) {
      console.error("Web3Forms error:", err);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAmountValid = paymentAmount >= minDeposit;

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Apply Now"
        title={
          step === "form"
            ? "Start your tech journey"
            : step === "payment"
              ? "Complete Payout"
              : "Application Successful!"
        }
        subtitle={
          step === "form"
            ? "Tell us a little about yourself and the programme you want to join."
            : step === "payment"
              ? "Choose your payment mode to finish registering for your programme."
              : "Credentials and onboarding details are on their way."
        }
      />
      <section className="py-16 md:py-20 bg-background">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {step === "success" ? (
            <div className="bg-card border border-mint/30 rounded-2xl p-8 lg:p-12 text-center space-y-6 shadow-elegant animate-fade-in max-w-2xl mx-auto">
              <div className="size-16 bg-mint/15 text-primary rounded-full grid place-items-center mx-auto">
                <CheckCircle2 className="size-8" />
              </div>
              <div className="space-y-3">
                {paymentType === "paypal" ? (
                  <>
                    <h3 className="font-display font-bold text-2xl sm:text-3xl text-primary">
                      Invoice on its way!
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      An invoice has been sent to your email address. Please complete the payment via <span className="font-semibold text-primary">PayPal or Visa / MasterCard</span> using the link in the email.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Once your payment is confirmed, you'll receive your portal login credentials to access your{" "}
                      <a
                        href="https://academy.stakenhub.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-primary hover:underline"
                      >
                        academy portal
                      </a>
                      . Our admissions team at <span className="font-semibold text-primary">admissions@stakenhub.com</span> is available if you need any help.
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="font-display font-bold text-2xl sm:text-3xl text-primary">
                      Check your email!
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Your credentials and portal login instructions will be sent to your email address shortly so you can log into your{" "}
                      <a
                        href="https://academy.stakenhub.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-primary hover:underline"
                      >
                        academy portal
                      </a>
                      . Our admissions team at <span className="font-semibold text-primary">admissions@stakenhub.com</span> will also reach out to help you finish your onboarding.
                    </p>
                    {lastMpesaReceipt && (
                      <div className="pt-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-mint/15 text-primary text-xs font-bold border border-mint/20">
                          M-Pesa Receipt Code: <code className="font-mono text-xs">{lastMpesaReceipt}</code>
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="pt-4">
                <Link
                  to="/"
                  className="inline-flex items-center justify-center bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-teal-deep transition-colors shadow-elegant"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          ) : step === "payment" ? (
            <div className="space-y-6 animate-fade-in">
              {/* Payment details summary */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-soft flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <button
                    onClick={() => setStep("form")}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary mb-2 transition-colors"
                  >
                    <ArrowLeft className="size-3.5" /> Back to Application Form
                  </button>
                  <h3 className="text-xl font-bold text-primary">{selectedProgramme}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Student: <span className="font-semibold text-primary">{applicationData?.firstName} {applicationData?.lastName}</span> ({applicationData?.email})
                  </p>
                  {hasCoupon === "yes" && couponDiscount > 0 && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-mint/15 text-primary text-[11px] font-bold border border-mint/20">
                      <CheckCircle2 className="size-3.5" />
                      <span>Coupon Applied: {couponCode} (-KES {couponDiscount.toLocaleString()})</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 shrink-0">
                  {hasCoupon === "yes" && couponDiscount > 0 && (
                    <div className="bg-muted border border-border rounded-xl px-4 py-3 text-right">
                      <p className="text-xs text-muted-foreground">Original Fee</p>
                      <p className="text-sm font-bold text-muted-foreground line-through">KES {priceNumber.toLocaleString()}</p>
                    </div>
                  )}
                  <div className="bg-primary-soft/30 border border-primary/10 rounded-xl px-4 py-3 text-right">
                    <p className="text-xs text-muted-foreground">Tuition Fee</p>
                    <p className="text-xl font-bold text-primary">KES {finalPrice.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Installment selection & Math */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-soft space-y-4">
                <h4 className="font-bold text-primary flex items-center gap-2 text-[15px]">
                  <Info className="size-4 text-mint" /> Choose Payment Option
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Students are allowed to pay 50% deposit of the programme price to start their coursework, or fully (100%). Payments less than 50% are not accepted.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setAmountOption("100")}
                    className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
                      amountOption === "100"
                        ? "border-mint bg-primary-soft/30 ring-2 ring-mint/20"
                        : "border-border hover:border-mint/50"
                    }`}
                  >
                    <span className="text-xs font-bold text-muted-foreground">Pay Full (100%)</span>
                    <span className="text-lg font-extrabold text-primary mt-1">KES {finalPrice.toLocaleString()}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmountOption("50")}
                    className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
                      amountOption === "50"
                        ? "border-mint bg-primary-soft/30 ring-2 ring-mint/20"
                        : "border-border hover:border-mint/50"
                    }`}
                  >
                    <span className="text-xs font-bold text-muted-foreground">Pay Deposit (50%)</span>
                    <span className="text-lg font-extrabold text-primary mt-1">KES {minDeposit.toLocaleString()}</span>
                  </button>
                  <div
                    className={`flex flex-col p-3.5 rounded-xl border transition-all ${
                      amountOption === "custom"
                        ? "border-mint bg-primary-soft/30 ring-2 ring-mint/20"
                        : "border-border"
                    }`}
                  >
                    <label
                      onClick={() => setAmountOption("custom")}
                      className="text-xs font-bold text-muted-foreground cursor-pointer block"
                    >
                      Custom Amount
                    </label>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-xs font-bold text-muted-foreground">KES</span>
                      <input
                        type="number"
                        placeholder="e.g. 8000"
                        value={customAmount}
                        disabled={isSubmitting}
                        onChange={(e) => {
                          setAmountOption("custom");
                          setCustomAmount(e.target.value);
                        }}
                        className="w-full bg-transparent border-b border-border text-sm font-bold text-primary focus:outline-none focus:border-mint py-0.5"
                      />
                    </div>
                  </div>
                </div>

                {!isAmountValid && (
                  <div className="flex items-center gap-2 p-3.5 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 text-xs font-semibold animate-fade-in">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>
                      The minimum payment required is KES {minDeposit.toLocaleString()} (50% of tuition). Payout cannot proceed below this amount.
                    </span>
                  </div>
                )}
              </div>

              {/* Checkout alternating tabs */}
              <div className="bg-card border border-border rounded-2xl shadow-soft overflow-hidden">
                <div className="grid grid-cols-2 border-b border-border bg-primary-soft/30">
                  <button
                    type="button"
                    onClick={() => setPaymentType("mpesa")}
                    disabled={isSubmitting}
                    className={`py-4 text-center font-bold text-sm flex items-center justify-center gap-2 border-r border-border transition-colors ${
                      paymentType === "mpesa"
                        ? "bg-card text-primary border-b-2 border-b-mint"
                        : "text-muted-foreground hover:text-primary hover:bg-card/40"
                    }`}
                  >
                    <Smartphone className="size-4 text-mint" /> M-Pesa STK Push
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentType("paypal")}
                    disabled={isSubmitting}
                    className={`py-4 text-center font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                      paymentType === "paypal"
                        ? "bg-card text-primary border-b-2 border-b-mint"
                        : "text-muted-foreground hover:text-primary hover:bg-card/40"
                    }`}
                  >
                    <CreditCard className="size-4 text-primary" /> PayPal / Visa Card
                  </button>
                </div>

                <div className="p-6 lg:p-8">
                  {paymentType === "mpesa" ? (
                    <div className="space-y-6 animate-fade-in">
                      <div className="flex gap-4 items-start">
                        <div className="size-10 rounded-xl bg-mint/10 text-mint grid place-items-center shrink-0">
                          <Smartphone className="size-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-primary text-[15px]">M-Pesa Auto Pay</h4>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                            Enter your M-Pesa registered phone number below. A secure STK Push prompt will be sent to your phone asking you to enter your PIN to authorize payment to **Kensab Collection**.
                          </p>
                        </div>
                      </div>

                      <div className="max-w-md space-y-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                            M-Pesa Phone Number
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="e.g. 0712345678"
                            disabled={isSubmitting || stkStatus !== "idle"}
                            value={mpesaPhone}
                            onChange={(e) => setMpesaPhone(e.target.value)}
                            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-mint focus:ring-2 focus:ring-mint/30 disabled:opacity-50"
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs border border-dashed border-border rounded-xl p-3 bg-primary-soft/10">
                          <span className="text-muted-foreground">Account Payee</span>
                          <span className="font-bold text-primary">Kensab Collection</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border flex items-center justify-between gap-4 flex-wrap">
                        <div className="text-sm">
                          <span className="text-muted-foreground block text-xs">Checkout Amount</span>
                          <span className="font-extrabold text-primary text-lg">
                            KES {paymentAmount.toLocaleString()}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleMpesaCheckout}
                          disabled={isSubmitting || !isAmountValid || !mpesaPhone}
                          className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3.5 rounded-xl font-semibold hover:bg-teal-deep transition-colors shadow-elegant disabled:opacity-50"
                        >
                          <Lock className="size-4 text-mint" /> Pay via M-Pesa STK
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 animate-fade-in">
                      <div className="flex gap-4 items-start">
                        <div className="size-10 rounded-xl bg-primary-soft text-primary grid place-items-center shrink-0">
                          <CreditCard className="size-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-primary text-[15px]">PayPal & Visa / MasterCard Invoice</h4>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                            Request a custom secure invoice to pay through PayPal or debit/credit card. Once requested, our admissions desk will immediately email you a checkout link matching your payment choice of KES {paymentAmount.toLocaleString()}.
                          </p>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-primary-soft/20 border border-primary/10 text-xs leading-relaxed text-muted-foreground">
                        <p className="font-semibold text-primary mb-1">Invoice Request Info</p>
                        Our invoice system will capture the selected course (<span className="font-semibold text-primary">{selectedProgramme}</span>), student details, and goals to build your personalized invoice. You will receive credentials for the study portal immediately after payment is verified.
                      </div>

                      <div className="pt-4 border-t border-border flex items-center justify-between gap-4 flex-wrap">
                        <div className="text-sm">
                          <span className="text-muted-foreground block text-xs">Invoice Total</span>
                          <span className="font-extrabold text-primary text-lg">
                            KES {paymentAmount.toLocaleString()}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRequestInvoice}
                          disabled={isSubmitting || !isAmountValid}
                          className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3.5 rounded-xl font-semibold hover:bg-teal-deep transition-colors shadow-elegant disabled:opacity-50"
                        >
                          Request an Invoice
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* M-Pesa STK Simulator Modal */}
              {stkStatus !== "idle" && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-card border border-border rounded-2xl p-6 lg:p-8 max-w-md w-full shadow-elegant space-y-6 animate-scale-in text-center">
                    {stkStatus === "initiating" ? (
                      <>
                        <Loader2 className="size-12 animate-spin text-mint mx-auto" />
                        <div className="space-y-2">
                          <h4 className="font-bold text-primary text-lg">Initiating M-Pesa STK Push</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Connecting with Safaricom and sending prompt to M-Pesa number <span className="font-semibold text-primary">{mpesaPhone}</span>...
                          </p>
                        </div>
                      </>
                    ) : stkStatus === "prompted" ? (
                      <>
                        <div className="relative size-16 mx-auto bg-primary-soft/60 rounded-full flex items-center justify-center">
                          <Smartphone className="size-8 text-primary animate-pulse" />
                          <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-mint"></span>
                          </span>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-bold text-primary text-lg">Enter M-Pesa PIN</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            An STK Push has been sent to your phone. Please check your screen, enter your M-Pesa PIN to pay <span className="font-bold text-primary">KES {paymentAmount.toLocaleString()}</span> to <span className="font-semibold text-primary">Kensab Collection</span>, and wait.
                          </p>
                        </div>
                        <div className="flex justify-center gap-1 text-[11px] font-semibold text-muted-foreground bg-primary-soft/30 p-2.5 rounded-lg max-w-[200px] mx-auto">
                          <Lock className="size-3.5 text-mint mt-0.5" />
                          <span>M-Pesa Auto Pay Security</span>
                        </div>
                      </>
                    ) : stkStatus === "success" ? (
                      <>
                        <div className="size-12 rounded-full bg-mint/15 text-primary grid place-items-center mx-auto">
                          <Check className="size-6" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-primary text-lg">Payment Confirmed!</h4>
                          <p className="text-xs text-muted-foreground">
                            Transaction reference generated. Registering your student application...
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="size-12 rounded-full bg-destructive/15 text-destructive grid place-items-center mx-auto">
                          <ArrowLeft className="size-6" />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-bold text-primary text-lg">Transaction Failed</h4>
                          <p className="text-xs text-muted-foreground">
                            Transaction failed, application could not be completed. Please verify your phone number and PIN and try again.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setStkStatus("idle")}
                          className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-xs hover:bg-teal-deep transition-colors"
                        >
                          Try Again
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form
              onSubmit={handleFormSubmit}
              className="bg-card border border-border rounded-2xl p-7 lg:p-9 space-y-5 shadow-soft"
            >
              {submitStatus === "error" && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 text-sm">
                  <AlertCircle className="size-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Submission failed</p>
                    <p className="mt-0.5 opacity-90">
                      There was a problem sending your application. Please check your internet connection and verify that the Web3Forms Access Key is set.
                    </p>
                  </div>
                </div>
              )}
              <div className="grid sm:grid-cols-2 gap-5">
                <Input name="firstName" label="First name" disabled={isSubmitting} />
                <Input name="lastName" label="Last name" disabled={isSubmitting} />
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <Input name="email" type="email" label="Email" disabled={isSubmitting} />
                <Input name="phone" type="tel" label="Phone" disabled={isSubmitting} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">Registration Category</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm mb-4">
                  {[
                    { label: "Programmes", value: "programme" },
                    { label: "Bootcamps", value: "bootcamp" },
                    { label: "Corporate Training", value: "corp" },
                  ].map((cat) => (
                    <label
                      key={cat.value}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer hover:border-mint hover:bg-primary-soft/40 font-semibold transition-all ${
                        applyCategory === cat.value
                          ? "border-mint bg-primary-soft/40 ring-1 ring-mint text-primary"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      <input
                        type="radio"
                        name="applyCategory"
                        value={cat.value}
                        checked={applyCategory === cat.value}
                        onChange={() => {
                          const val = cat.value as any;
                          setApplyCategory(val);
                          // Auto select first item of the new category
                          if (val === "programme" && dbProgrammes.length > 0) {
                            setSelectedProgramme(dbProgrammes[0].title);
                          } else if (val === "bootcamp" && dbBootcamps.length > 0) {
                            setSelectedProgramme(dbBootcamps[0].title);
                          } else if (val === "corp" && dbCorpServices.length > 0) {
                            setSelectedProgramme(dbCorpServices[0].title);
                          }
                        }}
                        className="accent-primary"
                      />
                      {cat.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  {applyCategory === "programme"
                    ? "Select Programme"
                    : applyCategory === "bootcamp"
                      ? "Select Bootcamp"
                      : "Select Corporate Training"}
                </label>
                <select
                  name="programme"
                  value={selectedProgramme}
                  onChange={(e) => {
                    setSelectedProgramme(e.target.value);
                  }}
                  disabled={isSubmitting || loadingProgrammes || loadingBootcamps || loadingCorpServices}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-mint focus:ring-2 focus:ring-mint/30 disabled:opacity-50 font-semibold text-primary"
                >
                  {loadingProgrammes || loadingBootcamps || loadingCorpServices ? (
                    <option value="">Loading courses...</option>
                  ) : (
                    <>
                      {applyCategory === "programme" && (
                        <>
                          {dbProgrammes.map((p: any) => (
                            <option key={p.id} value={p.title}>
                              {p.title}
                            </option>
                          ))}
                          {COHORTS.map((c) => (
                            <option key={c.programme} value={c.programme}>
                              {c.programme}
                            </option>
                          ))}
                        </>
                      )}
                      {applyCategory === "bootcamp" && (
                        <>
                          {dbBootcamps.map((b: any) => (
                            <option key={b.id} value={b.title}>
                              {b.title}
                            </option>
                          ))}
                        </>
                      )}
                      {applyCategory === "corp" && (
                        <>
                          {dbCorpServices.map((c: any) => (
                            <option key={c.id} value={c.title}>
                              {c.title}
                            </option>
                          ))}
                        </>
                      )}
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary mb-2">Preferred learning mode</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                  {["Online", "Hybrid", "Bootcamp"].map((m) => (
                    <label key={m} className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border cursor-pointer hover:border-mint hover:bg-primary-soft/40 font-semibold text-primary">
                      <input type="radio" name="mode" value={m} defaultChecked={m === "Online"} disabled={isSubmitting} className="accent-primary" />
                      {m}
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">Applying with a coupon code?</label>
                <div className="grid grid-cols-2 gap-3 text-sm max-w-xs">
                  {[
                    { label: "No", value: "no" },
                    { label: "Yes", value: "yes" },
                  ].map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border cursor-pointer hover:border-mint hover:bg-primary-soft/40 font-semibold text-primary">
                      <input
                        type="radio"
                        name="hasCoupon"
                        value={opt.value}
                        checked={hasCoupon === opt.value}
                        onChange={() => {
                          setHasCoupon(opt.value as "yes" | "no");
                          setCouponError(null);
                        }}
                        className="accent-primary"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              {hasCoupon === "yes" && (
                <div className="animate-fade-in space-y-2">
                  <div className="relative">
                    <Input
                      name="couponCode"
                      label="Coupon Code"
                      placeholder="Enter your coupon code"
                      disabled={isSubmitting || isValidatingCoupon}
                      required={true}
                      value={couponCode}
                      onChange={(e: any) => {
                        setCouponCode(e.target.value);
                        setCouponError(null);
                        setCouponSuccess(null);
                      }}
                    />
                    {isValidatingCoupon && (
                      <div className="absolute right-3 bottom-3 text-muted-foreground flex items-center gap-1.5 text-xs">
                        <Loader2 className="size-3.5 animate-spin" />
                        <span>Validating...</span>
                      </div>
                    )}
                  </div>
                  {couponError && (
                    <p className="text-destructive text-xs font-semibold flex items-center gap-1.5 mt-1.5 animate-fade-in">
                      <AlertCircle className="size-4 shrink-0" />
                      {couponError}
                    </p>
                  )}
                  {couponSuccess && (
                    <p className="text-mint text-xs font-semibold flex items-center gap-1.5 mt-1.5 animate-fade-in">
                      <CheckCircle2 className="size-4 shrink-0" />
                      {couponSuccess}
                    </p>
                  )}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">Tell us about your goals</label>
                <textarea
                  name="goals"
                  rows={4}
                  maxLength={1500}
                  disabled={isSubmitting}
                  required
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-mint focus:ring-2 focus:ring-mint/30 disabled:opacity-50 font-medium text-primary"
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting || (hasCoupon === "yes" && (!couponCode.trim() || !!couponError || isValidatingCoupon))}
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-xl font-semibold hover:bg-teal-deep transition-colors shadow-elegant disabled:opacity-75 min-w-[200px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" /> Submit Application
                  </>
                )}
              </button>
              
              <p className="text-xs text-muted-foreground">
                Prefer to talk first? <Link to="/contact" className="text-primary font-semibold hover:underline">Contact admissions</Link>.
              </p>
            </form>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

function Input({
  name,
  label,
  type = "text",
  disabled,
  required = true,
  placeholder,
  ...props
}: {
  name: string;
  label: string;
  type?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  [key: string]: any;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-semibold text-primary mb-2">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        maxLength={255}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-mint focus:ring-2 focus:ring-mint/30 disabled:opacity-50 font-medium text-primary"
        {...props}
      />
    </div>
  );
}
