export default function ActionButtons({
  onApprove,
  onReject,
  onRequestChange
}: {
  onApprove: () => void
  onReject: () => void
  onRequestChange: () => void
}) {
  return (
    <div className="flex gap-3 mt-6">
      <button
        className="px-4 py-2 bg-green-600 text-white rounded"
        onClick={onApprove}
      >
        ✔ Phê duyệt
      </button>

      <button
        className="px-4 py-2 bg-yellow-500 text-white rounded"
        onClick={onRequestChange}
      >
        ✏ Yêu cầu chỉnh sửa
      </button>

      <button
        className="px-4 py-2 bg-red-600 text-white rounded"
        onClick={onReject}
      >
        ✖ Từ chối
      </button>
    </div>
  )
}
