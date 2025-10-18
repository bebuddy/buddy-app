
export default function LoadingSpinner({ height, color }: { height?: number; color?: 'primary' | 'secondary' }) {
    return (
        <div className={`${height ? `h-[${height}px]` : 'h-[400px]'} flex items-center justify-center bg-white/60 z-50`}>
            <div className={`w-12 h-12 border-4 border-gray-300 ${color==='primary'? 'border-t-primary-500':'border-t-[#6163FF]'} rounded-full animate-spin`}></div>
        </div>
    )
}