import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createClassroom } from "../../../../services/operations/classroomAPI";
import { MdOutlineClass, MdContentCopy, MdDone } from "react-icons/md";

const DURATION_OPTIONS = ["6 months", "1 year", "Custom"];

function CreateClassroom() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.classroom);

  const [formData, setFormData] = useState({
    className: "",
    description: "",
    duration: "6 months",
    customDate: "",
  });

  const [createdClassroom, setCreatedClassroom] = useState(null);
  const [copied, setCopied] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.duration === "Custom" && !formData.customDate) {
      return;
    }
    const finalDuration =
      formData.duration === "Custom"
        ? `Until ${new Date(formData.customDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}`
        : formData.duration;

    const payload = {
      className: formData.className,
      description: formData.description,
      duration: finalDuration,
    };

    const result = await dispatch(createClassroom(payload, token, null));
    if (result) {
      setCreatedClassroom(result);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(createdClassroom.uniqueCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(createdClassroom.shareableUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // ── Success State ──
  if (createdClassroom) {
    return (
      <div className="mx-auto max-w-[650px] w-full flex flex-col items-center">
        <h1 className="mb-6 text-2xl font-bold text-richblack-5 text-center">Classroom Created! 🎉</h1>

        <div className="w-full rounded-2xl border border-richblack-700 bg-richblack-800 p-6 shadow-lg">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-600">
              <MdOutlineClass size={24} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-lg font-semibold text-richblack-5">{createdClassroom.className}</p>
              <p className="text-sm text-richblack-300">{createdClassroom.description}</p>
            </div>
          </div>

          {/* Join Code */}
          <div className="mb-4 text-left">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-richblack-400">
              Unique Join Code
            </p>
            <div className="flex items-center justify-between rounded-xl border border-richblack-600 bg-richblack-900 px-4 py-3">
              <span className="font-mono text-2xl font-bold tracking-[0.3em] text-yellow-50">
                {createdClassroom.uniqueCode}
              </span>
              <button onClick={copyCode} className="rounded-lg border border-richblack-600 p-2 text-richblack-300 hover:text-yellow-50 transition-all">
                {copied ? <MdDone size={20} className="text-green-400" /> : <MdContentCopy size={20} />}
              </button>
            </div>
          </div>

          {/* Shareable URL */}
          <div className="mb-6 text-left">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-richblack-400">
              Shareable URL
            </p>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-richblack-600 bg-richblack-900 px-4 py-3">
              <span className="truncate text-sm text-richblack-300">{createdClassroom.shareableUrl}</span>
              <button onClick={copyUrl} className="shrink-0 rounded-lg border border-richblack-600 p-2 text-richblack-300 hover:text-yellow-50 transition-all">
                {copiedUrl ? <MdDone size={18} className="text-green-400" /> : <MdContentCopy size={18} />}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => navigate(`/classroom/${createdClassroom._id}`)}
              className="rounded-lg bg-yellow-50 px-5 py-2 text-sm font-medium text-richblack-900 hover:bg-yellow-25 transition-all"
            >
              Open Classroom →
            </button>
            <button
              onClick={() => navigate("/dashboard/my-classrooms")}
              className="rounded-lg border border-richblack-600 px-5 py-2 text-sm text-richblack-300 hover:bg-richblack-700 transition-all"
            >
              My Classrooms
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form State ──
  return (
    <div className="mx-auto max-w-[650px] w-full flex flex-col items-center">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-richblack-5">Create a Classroom</h1>
        <p className="mt-1 text-sm text-richblack-300">
          A unique join code and shareable URL will be generated automatically.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full rounded-2xl border border-richblack-700 bg-richblack-800 p-6 shadow-lg text-left"
      >
        {/* Classroom Name */}
        <label className="mb-4 block">
          <p className="mb-1 text-sm text-richblack-200">
            Classroom Name <sup className="text-pink-200">*</sup>
          </p>
          <input
            required
            name="className"
            type="text"
            value={formData.className}
            onChange={handleChange}
            placeholder="e.g. Advanced React Development"
            style={{ boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)" }}
            className="w-full rounded-lg bg-richblack-700 p-3 text-sm text-richblack-5 outline-none placeholder:text-richblack-400"
          />
        </label>

        {/* Description */}
        <label className="mb-4 block">
          <p className="mb-1 text-sm text-richblack-200">
            Description <sup className="text-pink-200">*</sup>
          </p>
          <textarea
            required
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="What will students learn in this classroom?"
            style={{ boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)" }}
            className="w-full rounded-lg bg-richblack-700 p-3 text-sm text-richblack-5 outline-none placeholder:text-richblack-400"
            rows={3}
          />
        </label>

        {/* Duration */}
        <label className="mb-4 block">
          <p className="mb-1 text-sm text-richblack-200">
            Duration <sup className="text-pink-200">*</sup>
          </p>
          <select
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            className="w-full rounded-lg bg-richblack-700 p-3 text-sm text-richblack-5 outline-none"
          >
            {DURATION_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </label>

        {/* Custom Date Picker */}
        {formData.duration === "Custom" && (
          <label className="mb-6 block">
            <p className="mb-1 text-sm text-richblack-200">
              Select Custom End Date <sup className="text-pink-200">*</sup>
            </p>
            <input
              required
              type="date"
              name="customDate"
              min={new Date().toISOString().split("T")[0]}
              value={formData.customDate}
              onChange={handleChange}
              className="w-full rounded-lg bg-richblack-700 p-3 text-sm text-richblack-5 outline-none cursor-pointer"
            />
          </label>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-yellow-50 py-3 text-sm font-semibold text-richblack-900 hover:bg-yellow-25 transition-all disabled:opacity-70 mt-2"
        >
          {loading ? "Creating..." : "Create Classroom & Generate Code"}
        </button>
      </form>
    </div>
  );
}

export default CreateClassroom;
