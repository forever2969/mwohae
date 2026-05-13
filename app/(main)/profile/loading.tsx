export default function ProfileLoading() {
  return (
    <div className="flex flex-col px-5 py-8 gap-6 animate-pulse">
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="w-24 h-24 rounded-full bg-[#FFE8F0]" />
        <div className="w-32 h-6 rounded-full bg-[#F2F2F7]" />
        <div className="w-20 h-4 rounded-full bg-[#F2F2F7]" />
      </div>
      <div className="bg-white rounded-3xl border border-[#F2F2F7] overflow-hidden">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center justify-between px-5 py-4 border-b border-[#F2F2F7] last:border-0">
            <div className="w-20 h-4 rounded-full bg-[#F2F2F7]" />
            <div className="w-24 h-4 rounded-full bg-[#F2F2F7]" />
          </div>
        ))}
      </div>
      <div className="w-full h-12 rounded-2xl bg-[#F2F2F7]" />
    </div>
  )
}
