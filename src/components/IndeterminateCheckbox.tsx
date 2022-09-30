import classNames from 'classnames';
import { HTMLProps, useEffect, useRef } from 'react';

export function IndeterminateCheckbox({
  indeterminate,
  className = '',
  ...rest
}: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) {
  const ref = useRef<HTMLInputElement>(null!);

  useEffect(() => {
    if (typeof indeterminate === 'boolean') {
      ref.current.indeterminate = !rest.checked && indeterminate;
    }
  }, [ref, indeterminate]);

  const checkboxClass =
    'w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600';

  const cls = classNames(checkboxClass, className, 'cursor-pointer');
  return (
    <div className="my-1 flex items-center justify-center">
      <input id="default-checkbox" type="checkbox" ref={ref} className={cls} {...rest} />
    </div>
  );
}
