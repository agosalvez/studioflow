import { PrismaClient, EstadoPedido, Rol } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Sembrando datos de ejemplo…');

  // --- Tenant sistema (superadmin) ---
  const tenantSistema = await prisma.tenant.upsert({
    where: { slug: 'sistema' },
    update: {},
    create: { nombre: 'Sistema', slug: 'sistema' },
  });

  const hashSuper = await bcrypt.hash('superadmin123', 10);
  await prisma.usuario.upsert({
    where: { email: 'superadmin@orderly.com' },
    update: {},
    create: {
      email: 'superadmin@orderly.com',
      nombre: 'Super Admin',
      passwordHash: hashSuper,
      rol: Rol.SUPERADMIN,
      tenantId: tenantSistema.id,
    },
  });

  // --- Tenant demo 1 ---
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'estudio-demo' },
    update: {},
    create: { nombre: 'Estudio Demo', slug: 'estudio-demo' },
  });

  // --- Tenant demo 2 ---
  const tenant2 = await prisma.tenant.upsert({
    where: { slug: 'foto-madrid' },
    update: {},
    create: { nombre: 'Foto Madrid', slug: 'foto-madrid' },
  });

  // --- Usuarios ---
  const hashAdmin    = await bcrypt.hash('admin123', 10);
  const hashOperario = await bcrypt.hash('operario123', 10);
  const hashCliente  = await bcrypt.hash('cliente123', 10);

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      nombre: 'Adrián Admin',
      passwordHash: hashAdmin,
      rol: Rol.ADMIN,
      tenantId: tenant.id,
    },
  });

  await prisma.usuario.upsert({
    where: { email: 'operario@demo.com' },
    update: {},
    create: {
      email: 'operario@demo.com',
      nombre: 'Laura Operario',
      passwordHash: hashOperario,
      rol: Rol.OPERARIO,
      tenantId: tenant.id,
    },
  });

  await prisma.usuario.upsert({
    where: { email: 'cliente@demo.com' },
    update: {},
    create: {
      email: 'cliente@demo.com',
      nombre: 'Carlos Cliente',
      passwordHash: hashCliente,
      rol: Rol.CLIENTE,
      tenantId: tenant.id,
    },
  });

  // --- Pedidos con distintos estados ---
  const pedidosData: {
    referencia: string;
    observaciones: string;
    estado: EstadoPedido;
    diasAtras: number;
    archivos: { nombre: string; tamaño: number; mimeType: string }[];
  }[] = [
    {
      referencia: 'REF-2026-001',
      observaciones: 'Álbum de boda 30x30cm, tapa dura. Papel mate 250g. Urgente para el viernes.',
      estado: EstadoPedido.RECIBIDO,
      diasAtras: 0,
      archivos: [
        { nombre: 'fotos_boda.zip', tamaño: 245_760_000, mimeType: 'application/zip' },
        { nombre: 'instrucciones.pdf', tamaño: 512_000, mimeType: 'application/pdf' },
      ],
    },
    {
      referencia: 'REF-2026-002',
      observaciones: 'Impresión de 50 copias A4 en color. Sin encuadernar.',
      estado: EstadoPedido.EN_PRODUCCION,
      diasAtras: 1,
      archivos: [
        { nombre: 'catalogo_primavera.pdf', tamaño: 18_432_000, mimeType: 'application/pdf' },
      ],
    },
    {
      referencia: 'REF-2026-003',
      observaciones: 'Fotolibro A5 con 80 páginas. Acabado brillo.',
      estado: EstadoPedido.EN_PRODUCCION,
      diasAtras: 2,
      archivos: [
        { nombre: 'fotos_comunion.zip', tamaño: 312_000_000, mimeType: 'application/zip' },
        { nombre: 'portada.jpg', tamaño: 4_096_000, mimeType: 'image/jpeg' },
      ],
    },
    {
      referencia: 'REF-2026-004',
      observaciones: 'Canvas 60x40 de retrato familiar. Marco flotante negro.',
      estado: EstadoPedido.TERMINADO,
      diasAtras: 4,
      archivos: [
        { nombre: 'retrato_familia.jpg', tamaño: 8_192_000, mimeType: 'image/jpeg' },
      ],
    },
    {
      referencia: 'REF-2026-005',
      observaciones: null as unknown as string,
      estado: EstadoPedido.TERMINADO,
      diasAtras: 5,
      archivos: [
        { nombre: 'evento_empresa.zip', tamaño: 520_000_000, mimeType: 'application/zip' },
      ],
    },
    {
      referencia: 'REF-2026-006',
      observaciones: 'Álbum de graduación. Entrega en mano en tienda.',
      estado: EstadoPedido.ENTREGADO,
      diasAtras: 7,
      archivos: [
        { nombre: 'graduacion_fotos.zip', tamaño: 198_000_000, mimeType: 'application/zip' },
        { nombre: 'texto_dedicatoria.txt', tamaño: 2_048, mimeType: 'text/plain' },
      ],
    },
    {
      referencia: 'REF-2026-007',
      observaciones: 'Impresión poster XL 100x70cm. Alta resolución.',
      estado: EstadoPedido.ENTREGADO,
      diasAtras: 10,
      archivos: [
        { nombre: 'poster_final.tif', tamaño: 890_000_000, mimeType: 'image/tiff' },
      ],
    },
  ];

  for (const datos of pedidosData) {
    const fechaCreacion = new Date();
    fechaCreacion.setDate(fechaCreacion.getDate() - datos.diasAtras);

    // Evitar duplicados por referencia
    const existe = await prisma.pedido.findFirst({ where: { referencia: datos.referencia, tenantId: tenant.id } });
    if (existe) continue;

    await prisma.pedido.create({
      data: {
        referencia: datos.referencia,
        observaciones: datos.observaciones,
        estado: datos.estado,
        tenantId: tenant.id,
        creadoEn: fechaCreacion,
        archivos: {
          create: datos.archivos.map((a) => ({
            nombre: a.nombre,
            ruta: `uploads/${tenant.id}/seed/${a.nombre}`,
            tamaño: a.tamaño,
            mimeType: a.mimeType,
          })),
        },
      },
    });
  }

  // --- Usuarios Foto Madrid ---
  await prisma.usuario.upsert({
    where: { email: 'admin@fotomadrid.com' },
    update: {},
    create: {
      email: 'admin@fotomadrid.com',
      nombre: 'Marta Gómez',
      passwordHash: hashAdmin,
      rol: Rol.ADMIN,
      tenantId: tenant2.id,
    },
  });
  await prisma.usuario.upsert({
    where: { email: 'cliente@fotomadrid.com' },
    update: {},
    create: {
      email: 'cliente@fotomadrid.com',
      nombre: 'Pedro Sanz',
      passwordHash: hashCliente,
      rol: Rol.CLIENTE,
      tenantId: tenant2.id,
    },
  });

  // --- Pedidos Foto Madrid ---
  const pedidosFotoMadrid: {
    referencia: string; observaciones: string; estado: EstadoPedido;
    diasAtras: number; archivos: { nombre: string; tamaño: number; mimeType: string }[];
  }[] = [
    {
      referencia: 'FM-2026-001', observaciones: 'Reportaje de bautizo, 20x30cm mate.',
      estado: EstadoPedido.EN_PRODUCCION, diasAtras: 3,
      archivos: [{ nombre: 'bautizo.zip', tamaño: 180_000_000, mimeType: 'application/zip' }],
    },
    {
      referencia: 'FM-2026-002', observaciones: 'Canvas familiar 50x70.',
      estado: EstadoPedido.RECIBIDO, diasAtras: 1,
      archivos: [{ nombre: 'familia.jpg', tamaño: 9_000_000, mimeType: 'image/jpeg' }],
    },
    {
      referencia: 'FM-2026-003', observaciones: null as unknown as string,
      estado: EstadoPedido.ENTREGADO, diasAtras: 8,
      archivos: [{ nombre: 'evento.zip', tamaño: 400_000_000, mimeType: 'application/zip' }],
    },
  ];

  for (const datos of pedidosFotoMadrid) {
    const existe = await prisma.pedido.findFirst({ where: { referencia: datos.referencia, tenantId: tenant2.id } });
    if (existe) continue;
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - datos.diasAtras);
    await prisma.pedido.create({
      data: {
        referencia: datos.referencia, observaciones: datos.observaciones,
        estado: datos.estado, tenantId: tenant2.id, creadoEn: fecha,
        archivos: {
          create: datos.archivos.map((a) => ({
            nombre: a.nombre, ruta: `uploads/${tenant2.id}/seed/${a.nombre}`,
            tamaño: a.tamaño, mimeType: a.mimeType,
          })),
        },
      },
    });
  }

  console.log('✓ Seed completado.');
  console.log('');
  console.log('Usuarios de acceso:');
  console.log('  superadmin@orderly.com / superadmin123 (SUPERADMIN)');
  console.log('  admin@demo.com         / admin123      (ADMIN  — Estudio Demo)');
  console.log('  operario@demo.com      / operario123   (OPERARIO — Estudio Demo)');
  console.log('  cliente@demo.com       / cliente123    (CLIENTE  — Estudio Demo)');
  console.log('  admin@fotomadrid.com   / admin123      (ADMIN  — Foto Madrid)');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
