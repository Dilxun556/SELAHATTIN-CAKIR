import React from 'react';

interface CheckboxGroupProps<T> {
  label: string;
  idPrefix: string;
  options: T[];
  selectedValues: T[];
  onChange: (values: T[]) => void;
}

const CheckboxGroup = <T extends string | number | boolean | object,>({
  label,
  idPrefix,
  options,
  selectedValues,
  onChange,
}: React.PropsWithChildren<CheckboxGroupProps<T>>): React.ReactElement => {
  const handleCheckboxChange = (option: T) => {
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter((value) => value !== option));
    } else {
      onChange([...selectedValues, option]);
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-gray-700 text-sm font-bold mb-2">
        {label}
      </label>
      <div className="flex flex-wrap gap-2 mt-2">
        {options.map((option, index) => {
          const optionValue = typeof option === 'object' ? JSON.stringify(option) : String(option);
          const optionLabel = typeof option === 'object' && 'label' in option ? (option as { label: string }).label : String(option);
          const id = `${idPrefix}-${index}`;
          return (
            <div key={id} className="flex items-center">
              <input
                id={id}
                type="checkbox"
                value={optionValue}
                checked={selectedValues.includes(option)}
                onChange={() => handleCheckboxChange(option)}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor={id} className="ml-2 text-sm text-gray-700">
                {optionLabel}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CheckboxGroup;
