import { useState } from "react";
import Image from "next/image";

export default function SkeletonImage({ src, alt, className }:any) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={`relative ${className}`}>
      {/* Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 animate-pulse bg-gray-300 grid place-content-center" ><p>Loading...</p></div>
      )}

      {/* Image */}
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-cover transition-opacity duration-500 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
         onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}
