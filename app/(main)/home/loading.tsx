export default function HomeLoading() {
  return (
    <div className="flex flex-col px-5 py-6 gap-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="w-20 h-3 rounded-full bg-[#F2F2F7]" />
          <div className="w-28 h-5 rounded-full bg-[#F2F2F7]" />
        </div>
        <div className="w-10 h-10 rounded-full bg-[#F2F2F7]" />
      </div>
      <div className="h-40 rounded-3xl bg-[#FFE8F0]/60" />
      <div className="bg-white rounded-3xl p-5 border border-[#F2F2F7] flex flex-col gap-3">
        <div className="w-24 h-4 rounded-full bg-[#F2F2F7]" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-[#F2F2F7] last:border-0">
            <div className="flex flex-col gap-1.5">
              <div className="w-32 h-4 rounded-full bg-[#F2F2F7]" />
              <div className="w-20 h-3 rounded-full bg-[#F2F2F7]" />
            </div>
            <div className="w-6 h-6 rounded-full bg-[#F2F2F7]" />
          </div>
        ))}
      </div>
    </div>
  )
}
