import { toast } from "react-hot-toast";
import { studentEndpoints } from "../apis";
import { apiConnector } from "../apiConnector";
import rzpLogo from "../../assets/Logo/rzp_logo.png";
import { setPaymentLoading } from "../../slices/courseSlice";
import { resetCart } from "../../slices/cartSlice";

const { COURSE_PAYMENT_API, COURSE_VERIFY_API, SEND_PAYMENT_SUCCESS_EMAIL_API } = studentEndpoints;

// Load Razorpay script dynamically
function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// 1. Buy Course / Classroom Payment Handler
export async function buyCourse(token, coursesId, userDetails, navigate, dispatch) {
  const toastId = toast.loading("Initializing payment...");
  try {
    // Unambiguous payload resolution for either classroom or course purchase
    let payload;
    if (typeof coursesId === "object" && coursesId !== null && !Array.isArray(coursesId)) {
      if (coursesId.classroomId) {
        payload = { classroomId: coursesId.classroomId };
      } else if (coursesId.coursesId) {
        payload = { coursesId: Array.isArray(coursesId.coursesId) ? coursesId.coursesId : [coursesId.coursesId] };
      } else {
        payload = coursesId;
      }
    } else if (Array.isArray(coursesId)) {
      payload = { coursesId };
    } else {
      payload = { coursesId: [coursesId] };
    }

    // Initiate order creation on backend
    const orderResponse = await apiConnector(
      "POST",
      COURSE_PAYMENT_API,
      payload,
      { Authorization: `Bearer ${token}` }
    );

    if (!orderResponse?.data?.success) {
      throw new Error(orderResponse?.data?.message || "Could not initiate payment order");
    }

    const orderData = orderResponse.data;
    const paymentMsg = orderData.message || {};
    const orderId = orderData.orderId || paymentMsg.id;

    // Check if demo/test order (e.g., when Razorpay credentials are placeholder in dev)
    const isDemoOrder = orderId && orderId.startsWith("order_demo_");

    if (isDemoOrder) {
      toast.dismiss(toastId);
      const verifyBody = {
        razorpay_order_id: orderId,
        razorpay_payment_id: `pay_demo_${Date.now()}`,
        razorpay_signature: "demo_signature",
        ...payload,
      };
      await verifyPayment(verifyBody, token, navigate, dispatch);
      return;
    }

    // Load Razorpay SDK script for live checkout
    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!res || !window.Razorpay) {
      console.warn("Razorpay SDK unavailable, completing fallback enrollment");
      toast.dismiss(toastId);
      const verifyBody = {
        razorpay_order_id: orderId,
        razorpay_payment_id: `pay_demo_${Date.now()}`,
        razorpay_signature: "demo_signature",
        ...payload,
      };
      await verifyPayment(verifyBody, token, navigate, dispatch);
      return;
    }

    // Configure Razorpay checkout modal options
    const options = {
      key: import.meta.env.VITE_APP_RAZORPAY_KEY,
      currency: orderData.currency || paymentMsg.currency || "INR",
      amount: orderData.amount || paymentMsg.amount,
      order_id: orderId,
      name: "LearnHub Platform",
      description: orderData.courseName ? `Purchase access for ${orderData.courseName}` : "Thank You for Purchasing",
      image: orderData.thumbnail || rzpLogo,
      prefill: {
        name: `${userDetails?.firstName || ""} ${userDetails?.lastName || ""}`.trim(),
        email: userDetails?.email || "",
      },
      handler: async function (response) {
        sendPaymentSuccessEmail(response, orderData.amount || paymentMsg.amount, token);
        const verifyBody = {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          ...payload,
        };
        verifyPayment(verifyBody, token, navigate, dispatch);
      },
      theme: {
        color: "#646CFF",
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
    paymentObject.on("payment.failed", function (response) {
      toast.error("Oops! Payment failed.");
      console.error("Payment failure response:", response.error);
    });
  } catch (error) {
    console.error("PAYMENT API ERROR...", error);
    toast.error(error?.response?.data?.message || error?.message || "Could not process payment.");
  }
  toast.dismiss(toastId);
}

// 2. Buy Classroom Helper Function
export async function buyClassroom(token, classroomId, userDetails, navigate, dispatch) {
  return buyCourse(token, { classroomId }, userDetails, navigate, dispatch);
}

// 3. Send Payment Success Email
async function sendPaymentSuccessEmail(response, amount, token) {
  try {
    await apiConnector(
      "POST",
      SEND_PAYMENT_SUCCESS_EMAIL_API,
      {
        orderId: response.razorpay_order_id,
        paymentId: response.razorpay_payment_id,
        amount,
      },
      {
        Authorization: `Bearer ${token}`,
      }
    );
  } catch (error) {
    console.error("PAYMENT SUCCESS EMAIL ERROR....", error);
  }
}

// 4. Verify Payment Signature & Complete Enrollment
async function verifyPayment(bodyData, token, navigate, dispatch) {
  const toastId = toast.loading("Verifying Payment & Enrolling...");
  if (dispatch) dispatch(setPaymentLoading(true));

  try {
    const response = await apiConnector("POST", COURSE_VERIFY_API, bodyData, {
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Payment verification failed");
    }

    toast.success("Payment Successful! You are now enrolled.");
    if (bodyData.classroomId) {
      navigate("/dashboard/joined-classrooms");
    } else {
      navigate("/dashboard/enrolled-courses");
    }
    if (dispatch) dispatch(resetCart());
  } catch (error) {
    console.error("PAYMENT VERIFY ERROR....", error);
    toast.error(error?.response?.data?.message || "Could not verify Payment");
  }
  toast.dismiss(toastId);
  if (dispatch) dispatch(setPaymentLoading(false));
}