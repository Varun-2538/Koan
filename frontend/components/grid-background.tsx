export function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Dot Grid Pattern */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Dark Blue Glow Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-black to-purple-900/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-blue-950/20 to-black" />

      {/* Animated Blue Glow Orbs */}
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Additional subtle blue glow */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-radial from-blue-900/10 via-transparent to-transparent" />
    </div>
  )
} 