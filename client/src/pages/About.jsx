import React from 'react';
import { Link } from 'react-router-dom';
import { FiTarget, FiEye, FiAward, FiUsers } from 'react-icons/fi';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About Campus Cloud
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Transforming education through innovative assessment technology
            </p>
          </div>
        </div>
      </div>

      {/* Mission & Vision Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-purple-600 mb-4">
              <FiTarget className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Our Mission</h2>
            <p className="text-gray-600 mb-4">
              At Campus Cloud, our mission is to empower educational institutions with powerful, user-friendly tools that enhance the learning experience. We believe that assessment should be more than just testing—it should be a valuable part of the educational journey.
            </p>
            <p className="text-gray-600">
              We're committed to creating technology that helps educators teach more effectively and enables students to learn more deeply, all while providing administrators with the insights they need to improve educational outcomes.
            </p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-purple-600 mb-4">
              <FiEye className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Our Vision</h2>
            <p className="text-gray-600 mb-4">
              We envision a future where technology seamlessly integrates with education, making learning more accessible, engaging, and effective for everyone. Campus Cloud aims to be at the forefront of this transformation, continuously innovating to meet the evolving needs of educational institutions worldwide.
            </p>
            <p className="text-gray-600">
              Our goal is to become the leading platform for educational assessment and management, trusted by institutions of all sizes for its reliability, security, and positive impact on learning outcomes.
            </p>
          </div>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Our Story
          </h2>
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-lg">
              <p>
                Campus Cloud was founded in 2020 by a team of educators and technologists who recognized the need for better assessment tools in education. What began as a simple quiz platform has evolved into a comprehensive learning management system used by educational institutions around the world.
              </p>
              <p>
                Our journey started when we observed the challenges faced by educators in creating, administering, and grading assessments. Traditional methods were time-consuming and often failed to provide meaningful insights into student learning. We set out to build a solution that would not only streamline these processes but also enhance the educational experience for both teachers and students.
              </p>
              <p>
                Over the years, we've worked closely with educators, students, and administrators to refine our platform, adding features and capabilities based on real-world feedback and needs. Today, Campus Cloud is a robust, user-friendly system that supports diverse educational approaches and helps institutions achieve their academic goals.
              </p>
              <p>
                As we continue to grow, we remain committed to our founding principles: innovation, accessibility, and a deep respect for the educational process. We're proud of how far we've come, but we're even more excited about the future and the positive impact we can continue to make in education.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Our Values Section */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-purple-600 mb-4">
                <FiUsers className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Collaboration</h3>
              <p className="text-gray-600">
                We believe in the power of working together—both within our team and with the educators and institutions we serve.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-purple-600 mb-4">
                <FiAward className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Excellence</h3>
              <p className="text-gray-600">
                We strive for excellence in everything we do, from the code we write to the support we provide to our users.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-purple-600 mb-4">
                <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Innovation</h3>
              <p className="text-gray-600">
                We're constantly exploring new ideas and technologies to improve our platform and better serve the educational community.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-purple-600 mb-4">
                <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Security</h3>
              <p className="text-gray-600">
                We prioritize the security and privacy of our users' data, implementing robust measures to protect sensitive information.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg shadow-md text-center">
              <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold mb-1 text-gray-800">Dr. Emily Chen</h3>
              <p className="text-purple-600 mb-3">Co-Founder & CEO</p>
              <p className="text-gray-600">
                Former professor with a passion for educational technology and improving learning outcomes.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-md text-center">
              <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold mb-1 text-gray-800">Michael Rodriguez</h3>
              <p className="text-purple-600 mb-3">Co-Founder & CTO</p>
              <p className="text-gray-600">
                Software engineer with extensive experience in building scalable educational platforms.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-md text-center">
              <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold mb-1 text-gray-800">Sarah Johnson</h3>
              <p className="text-purple-600 mb-3">Head of Product</p>
              <p className="text-gray-600">
                Former teacher who brings classroom insights to product development and user experience.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Join the Campus Cloud Community
            </h2>
            <p className="text-xl mb-8">
              Experience the difference our platform can make for your institution
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/register"
                className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 rounded-md font-medium text-lg transition duration-300"
              >
                Get Started
              </Link>
              <Link
                to="/contact"
                className="bg-transparent border-2 border-white hover:bg-white hover:text-purple-600 px-8 py-3 rounded-md font-medium text-lg transition duration-300"
              >
                Contact Us
              </Link>
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
              <Link to="/contact" className="hover:text-purple-400 transition duration-300">
                Contact
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

export default About;