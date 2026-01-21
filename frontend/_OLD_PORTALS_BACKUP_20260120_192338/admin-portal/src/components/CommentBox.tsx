export default function CommentBox({
  comment,
  setComment
}: {
  comment: string
  setComment: (v: string) => void
}) {
  return (
    <div className="mt-4">
      <label className="block font-medium mb-1">
        Ý kiến nhận xét <span className="text-red-500">*</span>
      </label>
      <textarea
        className="w-full border rounded p-2"
        rows={3}
        placeholder="Nhập lý do từ chối hoặc yêu cầu chỉnh sửa..."
        value={comment}
        onChange={e => setComment(e.target.value)}
      />
    </div>
  )
}
