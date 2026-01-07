import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { 
  FiMessageSquare, 
  FiHelpCircle, 
  FiFileText, 
  FiSearch,
  FiMail,
  FiMessageCircle,
  FiClock,
  FiCheckCircle
} from "react-icons/fi";

const Support = () => {
  const faqs = [
    {
      question: "How do I remove a background?",
      answer: "Simply upload your image in the dashboard, our AI will automatically detect and remove the background. You can then download the result."
    },
    {
      question: "What image formats are supported?",
      answer: "We support JPG, PNG, WebP, and most common image formats up to 25MB in size."
    },
    {
      question: "Is there a limit to how many images I can process?",
      answer: "No, Removeio is completely free with unlimited image processing. No watermarks, no signup required."
    },
    {
      question: "How long does processing take?",
      answer: "Most images are processed in 2-5 seconds. Larger or more complex images may take slightly longer."
    },
    {
      question: "Are my images secure?",
      answer: "Yes! Images are automatically deleted from our servers after processing. We never store or share your images."
    },
    {
      question: "Can I process multiple images at once?",
      answer: "Currently, we support single image processing. Batch processing is coming in a future update!"
    }
  ];

  return (
    <>
      <Helmet>
        <title>Support & Help Center | Removerio AI Background Remover</title>
        <meta name="description" content="Get help with Removerio. FAQs, guides, and support for our free AI background removal tool." />
        <link rel="canonical" href="https://removerio.bond/support" />
      </Helmet>

      <div className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
              <FiHelpCircle className="text-blue-400" />
              <span className="text-blue-400 text-sm font-medium">Support Center</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How can we <span className="text-[#7c3aed]">help you?</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Find answers to common questions or get in touch with our support team.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <Link 
              to="/contact" 
              className="card hover:border-[#7c3aed]/50 hover:scale-[1.02] transition-all duration-300 text-center p-6"
            >
              <FiMessageSquare className="text-3xl text-[#7c3aed] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Contact Support</h3>
              <p className="text-gray-400">Get personalized help from our team</p>
            </Link>

            <div className="card hover:border-blue-500/50 hover:scale-[1.02] transition-all duration-300 text-center p-6">
              <FiFileText className="text-3xl text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Guides & Tutorials</h3>
              <p className="text-gray-400">Step-by-step guides for best results</p>
            </div>

            <div className="card hover:border-green-500/50 hover:scale-[1.02] transition-all duration-300 text-center p-6">
              <FiCheckCircle className="text-3xl text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Status</h3>
              <p className="text-gray-400">All systems operational</p>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
              <FiHelpCircle className="mr-3 text-[#7c3aed]" />
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="card hover:border-dark-border">
                  <details className="group">
                    <summary className="flex justify-between items-center cursor-pointer list-none p-6">
                      <span className="text-lg font-medium text-white">{faq.question}</span>
                      <span className="text-[#7c3aed] text-2xl group-open:rotate-180 transition-transform">+</span>
                    </summary>
                    <div className="px-6 pb-6">
                      <p className="text-gray-300">{faq.answer}</p>
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </div>

          {/* Still Need Help */}
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/30 rounded-2xl p-8 text-center">
            <FiMessageCircle className="text-4xl text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Still need help?</h2>
            <p className="text-gray-300 mb-6">
              Can't find what you're looking for? Our support team is here to help you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Contact Support
              </Link>
              <Link
                to="/dashboard"
                className="px-6 py-3 bg-dark-card border border-dark-border rounded-lg font-medium hover:border-[#7c3aed]/50 transition-colors"
              >
                Try Removerio Now
              </Link>
            </div>
            <div className="mt-6 flex items-center justify-center gap-2 text-gray-400">
              <FiClock />
              <span>Average response time: 24 hours</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Support;