import { create } from 'zustand';
import { TechnicalSheet, Client, PieceType } from '../types';

interface TechnicalSheetStore {
  technicalSheets: TechnicalSheet[];
  clients: Client[];
  pieceTypes: PieceType[];
  addTechnicalSheet: (sheet: TechnicalSheet) => void;
  updateTechnicalSheet: (id: string, sheet: Partial<TechnicalSheet>) => void;
  deleteTechnicalSheet: (id: string) => void;
  addClient: (client: Client) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addPieceType: (pieceType: PieceType) => void;
  updatePieceType: (id: string, updates: Partial<PieceType>) => void;
  deletePieceType: (id: string) => void;
}

export const useTechnicalSheetStore = create<TechnicalSheetStore>((set) => ({
  technicalSheets: [],
  clients: [],
  pieceTypes: [],
  
  addTechnicalSheet: (sheet) =>
    set((state) => ({
      technicalSheets: [...state.technicalSheets, sheet],
    })),
    
  updateTechnicalSheet: (id, updatedSheet) =>
    set((state) => ({
      technicalSheets: state.technicalSheets.map((sheet) =>
        sheet.id === id ? { ...sheet, ...updatedSheet } : sheet
      ),
    })),
    
  deleteTechnicalSheet: (id) =>
    set((state) => ({
      technicalSheets: state.technicalSheets.filter((sheet) => sheet.id !== id),
    })),
    
  addClient: (client) =>
    set((state) => ({
      clients: [...state.clients, client],
    })),

  updateClient: (id, updates) =>
    set((state) => ({
      clients: state.clients.map((client) =>
        client.id === id ? { ...client, ...updates } : client
      ),
    })),

  deleteClient: (id) =>
    set((state) => ({
      clients: state.clients.filter((client) => client.id !== id),
    })),
    
  addPieceType: (pieceType) =>
    set((state) => ({
      pieceTypes: [...state.pieceTypes, pieceType],
    })),

  updatePieceType: (id, updates) =>
    set((state) => ({
      pieceTypes: state.pieceTypes.map((type) =>
        type.id === id ? { ...type, ...updates } : type
      ),
    })),

  deletePieceType: (id) =>
    set((state) => ({
      pieceTypes: state.pieceTypes.filter((type) => type.id !== id),
    })),
}));