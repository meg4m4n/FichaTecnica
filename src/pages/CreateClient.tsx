import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Trash2, Edit, ArrowLeft } from 'lucide-react';
import { useTechnicalSheetStore } from '../store/technicalSheetStore';

function CreateClient() {
  const navigate = useNavigate();
  const { addClient, clients, deleteClient, updateClient } = useTechnicalSheetStore();
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newClient = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date(),
    };
    
    addClient(newClient);
    setName('');
  };

  const handleEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  const handleUpdate = (id: string) => {
    updateClient(id, { name: editingName });
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
        <Users className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Clientes</h1>
      </div>

      <div className="grid gap-6">
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Novo Cliente</h2>
          
          <div className="flex gap-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do cliente"
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Lista de Clientes</h2>
            
            <div className="divide-y divide-gray-200">
              {clients.map((client) => (
                <div key={client.id} className="py-4 flex items-center justify-between">
                  {editingId === client.id ? (
                    <div className="flex-1 mr-4">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  ) : (
                    <span className="text-gray-900">{client.name}</span>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    {editingId === client.id ? (
                      <button
                        onClick={() => handleUpdate(client.id)}
                        className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                      >
                        Salvar
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEdit(client.id, client.name)}
                        className="p-1 text-gray-600 hover:text-blue-600"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteClient(client.id)}
                      className="p-1 text-gray-600 hover:text-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}

              {clients.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  Nenhum cliente cadastrado
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateClient;