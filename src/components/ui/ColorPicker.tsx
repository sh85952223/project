import React from 'react';

const presetColors = [
  '#FFFFFF', '#E2E8F0', '#CBD5E1', '#FED7D7', '#FEE2E2', '#FEF3C7',
  '#D1FAE5', '#E0E7FF', '#E5E7EB', '#FEEBC8', '#FBD38D', '#F9A8D4',
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-6 gap-2">
        {presetColors.map(color => (
          <button
            key={color}
            type="button"
            className={`w-full h-8 rounded-md border-2 ${value.toLowerCase() === color.toLowerCase() ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-300'}`}
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
          />
        ))}
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-10 h-10 p-1 border border-gray-300 rounded-md cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="form-input flex-1"
          placeholder="#FFFFFF"
        />
      </div>
    </div>
  );
};