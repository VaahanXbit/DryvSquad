// src/components/tools/evRangeCalculator/FieldHint.jsx

/**
 * Short explanatory text shown below a field, per the "user guidance"
 * requirement — kept as a single reusable component so every field's hint
 * looks identical.
 */
const FieldHint = ({ children }) => {
  if (!children) return null;
  return <p className="text-xs text-theme-tertiary mt-1.5 leading-snug">{children}</p>;
};

export default FieldHint;
