import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';

export const Header: React.FC = () => {
  const isAuthenticated = false; // TODO: Replace with actual auth state

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Issues', href: '/issues' },
    { name: 'About', href: '/about' },
  ];

  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-primary-600">
                SAUTII
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {/* TODO: Handle create issue */}}
                >
                  Create Issue
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {/* TODO: Handle logout */}}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};
