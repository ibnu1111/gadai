const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { updateStatusBasedOnDueDate } = require('../utils/helpers');

// Process payment
exports.processPayment = async (req, res) => {
  try {
    const { gadaiID, jumlahBayar, catatan } = req.body;

    if (!gadaiID || !jumlahBayar) {
      return res.status(400).json({ success: false, message: 'gadaiID and jumlahBayar are required' });
    }

    const gadai = await prisma.gadai.findUnique({
      where: { gadaiID: parseInt(gadaiID) }
    });

    if (!gadai) {
      return res.status(404).json({ success: false, message: 'Gadai not found' });
    }

    if (gadai.status === 'LUNAS' || gadai.status === 'DITOLAK' || gadai.status === 'DIPERPANJANG') {
      return res.status(400).json({
        success: false,
        message: `Cannot process payment for gadai with status ${gadai.status}`
      });
    }

    const nominalBayar = parseFloat(jumlahBayar);
    const totalKembali = parseFloat(gadai.nominalPinjam) + parseFloat(gadai.fee);
    const newTotalPembayaran = parseFloat(gadai.totalPembayaran) + nominalBayar;

    // Determine new status
    let newStatus = gadai.status;
    if (newTotalPembayaran >= totalKembali) {
      newStatus = 'LUNAS';
    } else {
      // Check if due date has passed
      newStatus = updateStatusBasedOnDueDate(gadai.status, gadai.tanggalKembali);
    }

    // Update gadai
    await prisma.gadai.update({
      where: { gadaiID: parseInt(gadaiID) },
      data: {
        totalPembayaran: newTotalPembayaran,
        status: newStatus
      }
    });

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        gadaiID: parseInt(gadaiID),
        jumlahBayar: nominalBayar,
        tipeBayar: 'BAYAR',
        catatan: catatan || null,
        createdBy: req.admin?.nama || 'System'
      }
    });

    res.json({
      success: true,
      message: newStatus === 'LUNAS'
        ? 'Gadai telah lunas!'
        : 'Pembayaran berhasil diproses',
      data: {
        paymentId: payment.id,
        jumlahBayar: nominalBayar,
        totalPembayaran: newTotalPembayaran,
        totalKembali,
        sisa: Math.max(0, totalKembali - newTotalPembayaran),
        status: newStatus
      }
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ success: false, message: 'Failed to process payment' });
  }
};

// Extend gadai (perpanjangan)
exports.extendGadai = async (req, res) => {
  try {
    const { gadaiID, extensionPeriod, feePayment, newFee } = req.body;

    if (!gadaiID || !extensionPeriod || !feePayment) {
      return res.status(400).json({
        success: false,
        message: 'gadaiID, extensionPeriod, and feePayment are required'
      });
    }

    const VALID_PERIODS = ['2_WEEKS', '1_MONTH'];
    if (!VALID_PERIODS.includes(extensionPeriod)) {
      return res.status(400).json({
        success: false,
        message: `extensionPeriod must be one of: ${VALID_PERIODS.join(', ')}`
      });
    }

    const existing = await prisma.gadai.findUnique({
      where: { gadaiID: parseInt(gadaiID) },
      include: { customer: true }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Gadai not found' });
    }

    const validStatuses = ['AKTIF', 'JATUH_TEMPO', 'OVERDUE'];
    if (!validStatuses.includes(existing.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot extend gadai with status ${existing.status}`
      });
    }

    // Validate fee payment
    const minFee = parseFloat(existing.fee);
    if (parseFloat(feePayment) < minFee) {
      return res.status(400).json({
        success: false,
        message: `Fee payment must be at least Rp ${minFee.toLocaleString('id-ID')}`
      });
    }

    // Calculate new return date from old return date (not from today)
    const oldTanggalKembali = new Date(existing.tanggalKembali);
    let newTanggalKembali;
    if (extensionPeriod === '2_WEEKS') {
      newTanggalKembali = new Date(oldTanggalKembali);
      newTanggalKembali.setDate(newTanggalKembali.getDate() + 14);
    } else {
      newTanggalKembali = new Date(oldTanggalKembali);
      newTanggalKembali.setMonth(newTanggalKembali.getMonth() + 1);
    }

    // Calculate new fee
    const bungaNominal = newFee ? parseFloat(newFee) : parseFloat(existing.fee);

    // Update old gadai to DIPERPANJANG
    await prisma.gadai.update({
      where: { gadaiID: parseInt(gadaiID) },
      data: {
        status: 'DIPERPANJANG',
        totalPembayaran: parseFloat(existing.fee)
      }
    });

    // Create payment record for extension fee
    await prisma.payment.create({
      data: {
        gadaiID: parseInt(gadaiID),
        jumlahBayar: parseFloat(feePayment),
        tipeBayar: 'PERPANJANG',
        catatan: `Perpanjangan ke ${existing.perpanjanganKe + 1}`,
        createdBy: req.admin?.nama || 'System'
      }
    });

    // Create new gadai (extension)
    const newGadai = await prisma.gadai.create({
      data: {
        customerID: existing.customerID,
        kategoriBarang: existing.kategoriBarang,
        namaBarang: existing.namaBarang,
        nominalPinjam: parseFloat(existing.nominalPinjam),
        bungaPersentase: parseFloat(existing.bungaPersentase),
        fee: bungaNominal,
        tanggalPinjam: new Date(),
        tanggalKembali: newTanggalKembali,
        atributTinggal: existing.atributTinggal,
        deskripsi: existing.deskripsi,
        fotoBarang: existing.fotoBarang,
        fotoPendukung: existing.fotoPendukung,
        status: 'AKTIF',
        parentGadaiID: parseInt(gadaiID),
        perpanjanganKe: existing.perpanjanganKe + 1,
        createdBy: req.admin?.nama || 'System'
      },
      include: { customer: true }
    });

    res.json({
      success: true,
      message: `Perpanjangan berhasil. Gadai baru #${newGadai.gadaiID} telah dibuat.`,
      data: {
        oldGadaiId: parseInt(gadaiID),
        newGadaiId: newGadai.gadaiID,
        newTanggalKembali: newGadai.tanggalKembali,
        newFee: bungaNominal
      }
    });
  } catch (error) {
    console.error('Error extending gadai:', error);
    res.status(500).json({ success: false, message: 'Failed to extend gadai' });
  }
};

// Get payment history for a gadai
exports.getPaymentHistory = async (req, res) => {
  try {
    const { gadaiId } = req.params;

    const gadai = await prisma.gadai.findUnique({
      where: { gadaiID: parseInt(gadaiId) }
    });

    if (!gadai) {
      return res.status(404).json({ success: false, message: 'Gadai not found' });
    }

    const payments = await prisma.payment.findMany({
      where: { gadaiID: parseInt(gadaiId) },
      orderBy: { createdAt: 'desc' }
    });

    const totalKembali = parseFloat(gadai.nominalPinjam) + parseFloat(gadai.fee);

    res.json({
      success: true,
      data: {
        gadai: {
          gadaiID: gadai.gadaiID,
          nominalPinjam: parseFloat(gadai.nominalPinjam),
          fee: parseFloat(gadai.fee),
          totalKembali,
          totalPembayaran: parseFloat(gadai.totalPembayaran),
          sisa: Math.max(0, totalKembali - parseFloat(gadai.totalPembayaran)),
          status: gadai.status
        },
        payments
      }
    });
  } catch (error) {
    console.error('Error getting payment history:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payment history' });
  }
};
