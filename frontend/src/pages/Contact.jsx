import { Helmet } from "react-helmet-async";
import { 
  FiMail, 
  FiAlertCircle,
  FiMessageSquare,
  FiCheckCircle,
  FiHelpCircle,
  FiClock,
  FiExternalLink
} from "react-icons/fi";

const Contact = () => {
  const contactMethods = [
    {
      icon: <FiMail className="text-[#7c3aed]" />,
      title: "Email Support",
      description: "For technical issues and account questions",
      details: "otengebenezer323@gmail.com",
      action: "otengebenezer323@gmail.com"
    },
    {
      icon: <FiHelpCircle className="text-blue-500" />,
      title: "FAQs & Documentation",
      description: "Find instant answers to common questions",
      details: "Comprehensive guides and tutorials",
      action: "/support",
      actionText: "Visit Support Center"
    }
  ];

  return (
    <>
      <Helmet>
        <title>Contact Us | Removerio AI Background Remover</title>
        <meta name="description" content="Get in touch with Removerio support team. We're here to help with any questions about our AI background removal tool." />
        <link rel="canonical" href="https://removerio.bond/contact" />
      </Helmet>

      <div className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#7c3aed]/10 border border-[#7c3aed]/20 mb-6">
              <FiMessageSquare className="text-[#7c3aed]" />
              <span className="text-[#7c3aed] text-sm font-medium">Contact & Support</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How to <span className="text-[#7c3aed]">reach us</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Choose the best way to contact us based on your needs. We're here to help you get the most out of Removerio.
            </p>
          </div>

          {/* Contact Methods Grid */}
          <div className="grid grid-col-2 md:grid-cols-2 gap-6 mb-12">
            {contactMethods.map((method, index) => (
              <div key={index} className="card hover:border-[#7c3aed]/50 hover:scale-[1.02] transition-all duration-300 p-6">
                <div className="flex flex-col h-full">
                  <div className="mb-4">
                    <div className="text-3xl mb-3">{method.icon}</div>
                    <h3 className="text-xl font-bold text-white mb-2">{method.title}</h3>
                    <p className="text-gray-300 text-sm mb-3">{method.description}</p>
                    <p className="text-gray-400 text-sm">{method.details}</p>
                  </div>
                  <div className="mt-auto">
                    <a
                      href={method.action}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[#7c3aed] hover:text-[#8b5cf6] transition-colors font-medium"
                    >
                      {method.actionText}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Support Information */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Contact Details */}
            <div className="space-y-8">
              {/* Primary Contact Info */}
              <div className="card p-6">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <FiMail className="mr-3 text-[#7c3aed]" />
                  Direct Contact
                </h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-white font-medium mb-2">General Support</h4>
                    <a 
                      href="mailto:support@removerio.bond" 
                      className="text-[#7c3aed] hover:text-[#8b5cf6] transition-colors break-all"
                    >
                      otengebenezer323@gmail.com
                    </a>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-2">Business Inquiries</h4>
                    <a 
                      href="mailto:business@removerio.bond" 
                      className="text-blue-400 hover:text-blue-300 transition-colors break-all"
                    >
                      otengebenezer323@gmail.com
                    </a>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-2">Bug Reports</h4>
                    <a 
                      href="mailto:bugs@removerio.bond" 
                      className="text-green-400 hover:text-green-300 transition-colors break-all"
                    >
                      otengebenezer323@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Tips & Guidelines */}
            <div className="space-y-8">
              {/* Before Contacting */}
              <div className="card p-6">
                <h3 className="text-2xl font-bold text-white mb-6">Before You Contact Us</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <FiCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-300">Check our <a href="/support" className="text-blue-400 hover:underline">FAQs page</a> for instant answers</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FiCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-300">Include screenshots for visual issues</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FiCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-300">Specify browser and device details</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FiCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-300">Provide image format and size details</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FiCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-300">Describe what you expected vs what happened</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;