export default function CoupleLoading() {
  return (
    <div className="flex flex-col px-6 py-8 gap-6 animate-pulse">
      <div className="flex flex-col items-center gap-3 pt-4">
        <div className="w-16 h-16 rounded-full bg-[#FFE8F0]" />
        <div className="w-32 h-5 rounded-full bg-[#F2F2F7]" />
        <div className="w-48 h-4 rounded-full bg-[#F2F2F7]" />
      </div>
      <div className="bg-white rounded-3xl p-6 border border-[#F2F2F7] flex flex-col gap-3">
        <div className="w-16 h-3 rounded-full bg-[#F2F2F7]" />
        <div className="w-36 h-8 rounded-full bg-[#F2F2F7]" />
        <div className="w-40 h-3 rounded-full bg-[#F2F2F7]" />
      </div>
      <div className="bg-white rounded-3xl p-6 border border-[#F2F2F7] flex flex-col gap-3">
        <div className="w-24 h-3 rounded-full bg-[#F2F2F7]" />
        <div className="w-full h-10 rounded-xl bg-[#F2F2F7]" />
        <div className="w-full h-12 rounded-2xl bg-[#FFE8F0]/60" />
      </div>
    </div>
  )
}
