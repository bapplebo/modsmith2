import classNames from 'classnames';
import React from 'react';

const tailwindClass =
  'text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2 text-center mr-2 mb-2';

const secondaryTailwindClass =
  'relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800';

interface CustomProps {
  variant?: 'default' | 'secondary';
  className?: string;
  children?: React.ReactNode;
}

type ButtonProps = CustomProps;

export const Button: React.FC<React.ComponentProps<'button'> & ButtonProps> = (props) => {
  const variant = props.variant || 'default';

  const buttonClass = classNames(props.className, {
    [tailwindClass]: variant === 'default',
    [secondaryTailwindClass]: variant === 'secondary',
  });

  if (variant === 'secondary') {
    const innerButtonClass = classNames(
      props.className,
      'relative px-5 py-2 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0'
    );

    return (
      <button {...props} className={buttonClass}>
        <span className={innerButtonClass}>{props.children}</span>
      </button>
    );
  }

  return <button {...props} className={buttonClass} />;
};
