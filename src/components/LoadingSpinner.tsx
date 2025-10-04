
export default function LoadingSpinner({ height }: { height?: number }) {
    return (
        <div className={`${height?`h-[${height}px]`:'h-[400px]'} flex items-center justify-center bg-white/60 z-50`}>
            <div className="w-12 h-12 border-4 border-gray-300 border-t-[#6163FF] rounded-full animate-spin"></div>
        </div>
    )
}