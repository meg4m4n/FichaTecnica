import React from 'react';

export interface Client {
  id: string;
  name: string;
  createdAt: Date;
}

export interface PieceType {
  id: string;
  name: string;
  createdAt: Date;
}

export interface Measurement {
  id: string;
  code: string;
  description: string;
  tolerance: string;
  sizes: {
    XS?: number;
    S?: number;
    M?: number;
    L?: number;
    XL?: number;
    XXL?: number;
  };
}

export interface Shape {
  id: string;
  type: string;
  path: string;
  isDashed?: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  text?: string;
  textColor?: string;
}

export interface TechnicalSheetPage {
  id: string;
  image?: string;
  shapes: Shape[];
  measurements: Measurement[];
}

export interface TechnicalSheet {
  id: string;
  internalRef: string;
  description: string;
  brand: string;
  collection: string;
  sampleSize: string;
  client: Client;
  pieceType: PieceType;
  pages: TechnicalSheetPage[];
  createdAt: Date;
  updatedAt: Date;
}