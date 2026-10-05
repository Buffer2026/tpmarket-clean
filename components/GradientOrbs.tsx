export default function GradientOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute top-[-8%] left-[-8%] w-[420px] h-[420px] bg-sky/50 rounded-full blur-[110px] animate-float" />
      <div
        className="absolute top-[10%] right-[-10%] w-[380px] h-[380px] bg-purple/40 rounded-full blur-[110px] animate-float"
        style={{ animationDelay: '2s' }}
      />
      <div
        className="absolute bottom-[5%] left-[15%] w-[400px] h-[400px] bg-lemon/40 rounded-full blur-[120px] animate-float"
        style={{ animationDelay: '4s' }}
      />
      <div
        className="absolute bottom-[-10%] right-[10%] w-[340px] h-[340px] bg-sky/40 rounded-full blur-[110px] animate-float"
        style={{ animationDelay: '1s' }}
      />
    </div>
  );
}
