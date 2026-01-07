import { Helmet } from "react-helmet-async";
import { FiFileText, FiAlertTriangle, FiCheck, FiX, FiInfo } from "react-icons/fi";
import { Link } from "react-router-dom";

const TermsOfService = () => {
  const sections = [
    {
      title: "Acceptance of Terms",
      content: "By accessing and using Removeio, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our service."
    },
    {
      title: "Service Description",
      content: "Removeio is a free AI-powered background removal tool. We provide the service 'as is' without any warranties."
    },
    {
      title: "User Responsibilities",
      content: "You agree not to use our service for illegal purposes or to upload content that violates intellectual property rights."
    },
    {
      title: "Limitation of Liability",
      content: "Removeio is not liable for any damages resulting from the use or inability to use our service."
    },
    {
      title: "Service Modifications",
      content: "We reserve the right to modify or discontinue the service at any time without notice."
    },
    {
      title: "Intellectual Property",
      content: "You retain all rights to your uploaded images. We claim no ownership over your content."
    }
  ];

  const dosAndDonts = [
    { icon: <FiCheck className="text-green-500" />, text: "Use for personal and commercial projects" },
    { icon: <FiCheck className="text-green-500" />, text: "Process your own images or those you have rights to" },
    { icon: <FiCheck className="text-green-500" />, text: "Share processed images as needed" },
    { icon: <FiX className="text-red-500" />, text: "Upload copyrighted material without permission" },
    { icon: <FiX className="text-red-500" />, text: "Use for illegal or harmful purposes" },
    { icon: <FiX className="text-red-500" />, text: "Attempt to reverse engineer our service" }
  ];

  return (
    <>
      <Helmet>
        <title>Terms of Service | Removerio AI Background Remover</title>
        <meta name="description" content="Terms of service for using Removerio AI background removal tool." />
        <link rel="canonical" href="https://removerio.bond/terms" />
      </Helmet>

      <div className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
              <FiFileText className="text-purple-400" />
              <span className="text-purple-400 text-sm font-medium">Terms of Service</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Terms of <span className="text-purple-500">Service</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Please read these terms carefully before using Removerio.
            </p>
          </div>

          {/* Important Notice */}
          <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <FiAlertTriangle className="text-yellow-500 text-xl mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Important Notice</h3>
                <p className="text-gray-300">
                  By using Removerio, you agree to these terms. These terms may be updated periodically.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Summary */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="card p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <FiCheck className="mr-3 text-green-500" />
                What You Can Do
              </h3>
              <ul className="space-y-3">
                {dosAndDonts.slice(0, 3).map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    {item.icon}
                    <span className="text-gray-300">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <FiX className="mr-3 text-red-500" />
                What You Cannot Do
              </h3>
              <ul className="space-y-3">
                {dosAndDonts.slice(3).map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    {item.icon}
                    <span className="text-gray-300">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Terms Content */}
          <div className="card p-8">
            <div className="space-y-10">
              {sections.map((section, index) => (
                <div key={index} className="border-b border-dark-border pb-8 last:border-0 last:pb-0">
                  <h2 className="text-2xl font-bold text-white mb-4">{section.title}</h2>
                  <p className="text-gray-300 leading-relaxed">{section.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-12">
            <div className="card p-6">
              <div className="flex items-start gap-3">
                <FiInfo className="text-blue-500 text-xl mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Need More Information?</h3>
                  <p className="text-gray-300 mb-4">
                    For questions about our terms or service, please visit our support page or contact us directly.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link 
                      to="/support" 
                      className="px-4 py-2 bg-dark-card border border-dark-border rounded-lg hover:border-purple-500/50 transition-colors"
                    >
                      Support Center
                    </Link>
                    <Link 
                      to="/contact" 
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Contact Us
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Notice */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}<br />
              Continued use of Removerio constitutes acceptance of these terms.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsOfService;