interface Props {
  rating: number;
  size?: 'sm' | 'md';
  showValue?: boolean;
}

export default function StarRating({ rating, size = 'sm', showValue = true }: Props) {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);
  const textSize = size === 'sm' ? 'text-sm' : 'text-base';

  return (
    <div className={`flex items-center gap-1 ${textSize}`}>
      {stars.map((s) => (
        <span key={s} className={s <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}>★</span>
      ))}
      {showValue && <span className="font-semibold text-gray-900 ml-1">{rating.toFixed(1)}</span>}
    </div>
  );
}