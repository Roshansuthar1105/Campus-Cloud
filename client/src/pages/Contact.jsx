import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiMessageSquare } from 'react-icons/fi';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful submission
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      setSubmitError('There was an error sending your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Contact Us
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              We'd love to hear from you. Get in touch with our team.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-purple-600 mb-4 flex justify-center">
              <FiMail className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Email Us</h3>
            <p className="text-gray-600 mb-2">
              For general inquiries:
            </p>
            <a href="mailto:info@campuscloud.com" className="text-purple-600 hover:text-purple-800">
              info@campuscloud.com
            </a>
            <p className="text-gray-600 mt-2 mb-2">
              For support:
            </p>
            <a href="mailto:support@campuscloud.com" className="text-purple-600 hover:text-purple-800">
              support@campuscloud.com
            </a>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-purple-600 mb-4 flex justify-center">
              <FiPhone className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Call Us</h3>
            <p className="text-gray-600 mb-2">
              Main Office:
            </p>
            <a href="tel:+1-555-123-4567" className="text-purple-600 hover:text-purple-800">
              +1 (555) 123-4567
            </a>
            <p className="text-gray-600 mt-2 mb-2">
              Support Hotline:
            </p>
            <a href="tel:+1-555-987-6543" className="text-purple-600 hover:text-purple-800">
              +1 (555) 987-6543
            </a>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-purple-600 mb-4 flex justify-center">
              <FiMapPin className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Visit Us</h3>
            <p className="text-gray-600">
              123 Education Lane<br />
              Suite 400<br />
              San Francisco, CA 94107<br />
              United States
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
              <FiMessageSquare className="mr-2" />
              Send Us a Message
            </h2>
            
            {submitSuccess ? (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
                <p>Thank you for your message! We'll get back to you as soon as possible.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {submitError && (
                  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                    <p>{submitError}</p>
                  </div>
                )}
                
                <div className="mb-4">
                  <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Your Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Your Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">Subject *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="message" className="block text-gray-700 font-medium mb-2">Your Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-purple-600 text-white py-2 px-4 rounded-md font-medium transition duration-300 ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-purple-700'
                  }`}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2 text-gray-800">How quickly can I expect a response?</h3>
              <p className="text-gray-600">
                We typically respond to all inquiries within 24-48 business hours. For urgent matters, please call our support hotline.
              </p>
            </div>
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Do you offer demos of the platform?</h3>
              <p className="text-gray-600">
                Yes! We offer personalized demos for educational institutions. Please contact us to schedule a demo with one of our product specialists.
              </p>
            </div>
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2 text-gray-800">What kind of support do you provide?</h3>
              <p className="text-gray-600">
                We offer comprehensive support including email, phone, and live chat. Our support team is available Monday through Friday, 9 AM to 6 PM EST.
              </p>
            </div>
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Do you offer training for new users?</h3>
              <p className="text-gray-600">
                Absolutely! We provide onboarding training for all new institutions, as well as ongoing training resources including webinars, documentation, and video tutorials.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold">Campus Cloud</h3>
              <p className="text-gray-400">© 2023 All rights reserved</p>
            </div>
            <div className="flex space-x-6">
              <Link to="/" className="hover:text-purple-400 transition duration-300">
                Home
              </Link>
              <Link to="/about" className="hover:text-purple-400 transition duration-300">
                About
              </Link>
              <Link to="/privacy" className="hover:text-purple-400 transition duration-300">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Contact;