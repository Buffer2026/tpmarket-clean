export default function GlowOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-lemon/20 rounded-full blur-[120px] animate-float" />
      <div
        className="absolute top-[30%] right-[-10%] w-[400px] h-[400px] bg-purple/25 rounded-full blur-[120px] animate-float"
        style={{ animationDelay: '2s' }}
      />
      <div
        className="absolute bottom-[-10%] left-[20%] w-[450px] h-[450px] bg-yellow/20 rounded-full blur-[120px] animate-float"
        style={{ animationDelay: '4s' }}
      />
    </div>
  );
}
