import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Trash2 } from 'lucide-react';
import { useTechnicalSheetStore } from '../store/technicalSheetStore';
import ImageEditor from '../components/ImageEditor';
import PDFExport from '../components/PDFExport';
import type { Measurement, TechnicalSheetPage, Shape } from '../types';

function CreateTechnicalSheet() {
  const navigate = useNavigate();
  const { addTechnicalSheet, clients, pieceTypes } = useTechnicalSheetStore();
  
  const [formData, setFormData] = useState({
    internalRef: '',
    description: '',
    brand: '',
    collection: '',
    sampleSize: '',
    clientId: '',
    pieceTypeId: '',
  });

  const [currentPage, setCurrentPage] = useState<TechnicalSheetPage>({
    id: crypto.randomUUID(),
    shapes: [],
    measurements: [],
  });

  const [pages, setPages] = useState<TechnicalSheetPage[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddMeasurement = () => {
    const newMeasurement: Measurement = {
      id: crypto.randomUUID(),
      code: '',
      description: '',
      tolerance: '',
      sizes: {},
    };

    setCurrentPage((prev) => ({
      ...prev,
      measurements: [...prev.measurements, newMeasurement],
    }));
  };

  const handleMeasurementChange = (id: string, field: keyof Measurement, value: string) => {
    setCurrentPage((prev) => ({
      ...prev,
      measurements: prev.measurements.map((m) =>
        m.id === id
          ? {
              ...m,
              [field]: field === 'sizes' ? JSON.parse(value) : value,
            }
          : m
      ),
    }));
  };

  const handleDeleteMeasurement = (id: string) => {
    setCurrentPage((prev) => ({
      ...prev,
      measurements: prev.measurements.filter((m) => m.id !== id),
    }));
  };

  const handleAddPage = () => {
    setPages((prev) => [...prev, currentPage]);
    setCurrentPage({
      id: crypto.randomUUID(),
      shapes: [],
      measurements: [],
      image: undefined,
    });
  };

  const handleShapesChange = (shapes: Shape[]) => {
    setCurrentPage((prev) => ({ ...prev, shapes }));
  };

  const handleImageChange = (image: string) => {
    setCurrentPage((prev) => ({ ...prev, image }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedClient = clients.find((c) => c.id === formData.clientId);
    const selectedPieceType = pieceTypes.find((p) => p.id === formData.pieceTypeId);
    
    if (!selectedClient || !selectedPieceType) return;

    const allPages = [...pages, currentPage];
    
    const newTechnicalSheet = {
      id: crypto.randomUUID(),
      ...formData,
      client: selectedClient,
      pieceType: selectedPieceType,
      pages: allPages,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    addTechnicalSheet(newTechnicalSheet);
    navigate('/');
  };

  const getTechnicalSheetData = () => {
    const selectedClient = clients.find((c) => c.id === formData.clientId);
    const selectedPieceType = pieceTypes.find((p) => p.id === formData.pieceTypeId);
    
    return {
      ...formData,
      client: selectedClient,
      pieceType: selectedPieceType,
    };
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <FileText className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Nova Ficha Técnica</h1>
        </div>
        <PDFExport
          technicalSheet={getTechnicalSheetData()}
          currentPage={currentPage}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h2>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="internalRef" className="block text-sm font-medium text-gray-700 mb-2">
                Ref. Interna
              </label>
              <input
                type="text"
                id="internalRef"
                name="internalRef"
                value={formData.internalRef}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                Marca
              </label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="collection" className="block text-sm font-medium text-gray-700 mb-2">
                Coleção
              </label>
              <input
                type="text"
                id="collection"
                name="collection"
                value={formData.collection}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="sampleSize" className="block text-sm font-medium text-gray-700 mb-2">
                Tamanho Amostra
              </label>
              <input
                type="text"
                id="sampleSize"
                name="sampleSize"
                value={formData.sampleSize}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-2">
                Cliente
              </label>
              <select
                id="clientId"
                name="clientId"
                value={formData.clientId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Selecione um cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="pieceTypeId" className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Peça
              </label>
              <select
                id="pieceTypeId"
                name="pieceTypeId"
                value={formData.pieceTypeId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Selecione um tipo de peça</option>
                {pieceTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <ImageEditor
          shapes={currentPage.shapes}
          onShapesChange={handleShapesChange}
          onImageChange={handleImageChange}
        />

        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Tabela de Medidas</h2>
            <button
              type="button"
              onClick={handleAddMeasurement}
              className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar Medida
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tolerância</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">XS</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">S</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">M</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">L</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">XL</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">XXL</th>
                  <th className="px-2 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white text-sm">
                {currentPage.measurements.map((measurement) => (
                  <tr key={measurement.id} className="text-sm">
                    <td className="px-2 py-1">
                      <input
                        type="text"
                        value={measurement.code}
                        onChange={(e) => handleMeasurementChange(measurement.id, 'code', e.target.value)}
                        className="w-16 px-1 py-1 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="text"
                        value={measurement.description}
                        onChange={(e) => handleMeasurementChange(measurement.id, 'description', e.target.value)}
                        className="w-full px-1 py-1 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="text"
                        value={measurement.tolerance}
                        onChange={(e) => handleMeasurementChange(measurement.id, 'tolerance', e.target.value )}
                        className="w-16 px-1 py-1 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </td>
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                      <td key={size} className="px-2 py-1">
                        <input
                          type="number"
                          value={measurement.sizes[size as keyof typeof measurement.sizes] || ''}
                          onChange={(e) => {
                            const newSizes = { ...measurement.sizes, [size]: parseFloat(e.target.value) };
                            handleMeasurementChange(measurement.id, 'sizes', JSON.stringify(newSizes));
                          }}
                          className="w-12 px-1 py-1 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                    ))}
                    <td className="px-2 py-1">
                      <button
                        type="button"
                        onClick={() => handleDeleteMeasurement(measurement.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleAddPage}
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50"
          >
            Adicionar Página
          </button>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Salvar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CreateTechnicalSheet;