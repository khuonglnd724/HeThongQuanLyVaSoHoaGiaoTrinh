import React, { useState } from 'react'
import { Bell, BellOff } from 'lucide-react'

export default function SubscribeButton({ 
  syllabusId, 
  isSubscribed = false, 
  onSubscribe, 
  onUnsubscribe,
  loading = false 
}) {
  const [subscribed, setSubscribed] = useState(isSubscribed)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    setIsLoading(true)
    try {
      if (subscribed) {
        await onUnsubscribe(syllabusId)
        setSubscribed(false)
      } else {
        await onSubscribe(syllabusId)
        setSubscribed(true)
      }
    } catch (error) {
      console.error('Lỗi:', error)
      alert('Không thể thực hiện hành động. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading || loading}
      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
        subscribed
          ? 'bg-yellow-500 text-white hover:bg-yellow-600'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {subscribed ? (
        <>
          <BellOff size={18} />
          {isLoading ? 'Đang xử lý...' : 'Bỏ theo dõi'}
        </>
      ) : (
        <>
          <Bell size={18} />
          {isLoading ? 'Đang xử lý...' : 'Theo dõi'}
        </>
      )}
    </button>
  )
}
