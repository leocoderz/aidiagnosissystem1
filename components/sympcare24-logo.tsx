import Image from "next/image"

interface SympCare24LogoProps {
  size?: number
  className?: string
  showText?: boolean
}

export default function SympCare24Logo({ size = 48, className = "", showText = false }: SympCare24LogoProps) {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="relative">
        <Image src="/sympcare24-logo.png" alt="SympCare24 Logo" width={size} height={size} className="rounded-full" />
      </div>
      {showText && (
        <div>
          <h1 className="text-xl font-bold">SympCare24</h1>
          <p className="text-sm opacity-80">24/7 Health Companion</p>
        </div>
      )}
    </div>
  )
}
