import React, { useMemo, useState } from "react";
import Select from "react-select";
import countryList from "react-select-country-list";
import HCaptcha from "@hcaptcha/react-hcaptcha";

const Contact: React.FC = () => {
  const countries = useMemo(() => countryList().getData(), []);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) {
      alert("Please complete the captcha.");
      return;
    }

    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const res = await fetch(`${baseURL}/api/contact/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, captcha: captchaToken }),
    });

    if (res.ok) {
      alert("Message sent!");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        country: "",
        message: "",
      });
      setCaptchaToken(null);
    } else {
      alert("Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-10 px-4 bg-gray-50">
      <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-center">Contact Us</h2>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">First Name</label>
              <input
                className="w-full border p-2 rounded"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">Last Name</label>
              <input
                className="w-full border p-2 rounded"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              className="w-full border p-2 rounded"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium">Country (optional)</label>
            <Select
              options={countries}
              value={countries.find((c) => c.value === formData.country)}
              onChange={(val) =>
                setFormData({ ...formData, country: val?.value || "" })
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium">Message</label>
            <textarea
              className="w-full border p-2 rounded"
              rows={4}
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
            ></textarea>
          </div>

          <HCaptcha
            sitekey="10000000-ffff-ffff-ffff-000000000001" // TEST key (free)
            onVerify={(token) => setCaptchaToken(token)}
          />

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;


