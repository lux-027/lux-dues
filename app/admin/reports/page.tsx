'use client';

import { useState, useEffect } from 'react';
import { Download, FileText, Table, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface ReportData {
  buildingId: string;
  buildingName: string;
  blockName: string;
  doorNo: string;
  ownerName: string;
  amount: number;
  month: number;
  year: number;
  status: 'PAID' | 'UNPAID';
  dueDate: string;
  paidDate?: string;
}

interface Building {
  id: string;
  name: string;
}

export default function ReportsPage() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(false);

  const months = [
    { value: 1, label: 'Ocak' },
    { value: 2, label: 'Şubat' },
    { value: 3, label: 'Mart' },
    { value: 4, label: 'Nisan' },
    { value: 5, label: 'Mayıs' },
    { value: 6, label: 'Haziran' },
    { value: 7, label: 'Temmuz' },
    { value: 8, label: 'Ağustos' },
    { value: 9, label: 'Eylül' },
    { value: 10, label: 'Ekim' },
    { value: 11, label: 'Kasım' },
    { value: 12, label: 'Aralık' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    try {
      const res = await fetch('/api/buildings');
      if (res.ok) {
        const data = await res.json();
        setBuildings(data);
        if (data.length > 0) {
          setSelectedBuilding(data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch buildings:', error);
    }
  };

  const generateReport = async () => {
    if (!selectedBuilding) return;

    setLoading(true);
    try {
      const res = await fetch(
        `/api/reports/dues?buildingId=${selectedBuilding}&year=${selectedYear}&month=${selectedMonth}`
      );
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBuilding) {
      generateReport();
    }
  }, [selectedBuilding, selectedYear, selectedMonth]);

  const totalAmount = reportData.reduce((sum, item) => sum + item.amount, 0);
  const paidAmount = reportData
    .filter((item) => item.status === 'PAID')
    .reduce((sum, item) => sum + item.amount, 0);
  const unpaidAmount = totalAmount - paidAmount;
  const paidCount = reportData.filter((item) => item.status === 'PAID').length;
  const unpaidCount = reportData.filter((item) => item.status === 'UNPAID').length;

  const exportToCSV = () => {
    const headers = ['Bina', 'Blok', 'Daire', 'Sahibi', 'Tutar', 'Ay', 'Yıl', 'Durum', 'Son Ödeme', 'Ödeme Tarihi'];
    const rows = reportData.map((item) => [
      item.buildingName,
      item.blockName,
      item.doorNo,
      item.ownerName,
      item.amount.toFixed(2),
      item.month,
      item.year,
      item.status === 'PAID' ? 'Ödendi' : 'Ödenmedi',
      new Date(item.dueDate).toLocaleDateString('tr-TR'),
      item.paidDate ? new Date(item.paidDate).toLocaleDateString('tr-TR') : '-',
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `aidat-raporu-${selectedYear}-${selectedMonth}.csv`;
    link.click();
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const monthName = months.find((m) => m.value === selectedMonth)?.label || '';
    
    doc.setFontSize(18);
    doc.text('Aidat Raporu', 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Bina: ${buildings.find((b) => b.id === selectedBuilding)?.name}`, 14, 32);
    doc.text(`Dönem: ${monthName} ${selectedYear}`, 14, 40);
    
    doc.setFontSize(10);
    doc.text(`Toplam Tutar: ₺${totalAmount.toFixed(2)}`, 14, 50);
    doc.text(`Ödenen: ₺${paidAmount.toFixed(2)} (${paidCount} daire)`, 14, 58);
    doc.text(`Ödenmeyen: ₺${unpaidAmount.toFixed(2)} (${unpaidCount} daire)`, 14, 66);

    const tableData = reportData.map((item) => [
      item.buildingName,
      item.blockName,
      item.doorNo,
      item.ownerName,
      `₺${item.amount.toFixed(2)}`,
      item.status === 'PAID' ? 'Ödendi' : 'Ödenmedi',
      new Date(item.dueDate).toLocaleDateString('tr-TR'),
      item.paidDate ? new Date(item.paidDate).toLocaleDateString('tr-TR') : '-',
    ]);

    autoTable(doc, {
      head: [['Bina', 'Blok', 'Daire', 'Sahibi', 'Tutar', 'Durum', 'Son Ödeme', 'Ödeme Tarihi']],
      body: tableData,
      startY: 75,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [24, 24, 27] },
    });

    doc.save(`aidat-raporu-${selectedYear}-${selectedMonth}.pdf`);
  };

  const exportToExcel = () => {
    const worksheetData = [
      ['Aidat Raporu'],
      [`Bina: ${buildings.find((b) => b.id === selectedBuilding)?.name}`],
      [`Dönem: ${months.find((m) => m.value === selectedMonth)?.label} ${selectedYear}`],
      [],
      ['Toplam Tutar', `₺${totalAmount.toFixed(2)}`],
      ['Ödenen', `₺${paidAmount.toFixed(2)} (${paidCount} daire)`],
      ['Ödenmeyen', `₺${unpaidAmount.toFixed(2)} (${unpaidCount} daire)`],
      [],
      ['Bina', 'Blok', 'Daire', 'Sahibi', 'Tutar', 'Ay', 'Yıl', 'Durum', 'Son Ödeme', 'Ödeme Tarihi'],
      ...reportData.map((item) => [
        item.buildingName,
        item.blockName,
        item.doorNo,
        item.ownerName,
        item.amount,
        item.month,
        item.year,
        item.status === 'PAID' ? 'Ödendi' : 'Ödenmedi',
        new Date(item.dueDate).toLocaleDateString('tr-TR'),
        item.paidDate ? new Date(item.paidDate).toLocaleDateString('tr-TR') : '-',
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rapor');
    XLSX.writeFile(workbook, `aidat-raporu-${selectedYear}-${selectedMonth}.xlsx`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Aidat Raporları</h1>
        <p className="text-sm text-zinc-500 mt-1">Bina bazlı aidat ödeme durumları ve özetler</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Bina
            </label>
            <select
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
            >
              {buildings.map((building) => (
                <option key={building.id} value={building.id}>
                  {building.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Yıl
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Ay
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-zinc-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Toplam Tutar</p>
              <p className="text-2xl font-bold text-zinc-900 mt-2">₺{totalAmount.toFixed(2)}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center">
              <Table className="h-5 w-5 text-zinc-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Ödenen</p>
              <p className="text-2xl font-bold text-green-600 mt-2">₺{paidAmount.toFixed(2)}</p>
              <p className="text-xs text-zinc-400 mt-1">{paidCount} daire</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <Download className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Ödenmeyen</p>
              <p className="text-2xl font-bold text-red-600 mt-2">₺{unpaidAmount.toFixed(2)}</p>
              <p className="text-xs text-zinc-400 mt-1">{unpaidCount} daire</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
              <FileText className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Ödeme Oranı</p>
              <p className="text-2xl font-bold text-zinc-900 mt-2">
                {totalAmount > 0 ? ((paidAmount / totalAmount) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Download className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex justify-end gap-2 mb-4">
        <Button onClick={exportToCSV} disabled={loading || reportData.length === 0} variant="secondary">
          <Download className="h-4 w-4 mr-2" />
          CSV
        </Button>
        <Button onClick={exportToPDF} disabled={loading || reportData.length === 0} variant="secondary">
          <FileText className="h-4 w-4 mr-2" />
          PDF
        </Button>
        <Button onClick={exportToExcel} disabled={loading || reportData.length === 0}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Excel
        </Button>
      </div>

      {/* Report Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-zinc-500">Yükleniyor...</div>
        ) : reportData.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">Rapor verisi bulunmuyor</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Bina
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Blok
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Daire
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Sahibi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Tutar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Son Ödeme
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Ödeme Tarihi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {reportData.map((item, index) => (
                  <tr key={index} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-zinc-900">{item.buildingName}</td>
                    <td className="px-6 py-4 text-sm text-zinc-600">{item.blockName}</td>
                    <td className="px-6 py-4 text-sm text-zinc-600">{item.doorNo}</td>
                    <td className="px-6 py-4 text-sm text-zinc-900 font-medium">{item.ownerName}</td>
                    <td className="px-6 py-4 text-sm text-zinc-900 font-semibold">₺{item.amount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.status === 'PAID'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {item.status === 'PAID' ? 'Ödendi' : 'Ödenmedi'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600">
                      {new Date(item.dueDate).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600">
                      {item.paidDate ? new Date(item.paidDate).toLocaleDateString('tr-TR') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
