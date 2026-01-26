import React, { useState } from 'react'

const LandingPage = ({ onSearchClick, onLoginClick }) => {
  const [filters, setFilters] = useState({ code: '', name: '', faculty: '', year: '' })

  const handleChange = (field, value) => setFilters((prev) => ({ ...prev, [field]: value }))

  const handleSearch = (e) => {
    e.preventDefault()
    if (onSearchClick) onSearchClick(filters)
  }

  const featureItems = [
    { title: 'Version Comparison', desc: 'Compare published syllabus versions side by side.' },
    { title: 'CLO–PLO Mapping', desc: 'Visualize course outcomes mapped to program outcomes.' },
    { title: 'Subject Relationship Tree', desc: 'See prerequisite and subsequent subject links.' }
  ]

  return (
    <div className="bg-slate-50 text-slate-900">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-14 grid gap-10 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Syllabus Management & Digitalization</p>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">
              Syllabus Management and Digitalization System (SMD)
            </h1>
            <p className="text-slate-200 leading-relaxed">
              Centralized platform for managing, reviewing, and analyzing university syllabi. Search published syllabi, explore learning outcomes, and navigate approval workflows with clarity.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSearch}
                className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-400 transition"
              >
                🔍 Search Syllabus
              </button>
              <button
                onClick={onLoginClick}
                className="inline-flex items-center gap-2 rounded-md border border-slate-500 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition"
              >
                🔐 Login
              </button>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-lg backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-4">Quick Facts</h3>
            <ul className="space-y-3 text-sm text-slate-100">
              <li>• Published syllabi accessible without login.</li>
              <li>• Draft/Review versions hidden from public.</li>
              <li>• Role-based dashboards for Admin, Academic, Lecturer, Student.</li>
              <li>• Approval workflow with audit trail.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Public Search */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold text-slate-900">Search Published Syllabus</h2>
            <p className="text-slate-600 text-sm">Search is public. Only published syllabi are shown (Draft/Review hidden).</p>
          </div>

          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Subject Code</label>
              <input
                value={filters.code}
                onChange={(e) => handleChange('code', e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. CS101"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Subject Name</label>
              <input
                value={filters.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. Data Structures"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Faculty / Major</label>
              <input
                value={filters.faculty}
                onChange={(e) => handleChange('faculty', e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. Computer Science"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Academic Year</label>
              <input
                value={filters.year}
                onChange={(e) => handleChange('year', e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. 2025"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-4 flex flex-wrap gap-3">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-500 transition"
              >
                🔍 Search Published
              </button>
              <span className="text-xs text-slate-500">Draft/Review syllabi are hidden from public search.</span>
            </div>
          </form>

          <div className="rounded-lg border border-dashed border-slate-200 p-4 bg-slate-50 text-sm text-slate-600">
            Results will list published syllabi only. Use filters above and click Search.
          </div>
        </div>
      </section>

      {/* Highlight Features */}
      <section className="bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-12 space-y-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold text-slate-900">Key Features</h2>
            <p className="text-slate-600 text-sm">Built for transparency, collaboration, and academic quality assurance.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {featureItems.map((item) => (
              <div key={item.title} className="h-full rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
