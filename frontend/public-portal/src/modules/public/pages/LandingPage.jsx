import React, { useState } from 'react'
import { 
  Search, BookOpen, Zap, Shield, GitCompare, Network, 
  ArrowRight, ChevronRight, Star, Users, Code2, Award
} from 'lucide-react'

const LandingPage = ({ onSearchClick, onLoginClick }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFilters, setSearchFilters] = useState({
    subjectCode: '',
    subjectName: '',
    faculty: '',
    academicYear: ''
  })

  const handleSearchChange = (e) => {
    const { name, value } = e.target
    setSearchFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePublicSearch = () => {
    // Pass search filters to search page
    onSearchClick(searchFilters)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white py-24 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 opacity-10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-400 opacity-10 rounded-full blur-3xl -ml-20 -mb-20"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl">
            <h1 className="text-6xl font-bold mb-6 leading-tight">
              🎓 Syllabus Management & Digitalization System
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl leading-relaxed">
              Centralized platform for managing, reviewing, and analyzing university syllabi. 
              Empower your academic excellence with advanced tools and insights.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-8">
              <button
                onClick={onSearchClick}
                className="flex items-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition transform hover:scale-105"
              >
                <Search size={20} />
                🔍 Search Syllabus
              </button>
              <button
                onClick={onLoginClick}
                className="flex items-center gap-2 bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition border-2 border-white"
              >
                <ChevronRight size={20} />
                🔐 Login
              </button>
            </div>

            <div className="flex items-center gap-2 text-blue-100">
              <Users size={18} />
              <span>Join 500+ educators exploring advanced syllabus management</span>
            </div>
          </div>
        </div>
      </section>

      {/* Public Search Section */}
      <section className="bg-gradient-to-b from-white to-gray-50 py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
              📚 Search Published Syllabi
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Search without login. Discover course syllabi, learning outcomes, and curriculum details.
            </p>

            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject Code
                  </label>
                  <input
                    type="text"
                    name="subjectCode"
                    placeholder="e.g., CS101, MATH201"
                    value={searchFilters.subjectCode}
                    onChange={handleSearchChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject Name
                  </label>
                  <input
                    type="text"
                    name="subjectName"
                    placeholder="e.g., Introduction to Programming"
                    value={searchFilters.subjectName}
                    onChange={handleSearchChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Faculty / Major
                  </label>
                  <select
                    name="faculty"
                    value={searchFilters.faculty}
                    onChange={handleSearchChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  >
                    <option value="">-- Select Faculty --</option>
                    <option value="engineering">Engineering</option>
                    <option value="business">Business</option>
                    <option value="science">Science</option>
                    <option value="arts">Arts & Humanities</option>
                    <option value="medicine">Medicine</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Academic Year
                  </label>
                  <select
                    name="academicYear"
                    value={searchFilters.academicYear}
                    onChange={handleSearchChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  >
                    <option value="">-- Select Year --</option>
                    <option value="2025-2026">2025-2026</option>
                    <option value="2024-2025">2024-2025</option>
                    <option value="2023-2024">2023-2024</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handlePublicSearch}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <Search size={20} />
                Search Published Syllabi
              </button>

              <p className="text-xs text-gray-500 mt-4 text-center">
                ℹ️ Only published syllabi are visible. Draft and under-review syllabi are not shown.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
            ✨ Highlight Features
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Discover powerful tools to enhance your syllabus management and curriculum planning
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: GitCompare,
                title: '📊 Version Comparison',
                description: 'Compare syllabi across versions to track changes, identify improvements, and maintain consistency.',
                color: 'from-blue-500 to-blue-600'
              },
              {
                icon: Network,
                title: '🌳 CLO-PLO Mapping',
                description: 'Visualize connections between Course Learning Outcomes and Program Learning Outcomes.',
                color: 'from-green-500 to-green-600'
              },
              {
                icon: Zap,
                title: '⚡ AI Summary',
                description: 'Get intelligent summaries of complex syllabi content with AI-powered insights and analysis.',
                color: 'from-yellow-500 to-orange-500'
              },
              {
                icon: Code2,
                title: '🔗 Subject Relationship Tree',
                description: 'Visualize prerequisites, corequisites, and dependent subjects in an interactive tree format.',
                color: 'from-purple-500 to-purple-600'
              }
            ].map((feature, idx) => (
              <div 
                key={idx} 
                className="group relative bg-white rounded-xl overflow-hidden hover:shadow-2xl transition duration-300 border border-gray-200"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition`}></div>
                
                <div className="p-6 relative z-10">
                  <div className={`inline-block p-3 bg-gradient-to-br ${feature.color} rounded-lg mb-4 text-white`}>
                    <feature.icon size={24} />
                  </div>
                  
                  <h3 className="text-lg font-bold mb-3 text-gray-900">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>

                  <button className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm group/btn">
                    Learn More
                    <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* System Capabilities */}
      <section className="py-20 bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            🚀 Powerful Capabilities
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
              {
                title: '🌳 Subject Relationship Graph',
                items: [
                  '✓ Display prerequisite subjects',
                  '✓ Show dependent subjects',
                  '✓ Credit and semester information',
                  '✓ Visual interactive tree'
                ]
              },
              {
                title: '📊 Version Comparison Engine',
                items: [
                  '✓ Highlight added/modified/removed content',
                  '✓ Change statistics and percentages',
                  '✓ Side-by-side version view',
                  '✓ Detailed audit trail'
                ]
              },
              {
                title: '🎯 CLO-PLO Mapping System',
                items: [
                  '✓ Course Learning Outcomes (CLO)',
                  '✓ Program Learning Outcomes (PLO)',
                  '✓ Detailed mapping relationships',
                  '✓ Assessment method tracking'
                ]
              },
              {
                title: '📤 Export & Sharing',
                items: [
                  '✓ Export to PDF format',
                  '✓ Share syllabus links',
                  '✓ Print-friendly layouts',
                  '✓ Custom export options'
                ]
              }
            ].map((capability, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-xl p-8 border border-gray-200 hover:shadow-lg transition"
              >
                <h3 className="text-xl font-bold mb-6 text-gray-900">
                  {capability.title}
                </h3>
                
                <ul className="space-y-3">
                  {capability.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start gap-3 text-gray-700">
                      <span className="text-blue-600 font-bold mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
            👥 Access by Role
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Different access levels and features based on your role in the system
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                role: '👨‍🎓 Students',
                color: 'from-green-500 to-green-600',
                features: [
                  'Browse published syllabi',
                  'Search courses',
                  'View learning outcomes',
                  'Export syllabi as PDF',
                  'Follow updates'
                ]
              },
              {
                role: '👨‍🏫 Lecturers',
                color: 'from-blue-500 to-blue-600',
                features: [
                  'Create & edit syllabi',
                  'Upload CLO mappings',
                  'Submit for review',
                  'Track approval status',
                  'View feedback'
                ]
              },
              {
                role: '🔑 Administrators',
                color: 'from-purple-500 to-purple-600',
                features: [
                  'Manage all users',
                  'Assign roles',
                  'Monitor workflows',
                  'View analytics',
                  'System settings'
                ]
              }
            ].map((roleInfo, idx) => (
              <div 
                key={idx}
                className="relative group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${roleInfo.color} rounded-xl opacity-0 group-hover:opacity-10 transition`}></div>
                
                <div className="relative bg-white rounded-xl border-2 border-gray-200 group-hover:border-blue-300 p-8 transition">
                  <h3 className="text-xl font-bold mb-6 text-gray-900">
                    {roleInfo.role}
                  </h3>
                  
                  <ul className="space-y-3">
                    {roleInfo.features.map((feature, featureIdx) => (
                      <li key={featureIdx} className="flex items-center gap-2 text-gray-700">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${roleInfo.color}`}></div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button className="mt-6 w-full py-2 rounded-lg bg-gray-100 hover:bg-blue-50 text-gray-700 font-semibold transition">
                    Learn More →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Start exploring syllabi now or login to access your account.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={onSearchClick}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              🔍 Search Now
            </button>
            <button
              onClick={onLoginClick}
              className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition border-2 border-white"
            >
              🔐 Login to Account
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: '📚', number: '1,200+', label: 'Published Syllabi' },
              { icon: '🏫', number: '50+', label: 'Departments' },
              { icon: '👥', number: '5,000+', label: 'Active Users' },
              { icon: '🎓', number: '100%', label: 'Digital Courses' }
            ].map((stat, idx) => (
              <div key={idx}>
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold text-blue-400 mb-2">{stat.number}</div>
                <div className="text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
