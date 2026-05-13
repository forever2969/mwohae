export default function HistoryLoading() {
  return (
    <div className="flex flex-col px-5 py-6 gap-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-[#F2F2F7]" />
          <div className="w-24 h-6 rounded-full bg-[#F2F2F7]" />
        </div>
        <div className="w-12 h-4 rounded-full bg-[#F2F2F7]" />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="bg-white rounded-3xl border border-[#F2F2F7] overflow-hidden">
          <div className="h-1.5 w-full bg-[#FFE8F0]" />
          <div className="px-5 pt-4 pb-5 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1.5">
                <div className="w-32 h-5 rounded-full bg-[#F2F2F7]" />
                <div className="w-24 h-3 rounded-full bg-[#F2F2F7]" />
              </div>
              <div className="w-14 h-6 rounded-full bg-[#F2F2F7]" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[0, 1, 2, 3].map((j) => (
                <div key={j} className="bg-[#F8F8F8] rounded-2xl px-3 py-2.5 flex flex-col gap-1">
                  <div className="w-8 h-2 rounded-full bg-[#F2F2F7]" />
                  <div className="w-16 h-4 rounded-full bg-[#F2F2F7]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
