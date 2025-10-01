
import React from 'react';

const ChefHatIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M19.8 12.7c.6-.5 1-1.2 1.2-2.1.2-.9.4-2.1-.2-3.8-.5-1.7-1.5-3.1-3-4.2C16.3 1.5 14.5 1 12 1s-4.3.5-5.8 1.6c-1.5 1.1-2.5 2.5-3 4.2-.6 1.7-.3 2.9-.2 3.8.2.9.6 1.6 1.2 2.1" />
    <path d="M6 13.3c-1.4 0-2.8.5-3.8 1.5-2 2-2 5.3 0 7.3 2 2 5.3 2 7.3 0" />
    <path d="M18 13.3c1.4 0 2.8.5 3.8 1.5 2 2 2 5.3 0 7.3-2 2-5.3 2-7.3 0" />
    <path d="M12 21v-8" />
    <path d="M12 21a2.8 2.8 0 0 0 2.5-1.5" />
    <path d="M12 21a2.8 2.8 0 0 1-2.5-1.5" />
  </svg>
);

const Header: React.FC = () => {
  return (
    <header className="text-center">
      <div className="flex items-center justify-center gap-3">
        <ChefHatIcon className="w-10 h-10 text-orange-500" />
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">
          Gênio da Receita
        </h1>
      </div>
      <p className="mt-3 text-lg text-slate-600">
        Transforme seus ingredientes em uma obra-prima.
      </p>
    </header>
  );
};

export default Header;
