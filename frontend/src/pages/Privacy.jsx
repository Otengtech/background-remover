import { Helmet } from "react-helmet-async";
import { FiShield, FiLock, FiEye, FiTrash2, FiAlertCircle } from "react-icons/fi";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  const sections = [
    {
      title: "Information We Collect",
      content: "We only collect images you upload for processing. No personal information is required to use our service."
    },
    {
      title: "How We Use Your Images",
      content: "Images are processed immediately by our AI algorithms and automatically deleted from our servers after processing. We never store, share, or use your images for any other purpose."
    },
    {
      title: "No Tracking",
      content: "We don't use cookies or track your browsing activity. We don't collect analytics or personal data."
    },
    {
      title: "Third-Party Services",
      content: "We don't share any data with third parties. All processing happens on our secure servers."
    },
    {
      title: "Data Security",
      content: "We implement industry-standard security measures to protect your images during processing."
    },
    {
      title: "Children's Privacy",
      content: "Our service is not directed to children under 13. We don't knowingly collect any information from children."
    }
  ];

  return (
    <>
      <Helmet>
        <title>Privacy Policy | Removerio AI Background Remover</title>
        <meta name="description" content="Privacy policy for Removerio. Learn how we protect your images and privacy." />
        <link rel="canonical" href="https://removerio.bond/privacy" />
      </Helmet>

      <div className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
              <FiShield className="text-blue-400" />
              <span className="text-blue-400 text-sm font-medium">Privacy Policy</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Privacy <span className="text-blue-500">Policy</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              We value your privacy. Here's how we protect your data.
            </p>
          </div>

          {/* Last Updated */}
          <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-4 mb-8">
            <div className="flex items-center gap-2">
              <FiAlertCircle className="text-blue-400" />
              <span className="text-gray-300">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>

          {/* Key Privacy Points */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="card p-6 text-center">
              <FiLock className="text-3xl text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Data Stored</h3>
              <p className="text-gray-400">Images deleted automatically</p>
            </div>
            <div className="card p-6 text-center">
              <FiEye className="text-3xl text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Tracking</h3>
              <p className="text-gray-400">We don't track your activity</p>
            </div>
            <div className="card p-6 text-center">
              <FiTrash2 className="text-3xl text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Sharing</h3>
              <p className="text-gray-400">We never share your images</p>
            </div>
          </div>

          {/* Policy Content */}
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

          {/* Contact Section */}
          <div className="mt-12 text-center">
            <h3 className="text-xl font-bold text-white mb-4">Questions About Privacy?</h3>
            <p className="text-gray-300 mb-6">
              If you have any questions about our privacy practices, please contact us.
            </p>
            <Link
              to="/contact" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;