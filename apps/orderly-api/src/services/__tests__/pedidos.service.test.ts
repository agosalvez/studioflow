import { crearPedido, cambiarEstado, eliminarPedido, obtenerPedido } from '../pedidos.service';

jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    pedido: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock('../../lib/rabbitmq', () => ({
  publicar: jest.fn().mockResolvedValue(undefined),
}));

import prisma from '../../lib/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const pedidoMock = {
  id: 'p1',
  referencia: 'REF-001',
  observaciones: null,
  estado: 'RECIBIDO' as const,
  tenantId: 't1',
  creadoEn: new Date(),
  actualizadoEn: new Date(),
  archivos: [],
};

describe('pedidos.service', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('crearPedido', () => {
    it('crea un pedido y publica en RabbitMQ', async () => {
      (mockPrisma.pedido.create as jest.Mock).mockResolvedValue(pedidoMock);
      const resultado = await crearPedido({ referencia: 'REF-001' }, 't1');
      expect(resultado.referencia).toBe('REF-001');
      expect(mockPrisma.pedido.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('obtenerPedido', () => {
    it('devuelve el pedido si existe', async () => {
      (mockPrisma.pedido.findFirst as jest.Mock).mockResolvedValue(pedidoMock);
      const resultado = await obtenerPedido('p1', 't1');
      expect(resultado.id).toBe('p1');
    });

    it('lanza error si no existe', async () => {
      (mockPrisma.pedido.findFirst as jest.Mock).mockResolvedValue(null);
      await expect(obtenerPedido('no-existe', 't1')).rejects.toThrow('Pedido no encontrado');
    });
  });

  describe('cambiarEstado', () => {
    it('actualiza el estado y publica en RabbitMQ', async () => {
      (mockPrisma.pedido.findFirst as jest.Mock).mockResolvedValue(pedidoMock);
      (mockPrisma.pedido.update as jest.Mock).mockResolvedValue({ ...pedidoMock, estado: 'EN_PRODUCCION' });

      const resultado = await cambiarEstado('p1', 'EN_PRODUCCION', 't1');
      expect(resultado.estado).toBe('EN_PRODUCCION');
    });

    it('lanza error si el pedido no pertenece al tenant', async () => {
      (mockPrisma.pedido.findFirst as jest.Mock).mockResolvedValue(null);
      await expect(cambiarEstado('p1', 'EN_PRODUCCION', 'otro-tenant')).rejects.toThrow('Pedido no encontrado');
    });
  });

  describe('eliminarPedido', () => {
    it('elimina el pedido si existe', async () => {
      (mockPrisma.pedido.findFirst as jest.Mock).mockResolvedValue(pedidoMock);
      (mockPrisma.pedido.delete as jest.Mock).mockResolvedValue(pedidoMock);
      await expect(eliminarPedido('p1', 't1')).resolves.not.toThrow();
    });

    it('lanza error si no existe', async () => {
      (mockPrisma.pedido.findFirst as jest.Mock).mockResolvedValue(null);
      await expect(eliminarPedido('no-existe', 't1')).rejects.toThrow('Pedido no encontrado');
    });
  });
});
