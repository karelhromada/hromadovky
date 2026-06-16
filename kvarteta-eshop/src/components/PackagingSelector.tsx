import { Gift, Package } from 'lucide-react';
import { PACKAGING_OPTIONS, type PackagingType } from '../data/packaging';
import './PackagingSelector.css';

interface PackagingSelectorProps {
  value: PackagingType;
  onChange: (packaging: PackagingType) => void;
  /** Volitelný titulek nad volbou. */
  title?: string;
}

const ICONS: Record<PackagingType, typeof Gift> = {
  standard: Package,
  gift: Gift,
};

function PackagingSelector({ value, onChange, title = 'Zvolte typ balení' }: PackagingSelectorProps) {
  return (
    <div className="pkg-selector">
      <div className="pkg-selector-title">{title}</div>
      <div className="pkg-options">
        {PACKAGING_OPTIONS.map((option) => {
          const Icon = ICONS[option.id];
          const isActive = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              className={`pkg-option ${isActive ? 'active' : ''}`}
              onClick={() => onChange(option.id)}
              aria-pressed={isActive}
            >
              <span className="pkg-option-icon">
                <Icon size={26} />
              </span>
              <span className="pkg-option-label">{option.label}</span>
              <span className={`pkg-option-price ${option.priceAdd > 0 ? 'surcharge' : ''}`}>
                {option.priceAdd > 0 ? `+${option.priceAdd} Kč` : 'V ceně'}
              </span>
              <span className="pkg-option-desc">{option.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default PackagingSelector;
