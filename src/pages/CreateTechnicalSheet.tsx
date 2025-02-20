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

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [pages, setPages] = useState<TechnicalSheetPage[]>([{
    id: crypto.randomUUID(),
    shapes: [],
    measurements: [],
  }]);

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

    const updatedPages = [...pages];
    updatedPages[currentPageIndex].measurements = [
      ...updatedPages[currentPageIndex].measurements,
      newMeasurement,
    ];
    setPages(updatedPages);
  };

  const handleMeasurementChange = (id: string, field: keyof Measurement, value: string) => {
    const updatedPages = [...pages];
    updatedPages[currentPageIndex].measurements = updatedPages[currentPageIndex].measurements.map((m) =>
      m.id === id
        ? {
            ...m,
            [field]: field === 'sizes' ? JSON.parse(value) : value,
          }
        : m
    );
    setPages(updatedPages);
  };

  const handleDeleteMeasurement = (id: string) => {
    const updatedPages = [...pages];
    updatedPages[currentPageIndex].measurements = updatedPages[currentPageIndex].measurements.filter(
      (m) => m.id !== id
    );
    setPages(updatedPages);
  };

  const handleDuplicatePage = () => {
    const currentPage = pages[currentPageIndex];
    const newPage: TechnicalSheetPage = {
      id: crypto.randomUUID(),
      shapes: [...currentPage.shapes],
      measurements: [...currentPage.measurements],
      image: currentPage.image,
    };
    const updatedPages = [...pages];
    updatedPages.splice(currentPageIndex + 1, 0, newPage);
    setPages(updatedPages);
    setCurrentPageIndex(currentPageIndex + 1);
  };

  const handleNewBlankPage = () => {
    const newPage: TechnicalSheetPage = {
      id: crypto.randomUUID(),
      shapes: [],
      measurements: [],
    };
    setPages([...pages, newPage]);
    setCurrentPageIndex(pages.length);
  };

  const handleShapesChange = (shapes: Shape[]) => {
    const updatedPages = [...pages];
    updatedPages[currentPageIndex].shapes = shapes;
    setPages(updatedPages);
  };

  const handleImageChange = (image: string) => {
    const updatedPages = [...pages];
    updatedPages[currentPageIndex].image = image;
    setPages(updatedPages);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedClient = clients.find((c) => c.id === formData.clientId);
    const selectedPieceType = pieceTypes.find((p) => p.id === formData.pieceTypeId);
    
    if (!selectedClient || !selectedPieceType) return;
    
    const newTechnicalSheet = {
      id: crypto.randomUUID(),
      ...formData,
      client: selectedClient,
      pieceType: selectedPieceType,
      pages,
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
          currentPage={pages[currentPageIndex]}
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

        {/* Page Navigation */}
        <div className="flex items-center gap-2 mb-4">
          {pages.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentPageIndex(index)}
              className={`px-4 py-2 rounded ${
                currentPageIndex === index
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {index + 1}
            </button>
          ))}
          <button
            type="button"
            onClick={handleNewBlankPage}
            className="p-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Current Page Content */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-end gap-2 mb-4">
            <button
              type="button"
              onClick={handleDuplicatePage}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Duplicar Página
            </button>
          </div>

          <ImageEditor
            shapes={pages[currentPageIndex].shapes}
            image={pages[currentPageIndex].image}
            onShapesChange={handleShapesChange}
            onImageChange={handleImageChange}
          />

          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Medidas</h3>
              <button
                type="button"
                onClick={handleAddMeasurement}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Adicionar Medida
              </button>
            </div>

            <div className="space-y-4">
              {pages[currentPageIndex].measurements.map((measurement) => (
                <div key={measurement.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="flex-1 grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                      <input
                        type="text"
                        value={measurement.code}
                        onChange={(e) => handleMeasurementChange(measurement.id, 'code', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                      <input
                        type="text"
                        value={measurement.description}
                        onChange={(e) =>
                          handleMeasurementChange(measurement.id, 'description', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tolerância
                      </label>
                      <input
                        type="text"
                        value={measurement.tolerance}
                        onChange={(e) =>
                          handleMeasurementChange(measurement.id, 'tolerance', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteMeasurement(measurement.id)}
                    className="p-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateTechnicalSheet;