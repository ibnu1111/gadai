const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const VALID_KATEGORI = ['Mobil', 'Motor', 'Elektronik', 'HP', 'Laptop', 'Perhiasan', 'Lainnya'];
const VALID_STATUS = ['PENDING', 'AKTIF', 'LUNAS', 'JATUH_TEMPO', 'OVERDUE', 'DITOLAK', 'DIPERPANJANG'];

// Get all gadai with pagination and filters
exports.getAllGadai = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      tanggalMulai,
      tanggalAkhir,
      search
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if (status) {
      where.status = status;
    }

    if (tanggalMulai || tanggalAkhir) {
      where.tanggalPinjam = {};
      if (tanggalMulai) where.tanggalPinjam.gte = new Date(tanggalMulai);
      if (tanggalAkhir) where.tanggalPinjam.lte = new Date(tanggalAkhir + 'T23:59:59');
    }

    if (search) {
      where.OR = [
        { namaBarang: { contains: search, mode: 'insensitive' } },
        { customer: { nama: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [gadais, total] = await Promise.all([
      prisma.gadai.findMany({
        where,
        include: { customer: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.gadai.count({ where })
    ]);

    res.json({
      success: true,
      data: gadais,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error getting gadai:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch gadai' });
  }
};

// Get single gadai by ID
exports.getGadaiById = async (req, res) => {
  try {
    const { id } = req.params;

    const gadai = await prisma.gadai.findUnique({
      where: { gadaiID: parseInt(id) },
      include: {
        customer: true,
        payments: { orderBy: { createdAt: 'desc' } },
        parentGadai: true,
        extensions: true
      }
    });

    if (!gadai) {
      return res.status(404).json({ success: false, message: 'Gadai not found' });
    }

    res.json({ success: true, data: gadai });
  } catch (error) {
    console.error('Error getting gadai:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch gadai' });
  }
};

// Create new gadai
exports.createGadai = async (req, res) => {
  try {
    const {
      customerID,
      kategoriBarang,
      namaBarang,
      nominalPinjam,
      bungaPersentase,
      tanggalPinjam,
      tanggalKembali,
      atributTinggal,
      deskripsi,
      fotoBarang,
      fotoPendukung
    } = req.body;

    // Validation
    if (!customerID || !kategoriBarang || !namaBarang || !nominalPinjam ||
        !tanggalPinjam || !tanggalKembali || !atributTinggal || !fotoBarang) {
      return res.status(400).json({ success: false, message: 'Required fields are missing' });
    }

    if (!VALID_KATEGORI.includes(kategoriBarang)) {
      return res.status(400).json({
        success: false,
        message: `Kategori barang must be one of: ${VALID_KATEGORI.join(', ')}`
      });
    }

    // Calculate fee
    const bunga = parseFloat(bungaPersentase) || 20;
    const fee = (parseFloat(nominalPinjam) * bunga) / 100;

    const gadai = await prisma.gadai.create({
      data: {
        customerID: parseInt(customerID),
        kategoriBarang,
        namaBarang,
        nominalPinjam: parseFloat(nominalPinjam),
        bungaPersentase: bunga,
        fee,
        tanggalPinjam: new Date(tanggalPinjam),
        tanggalKembali: new Date(tanggalKembali),
        atributTinggal,
        deskripsi,
        fotoBarang,
        fotoPendukung,
        status: 'AKTIF',
        createdBy: req.admin?.nama || 'System'
      },
      include: { customer: true }
    });

    res.status(201).json({ success: true, message: 'Gadai created successfully', data: gadai });
  } catch (error) {
    console.error('Error creating gadai:', error);
    res.status(500).json({ success: false, message: 'Failed to create gadai' });
  }
};

// Update gadai
exports.updateGadai = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const existing = await prisma.gadai.findUnique({
      where: { gadaiID: parseInt(id) }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Gadai not found' });
    }

    // Recalculate fee if nominal or bunga changed
    if (updateData.nominalPinjam || updateData.bungaPersentase) {
      const nominal = parseFloat(updateData.nominalPinjam) || parseFloat(existing.nominalPinjam);
      const bunga = parseFloat(updateData.bungaPersentase) || parseFloat(existing.bungaPersentase);
      updateData.fee = (nominal * bunga) / 100;
      updateData.nominalPinjam = nominal;
    }

    if (updateData.tanggalPinjam) updateData.tanggalPinjam = new Date(updateData.tanggalPinjam);
    if (updateData.tanggalKembali) updateData.tanggalKembali = new Date(updateData.tanggalKembali);

    const gadai = await prisma.gadai.update({
      where: { gadaiID: parseInt(id) },
      data: updateData,
      include: { customer: true }
    });

    res.json({ success: true, message: 'Gadai updated successfully', data: gadai });
  } catch (error) {
    console.error('Error updating gadai:', error);
    res.status(500).json({ success: false, message: 'Failed to update gadai' });
  }
};

// Update gadai status
exports.updateGadaiStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const upperStatus = status.toUpperCase();
    if (!VALID_STATUS.includes(upperStatus)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${VALID_STATUS.join(', ')}`
      });
    }

    const existing = await prisma.gadai.findUnique({
      where: { gadaiID: parseInt(id) }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Gadai not found' });
    }

    const gadai = await prisma.gadai.update({
      where: { gadaiID: parseInt(id) },
      data: { status: upperStatus },
      include: { customer: true }
    });

    res.json({ success: true, message: 'Status updated successfully', data: gadai });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};

// Delete gadai
exports.deleteGadai = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.gadai.findUnique({
      where: { gadaiID: parseInt(id) }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Gadai not found' });
    }

    await prisma.gadai.delete({
      where: { gadaiID: parseInt(id) }
    });

    res.json({ success: true, message: 'Gadai deleted successfully' });
  } catch (error) {
    console.error('Error deleting gadai:', error);
    res.status(500).json({ success: false, message: 'Failed to delete gadai' });
  }
};

// Get summary statistics
exports.getSummary = async (req, res) => {
  try {
    const [
      totalGadai,
      aktifCount,
      pendingCount,
      jatuhTempoCount,
      overdueCount,
      lunasCount,
      totalNominal
    ] = await Promise.all([
      prisma.gadai.count(),
      prisma.gadai.count({ where: { status: 'AKTIF' } }),
      prisma.gadai.count({ where: { status: 'PENDING' } }),
      prisma.gadai.count({ where: { status: 'JATUH_TEMPO' } }),
      prisma.gadai.count({ where: { status: 'OVERDUE' } }),
      prisma.gadai.count({ where: { status: 'LUNAS' } }),
      prisma.gadai.aggregate({
        _sum: { nominalPinjam: true },
        where: { status: { in: ['AKTIF', 'JATUH_TEMPO', 'OVERDUE'] } }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalGadai,
        aktif: aktifCount,
        pending: pendingCount,
        jatuhTempo: jatuhTempoCount,
        overdue: overdueCount,
        lunas: lunasCount,
        totalNominal: totalNominal._sum.nominalPinjam || 0
      }
    });
  } catch (error) {
    console.error('Error getting summary:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch summary' });
  }
};
