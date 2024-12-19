export default function HeroImage() {
  return (
    <div className="relative h-full w-full bg-gradient-to-br from-blue-500 to-blue-600">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="grid grid-cols-3 gap-4 p-8">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-lg bg-white/10 p-4 flex items-center justify-center"
            >
              <div className="w-full h-full bg-white/20 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 