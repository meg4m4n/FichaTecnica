import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Users, Shirt } from 'lucide-react';

function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-semibold">Fichas Técnicas</span>
          </Link>
          
          <div className="flex space-x-4">
            <Link
              to="/create-sheet"
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100"
            >
              <FileText className="w-4 h-4 mr-2" />
              Nova Ficha Técnica
            </Link>
            
            <Link
              to="/create-client"
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100"
            >
              <Users className="w-4 h-4 mr-2" />
              Novo Cliente
            </Link>
            
            <Link
              to="/create-piece-type"
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100"
            >
              <Shirt className="w-4 h-4 mr-2" />
              Novo Tipo de Peça
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;