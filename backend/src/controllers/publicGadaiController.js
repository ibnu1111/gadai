const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const {
  normalizePhoneNumber,
  mapKategoriBarang,
  calculateTanggalKembali,
  getStatusLabel,
  getStatusColor
} = require('../utils/helpers');

const VALID_KATEGORI = ['Mobil', 'Motor', 'Elektronik', 'HP', 'Laptop', 'Perhiasan', 'Lainnya'];
const VALID_BUNGA = {
  '2minggu': 10,
  '1bulan': 20
};

// Create public gadai submission
exports.createPublicGadai = async (req, res) => {
  try {
    const {
      customerName,
      phone,
      fotoKtp,
      kategoriBarang,
      namaBarang,
      deskripsi,
      atributTinggal,
      fotoBarang,
      fotoPendukung,
      jangkaWaktu,
      nominalPinjam
    } = req.body;

    // Validation
    if (!customerName || !phone || !kategoriBarang || !namaBarang ||
        !fotoBarang || !jangkaWaktu || !nominalPinjam) {
      return res.status(400).json({
        success: false,
        message: 'Required fields are missing'
      });
    }

    // Validate nominal minimum
    if (parseFloat(nominalPinjam) < 100000) {
      return res.status(400).json({
        success: false,
        message: 'Nominal minimum adalah Rp 100.000'
      });
    }

    // Validate bunga
    const bungaPersentase = VALID_BUNGA[jangkaWaktu];
    if (!bungaPersentase) {
      return res.status(400).json({
        success: false,
        message: 'Jangka waktu tidak valid'
      });
    }

    // Normalize phone
    const normalizedPhone = normalizePhoneNumber(phone);

    // Map kategori
    const dbKategori = mapKategoriBarang(kategoriBarang);
    if (!VALID_KATEGORI.includes(dbKategori)) {
      return res.status(400).json({
        success: false,
        message: 'Kategori barang tidak valid'
      });
    }

    // Calculate fee and dates
    const fee = (parseFloat(nominalPinjam) * bungaPersentase) / 100;
    const tanggalPinjam = new Date();
    const tanggalKembali = calculateTanggalKembali(tanggalPinjam, jangkaWaktu);

    // Find or create customer
    let customer = await prisma.customer.findUnique({
      where: { noHp: normalizedPhone }
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          nama: customerName,
          noHp: normalizedPhone,
          fotoKtp: fotoKtp || null
        }
      });
    } else {
      // Update customer name if changed
      if (customer.nama !== customerName) {
        customer = await prisma.customer.update({
          where: { id: customer.id },
          data: { nama: customerName }
        });
      }
    }

    // Create gadai
    const gadai = await prisma.gadai.create({
      data: {
        customerID: customer.id,
        kategoriBarang: dbKategori,
        namaBarang,
        nominalPinjam: parseFloat(nominalPinjam),
        bungaPersentase,
        fee,
        tanggalPinjam,
        tanggalKembali,
        atributTinggal: atributTinggal || '-',
        deskripsi: deskripsi || null,
        fotoBarang,
        fotoPendukung: fotoPendukung || null,
        status: 'PENDING'
      },
      include: { customer: true }
    });

    // Generate WhatsApp notification link (for admin)
    const waMessage = encodeURIComponent(
      `📋 *Pengajuan Gadai Baru*\n\n` +
      `👤 Nama: ${customerName}\n` +
      `📱 HP: ${phone}\n` +
      `📦 Barang: ${namaBarang}\n` +
      `💰 Nominal: Rp ${parseFloat(nominalPinjam).toLocaleString('id-ID')}\n` +
      `📊 Bunga: ${bungaPersentase}%\n` +
      `💵 Fee: Rp ${fee.toLocaleString('id-ID')}\n\n` +
      `Mohon untuk meninjau pengajuan di sistem.`
    );
    const waLink = `https://wa.me/?text=${waMessage}`;

    res.status(201).json({
      success: true,
      message: 'Pengajuan gadai berhasil dikirim. Mohon tunggu konfirmasi dari kami.',
      data: {
        gadaiId: gadai.gadaiID,
        customerId: customer.id,
        status: gadai.status,
        nominalPengajuan: parseFloat(nominalPinjam),
        bungaPersentase,
        fee,
        tanggalKembali: tanggalKembali.toISOString()
      },
      waNotificationLink: waLink
    });
  } catch (error) {
    console.error('Error creating public gadai:', error);
    res.status(500).json({ success: false, message: 'Failed to submit gadai' });
  }
};

// Track gadai by phone
exports.trackGadai = async (req, res) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    const normalizedPhone = normalizePhoneNumber(phone);

    const customer = await prisma.customer.findUnique({
      where: { noHp: normalizedPhone }
    });

    if (!customer) {
      return res.json({
        success: true,
        customer: null,
        pengajuan: []
      });
    }

    const gadais = await prisma.gadai.findMany({
      where: { customerID: customer.id },
      orderBy: { createdAt: 'desc' },
      select: {
        gadaiID: true,
        kategoriBarang: true,
        namaBarang: true,
        nominalPinjam: true,
        bungaPersentase: true,
        fee: true,
        tanggalPinjam: true,
        tanggalKembali: true,
        status: true,
        totalPembayaran: true,
        perpanjanganKe: true
      }
    });

    const pengajuan = gadais.map(g => ({
      gadaiId: g.gadaiID,
      namaBarang: g.namaBarang,
      kategoriBarang: g.kategoriBarang,
      nominalPinjam: parseFloat(g.nominalPinjam),
      bungaPersentase: parseFloat(g.bungaPersentase),
      fee: parseFloat(g.fee),
      nominalPengambilan: parseFloat(g.nominalPinjam) + parseFloat(g.fee),
      tanggalPengajuan: g.tanggalPinjam,
      tanggalKembali: g.tanggalKembali,
      status: g.status,
      statusLabel: getStatusLabel(g.status),
      statusColor: getStatusColor(g.status),
      perpanjanganKe: g.perpanjanganKe,
      totalPembayaran: parseFloat(g.totalPembayaran)
    }));

    res.json({
      success: true,
      customer: {
        customerId: customer.id,
        customerName: customer.nama,
        phone: customer.noHp
      },
      pengajuan
    });
  } catch (error) {
    console.error('Error tracking gadai:', error);
    res.status(500).json({ success: false, message: 'Failed to track gadai' });
  }
};

// Get single gadai detail by ID (public, with phone verification)
exports.getPublicGadaiDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const { phone } = req.query;

    const gadai = await prisma.gadai.findUnique({
      where: { gadaiID: parseInt(id) },
      include: { customer: true }
    });

    if (!gadai) {
      return res.status(404).json({ success: false, message: 'Gadai not found' });
    }

    // If phone is provided, verify ownership
    if (phone) {
      const normalizedPhone = normalizePhoneNumber(phone);
      if (gadai.customer.noHp !== normalizedPhone) {
        return res.status(403).json({ success: false, message: 'Phone number does not match' });
      }
    }

    res.json({
      success: true,
      data: {
        gadaiId: gadai.gadaiID,
        customerName: gadai.customer.nama,
        phone: gadai.customer.noHp,
        kategoriBarang: gadai.kategoriBarang,
        namaBarang: gadai.namaBarang,
        nominalPinjam: parseFloat(gadai.nominalPinjam),
        bungaPersentase: parseFloat(gadai.bungaPersentase),
        fee: parseFloat(gadai.fee),
        nominalPengambilan: parseFloat(gadai.nominalPinjam) + parseFloat(gadai.fee),
        tanggalPinjam: gadai.tanggalPinjam,
        tanggalKembali: gadai.tanggalKembali,
        atributTinggal: gadai.atributTinggal,
        deskripsi: gadai.deskripsi,
        status: gadai.status,
        statusLabel: getStatusLabel(gadai.status),
        statusColor: getStatusColor(gadai.status),
        totalPembayaran: parseFloat(gadai.totalPembayaran)
      }
    });
  } catch (error) {
    console.error('Error getting public gadai detail:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch gadai' });
  }
};
