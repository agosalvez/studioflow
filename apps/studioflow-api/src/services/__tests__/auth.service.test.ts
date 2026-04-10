import { registrar, login, crearTenant } from '../auth.service';

// Mock de Prisma
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    tenant: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    usuario: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

import prisma from '../../lib/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('auth.service', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('crearTenant', () => {
    it('crea un tenant si el slug no existe', async () => {
      (mockPrisma.tenant.findUnique as jest.Mock).mockResolvedValue(null);
      (mockPrisma.tenant.create as jest.Mock).mockResolvedValue({ id: '1', nombre: 'Test', slug: 'test' });

      const resultado = await crearTenant({ nombre: 'Test', slug: 'test' });
      expect(resultado.slug).toBe('test');
    });

    it('lanza error si el slug ya existe', async () => {
      (mockPrisma.tenant.findUnique as jest.Mock).mockResolvedValue({ id: '1', slug: 'test' });
      await expect(crearTenant({ nombre: 'Test', slug: 'test' })).rejects.toThrow('El slug ya está en uso');
    });
  });

  describe('registrar', () => {
    it('lanza error si el tenant no existe', async () => {
      (mockPrisma.tenant.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(
        registrar({ email: 'a@a.com', nombre: 'Test', password: '123456', tenantSlug: 'no-existe' })
      ).rejects.toThrow('Tenant no encontrado');
    });

    it('lanza error si el email ya está registrado', async () => {
      (mockPrisma.tenant.findUnique as jest.Mock).mockResolvedValue({ id: 't1', slug: 'demo' });
      (mockPrisma.usuario.findUnique as jest.Mock).mockResolvedValue({ id: 'u1', email: 'a@a.com' });
      await expect(
        registrar({ email: 'a@a.com', nombre: 'Test', password: '123456', tenantSlug: 'demo' })
      ).rejects.toThrow('El email ya está registrado');
    });
  });

  describe('login', () => {
    it('lanza error si el usuario no existe', async () => {
      (mockPrisma.usuario.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(login({ email: 'no@existe.com', password: '123456' })).rejects.toThrow('Credenciales incorrectas');
    });
  });
});
