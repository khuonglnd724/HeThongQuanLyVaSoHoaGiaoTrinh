import { useState, useEffect } from 'react'
import { searchSyllabi, getSyllabusById } from '../../modules/public/services/syllabusService'
import { handleApiError } from '../utils/api-helpers'

export const useSyllabusSearch = (query, page = 0) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!query?.trim()) {
      setData(null)
      return
    }

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await searchSyllabi({ keyword: query, page, size: 10 })
        setData(response.data)
      } catch (err) {
        setError(handleApiError(err, 'Tìm kiếm thất bại'))
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(fetchData, 300) // Debounce
    return () => clearTimeout(timer)
  }, [query, page])

  return { data, loading, error }
}

export const useSyllabusDetail = (id) => {
  const [syllabus, setSyllabus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return

    const fetchDetail = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await getSyllabusById(id)
        setSyllabus(response.data)
      } catch (err) {
        setError(handleApiError(err))
      } finally {
        setLoading(false)
      }
    }

    fetchDetail()
  }, [id])

  return { syllabus, loading, error }
}

export const useSyllabusTree = (id) => {
  const [tree, setTree] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return

    const fetchTree = async () => {
      setLoading(true)
      try {
        const response = await syllabusService.getTree(id)
        setTree(response.data)
      } catch (err) {
        setError(handleApiError(err))
      } finally {
        setLoading(false)
      }
    }

    fetchTree()
  }, [id])

  return { tree, loading, error }
}

export const useSyllabusDiff = (id, targetVersion) => {
  const [diff, setDiff] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchDiff = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await syllabusService.getDiff(id, targetVersion)
      setDiff(response.data)
    } catch (err) {
      setError(handleApiError(err))
    } finally {
      setLoading(false)
    }
  }

  return { diff, loading, error, fetchDiff }
}

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (err) {
      console.error('localStorage error:', err)
    }
  }

  return [storedValue, setValue]
}
