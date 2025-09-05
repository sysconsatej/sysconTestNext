import React from 'react';
import commonUtilities from '@/utilities.js';
import { twMerge } from 'tailwind-merge';
import PropTypes from 'prop-types';

Dropdownbody.propTypes = {
  children: PropTypes.node,
}

export default function Dropdownbody({ children }) {
  return (
    <Card
      utilities={commonUtilities.parent}
      className="font-sans max-w-[286px] p-[10px] gap-[4px] md:font-sans md:max-w-[286px] md:p-[10px] md:gap-[4px] lg:font-sans lg:max-w-[286px] lg:p-[10px] lg:gap-[4px]">
      {children}
    </Card>
  );
}

Card.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.string,
  utilities: PropTypes.string,
  className: PropTypes.string,

}

function Card({
  variant,
  utilities,
  children,
  className = '',
  ...rest
}) {
  const variants = {
    'card-with-avtar':
      'lg:p-[10px] lg:flex lg:flex-col lg:gap-y-[20px] lg:w-[100%]',
    'full-width-card': 'lg:flex lg:flex-col lg:p-[24px] lg:w-[100%]',
  };
  const buttonClass = variants[variant] || variants['variant0'];
  return (
    <div
      className={twMerge(
        'shadow-lg border-[1px] border-solid border-[#eaeaea] w-[300px] rounded-[10px] overflow-hidden',
        buttonClass,
        utilities,
        className
      )}
      {...rest}>
      {children}
    </div>
  );
}
