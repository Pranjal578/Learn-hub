import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { verifyCertificate } from "../services/operations/certificateAPI";
import { MdVerified, MdPrint, MdArrowBack } from "react-icons/md";

export default function CertificateView() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [certData, setCertData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchCert() {
      if (!code) return;
      setLoading(true);
      const data = await verifyCertificate(code);
      if (data) {
        setCertData(data);
      } else {
        setError(true);
      }
      setLoading(false);
    }
    fetchCert();
  }, [code]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-richblack-900 text-richblack-200">
        <div className="text-center">
          <div className="h-10 w-10 border-4 border-yellow-50 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Verifying Certificate Code...</p>
        </div>
      </div>
    );
  }

  if (error || !certData) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-richblack-900 p-6 text-center">
        <div className="max-w-md rounded-xl border border-richblack-700 bg-richblack-800 p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-pink-200 mb-2">Invalid Certificate</h2>
          <p className="text-sm text-richblack-300 mb-6">
            The certificate code <span className="font-mono text-yellow-50">{code}</span> could not be verified or does not exist.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg bg-yellow-50 px-4 py-2 text-sm font-semibold text-richblack-900 hover:bg-yellow-25"
          >
            <MdArrowBack /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const studentName = certData.student
    ? `${certData.student.firstName || ""} ${certData.student.lastName || ""}`.trim()
    : "Student";

  const instructorName = certData.instructor
    ? `${certData.instructor.firstName || ""} ${certData.instructor.lastName || ""}`.trim()
    : "Classroom Instructor";

  const titleName = certData.course?.courseName || certData.classroom?.className || "LearnHub Course / Classroom";

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] bg-richblack-900 p-4 md:p-8">
      {/* Embedded CSS rules for crisp print layout */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-certificate, #printable-certificate * {
            visibility: visible !important;
          }
          #printable-certificate {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            border: 4px solid #000 !important;
            background-color: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            padding: 2rem !important;
            border-radius: 12px !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>

      {/* Certificate Frame */}
      <div
        id="printable-certificate"
        className="relative border-8 border-yellow-50 p-6 md:p-12 rounded-2xl bg-richblack-800 text-center max-w-3xl w-full shadow-2xl overflow-hidden print:border-black print:bg-white print:text-black"
      >
        {/* Watermark / Badge */}
        <div className="absolute top-4 right-4 flex items-center gap-1 bg-yellow-50/10 text-yellow-50 px-3 py-1 rounded-full text-xs font-semibold border border-yellow-50/30 print:hidden">
          <MdVerified className="text-yellow-50 text-base" /> Verified Credentials
        </div>

        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-yellow-50 tracking-wide uppercase print:text-black">
            Certificate of Completion
          </h1>
          <p className="text-xs text-richblack-300 uppercase tracking-widest mt-1 print:text-gray-600">
            LearnHub E-Learning Platform
          </p>
        </div>

        <p className="text-sm md:text-base text-richblack-300 font-light print:text-gray-700">
          This is proudly presented to
        </p>

        <h2 className="text-3xl md:text-5xl font-black text-white my-4 underline decoration-yellow-50 decoration-4 underline-offset-8 print:text-black">
          {studentName}
        </h2>

        <p className="text-sm md:text-base text-richblack-300 max-w-xl mx-auto my-6 leading-relaxed print:text-gray-800">
          for successfully fulfilling all required coursework, assessments, and curriculum standards for
          <br />
          <span className="font-bold text-yellow-50 text-lg print:text-black">{titleName}</span>.
        </p>

        <div className="mt-10 pt-6 border-t border-richblack-700 grid grid-cols-2 gap-4 text-xs text-richblack-400 print:border-gray-300 print:text-gray-700">
          <div className="text-left">
            <p className="font-semibold text-richblack-200 print:text-black">Instructor:</p>
            <p className="text-sm font-medium text-yellow-50 print:text-black">{instructorName}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-richblack-200 print:text-black">Issued Date:</p>
            <p className="text-sm font-medium text-richblack-100 print:text-black">
              {new Date(certData.issueDate || certData.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-richblack-400 border-t border-richblack-700/50 pt-3 print:border-gray-200">
          <span>Certificate Code: <strong className="font-mono text-yellow-50 print:text-black">{certData.certificateCode}</strong></span>
          <span>Verification URL: {window.location.href}</span>
        </div>
      </div>

      {/* Print & Navigation Action Buttons */}
      <div className="mt-6 flex flex-wrap gap-4 print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 border border-richblack-600 bg-richblack-700 text-richblack-100 font-bold px-6 py-2.5 rounded-xl hover:bg-richblack-600 shadow-lg transition cursor-pointer"
        >
          <MdArrowBack size={18} /> Back
        </button>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 bg-yellow-50 text-richblack-900 font-bold px-6 py-2.5 rounded-xl hover:bg-yellow-25 shadow-lg transition cursor-pointer"
        >
          <MdPrint size={18} /> Download / Print Certificate
        </button>
      </div>
    </div>
  );
}
