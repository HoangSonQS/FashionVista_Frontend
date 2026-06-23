import React from 'react';
import { Link } from 'react-router-dom';

interface PolicyLayoutProps {
  title: string;
  children: React.ReactNode;
  breadcrumbs?: { label: string; path?: string }[];
}

const PolicyLayout: React.FC<PolicyLayoutProps> = ({ title, children, breadcrumbs }) => {
  return (
    <div className="min-h-screen bg-white text-black py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-8 text-[11px] uppercase tracking-widest text-gray-400">
          <Link to="/" className="hover:text-black transition-colors">Trang chủ</Link>
          {breadcrumbs?.map((crumb, index) => (
            <React.Fragment key={index}>
              <span>/</span>
              {crumb.path ? (
                <Link to={crumb.path} className="hover:text-black transition-colors">{crumb.label}</Link>
              ) : (
                <span className="text-gray-300">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
          <span>/</span>
          <span className="text-black font-medium">{title}</span>
        </nav>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-serif font-medium mb-12 text-center md:text-left">
          {title}
        </h1>

        {/* Content */}
        <div className="prose prose-sm md:prose-base max-w-none text-gray-800 leading-relaxed space-y-8 font-sans">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PolicyLayout;
