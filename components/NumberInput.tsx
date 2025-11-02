import React from 'react';

interface NumberInputProps {
  label: string;
  id: string;
  value: number | '';
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  min?: number;
  max?: number;
}

const NumberInput: React.FC<NumberInputProps> = ({
  label,
  id,
  value,
  onChange,
  placeholder,
  min,
  max,
}) => {
  return (
    <div className="mb-6">
      <label htmlFor={id} className="block text-gray-700 text-sm font-bold mb-2">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type="number"
        value={value === '' ? '' : value} // Ensure empty string for placeholder
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        className="block w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
      />
    </div>
  );
};

export default NumberInput;
