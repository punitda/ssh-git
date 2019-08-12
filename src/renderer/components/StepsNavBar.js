import React from 'react';

export default function StepsNavBar({ steps, activeIndex }) {
  return (
    <div className="flex justify-center items-end bg-gray-400 pt-4">
      {steps.map((step, index) => (
        <div
          key={step}
          className={
            index === activeIndex
              ? `${styles.activeLink}`
              : `${styles.inActiveLink}`
          }>
          {step}
        </div>
      ))}
    </div>
  );
}

const styles = {
  activeLink: `mr-12 text-xl font-bold text-gray-800 border-b-2 border-blue-500 pb-2`,
  inActiveLink: `mr-12 text-xl text-gray-700 border-b-2 border-transparent pb-2`,
};
