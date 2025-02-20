import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shirt, Plus, Trash2, Edit, ArrowLeft } from 'lucide-react';
import { useTechnicalSheetStore } from '../store/technicalSheetStore';

function CreatePieceType() {
  const navigate = useNavigate();
  const { addPieceType, pieceTypes, deletePieceType, updatePieceType } = useTechnicalSheetStore();
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newPieceType = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date(),
    };
    
    addPieceType(newPieceType);
    setName('');
  };

  const handleEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  const handleUpdate = (id: string) => {
    updatePieceType(id, { name: editingName });
    setEditingId(null);
    setEditingName('');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center space-x-2 mb-6">
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <Shirt className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Tipos de Peça</h1>
      </div>

      <div className="grid gap-6">
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Novo Tipo de Peça</h2>
          
          <div className="flex gap-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do tipo de peça"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <button
              type="submit"
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </button>
          </div>
        </form>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Lista de Tipos de Peça</h2>
            
            <div className="divide-y divide-gray-200">
              {pieceTypes.map((type) => (
                <div key={type.id} className="py-4 flex items-center justify-between">
                  {editingId === type.id ? (
                    <div className="flex-1 mr-4">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  ) : (
                    <span className="text-gray-900">{type.name}</span>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    {editingId === type.id ? (
                      <button
                        onClick={() => handleUpdate(type.id)}
                        className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                      >
                        Salvar
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEdit(type.id, type.name)}
                        className="p-1 text-gray-600 hover:text-blue-600"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => deletePieceType(type.id)}
                      className="p-1 text-gray-600 hover:text-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}

              {pieceTypes.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  Nenhum tipo de peça cadastrado
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreatePieceType;