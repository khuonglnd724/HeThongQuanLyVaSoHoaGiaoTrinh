import React from 'react'
import { Search as SearchIcon } from 'lucide-react'

export const SearchBar = ({ value, onChange, onSearch, placeholder = 'Tìm kiếm môn học, mã môn...' }) => {
  return (
    <div className="w-full">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onSearch?.()}
          placeholder={placeholder}
          className="input-base pl-10 text-lg"
        />
        <SearchIcon className="absolute left-3 top-3 text-gray-400" size={20} />
      </div>
    </div>
  )
}

export default SearchBar
