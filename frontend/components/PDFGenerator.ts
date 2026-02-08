
import { jsPDF } from 'jspdf';
import { EntryExitRecord, Complaint } from '../types';

export const generateFeeReceipt = (data: { id: string, name: string, room: string, month: string, amount: number }) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(79, 70, 229); // Indigo
  doc.text('HostelEase Fee Receipt', 20, 30);
  
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text(`Receipt ID: ${data.id}`, 20, 45);
  doc.text(`Payment Date: ${new Date().toLocaleDateString('en-IN')}`, 150, 45);
  
  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.line(20, 50, 190, 50);
  
  // Details
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text('Student Information', 20, 60);
  
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(`Name: ${data.name}`, 20, 70);
  doc.text(`Hostel Room: ${data.room}`, 20, 80);
  
  doc.text('Billing Cycle', 120, 60);
  doc.text(data.month, 120, 70);
  
  // Table
  doc.setFillColor(248, 250, 252);
  doc.rect(20, 100, 170, 40, 'F');
  
  doc.setFontSize(14);
  doc.text('Amount Received (INR)', 30, 125);
  doc.setFontSize(18);
  doc.text(`Rs. ${data.amount.toLocaleString('en-IN')}`, 140, 125);
  
  // Footer
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('This is a computer-generated receipt. No physical signature required.', 20, 280);
  doc.text('Hostel Administration', 150, 280);
  
  doc.save(`FeeReceipt_${data.id}.pdf`);
};

export const exportStudentList = (students: any[]) => {
  const doc = new jsPDF();
  doc.setFontSize(22);
  doc.text('Hostel Student Directory', 20, 30);
  doc.setFontSize(12);
  doc.text(`Total Registered Students: ${students.length}`, 20, 40);
  
  let y = 60;
  students.forEach((s, i) => {
    if (y > 270) {
      doc.addPage();
      y = 30;
    }
    doc.text(`${i + 1}. ${s.name} (Roll: ${s.roll || s.studentId}) - Room: ${s.room || s.roomNumber}`, 20, y);
    y += 10;
  });
  
  doc.save('StudentDirectory.pdf');
};

export const exportEntryExitLogs = (logs: EntryExitRecord[]) => {
  const doc = new jsPDF();
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.text('Hostel Gate Control Report', 20, 30);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Report Generated: ${new Date().toLocaleString('en-IN')}`, 20, 40);
  
  doc.setDrawColor(226, 232, 240);
  doc.line(20, 45, 190, 45);

  let y = 60;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Student Name', 20, y);
  doc.text('Roll No', 70, y);
  doc.text('Time', 110, y);
  doc.text('Status', 160, y);
  y += 10;
  
  doc.setFont('helvetica', 'normal');
  logs.forEach((log) => {
    if (y > 280) {
      doc.addPage();
      y = 30;
    }
    doc.text(log.studentName, 20, y);
    doc.text(log.studentId, 70, y);
    doc.text(log.time, 110, y);
    const statusText = log.status.toString();
    doc.text(statusText, 160, y);
    y += 8;
  });

  doc.save(`GateReport_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportComplaintReport = (complaints: any[]) => {
  const doc = new jsPDF();
  doc.setFontSize(22);
  doc.setTextColor(79, 70, 229);
  doc.text('Hostel Maintenance Report', 20, 30);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 20, 40);
  
  let y = 60;
  complaints.forEach((c, i) => {
    if (y > 250) {
      doc.addPage();
      y = 30;
    }
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(`${c.id}: ${c.title}`, 20, y);
    y += 7;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    const reporterName = c?.student?.name || c?.studentName || 'Unknown';
    const reporterRoom = c?.student?.room || c?.room || 'N/A';
    doc.text(`Reporter: ${reporterName} (Room ${reporterRoom}) | Status: ${c.status} | Category: ${c.category}`, 20, y);
    y += 12;
  });
  
  doc.save(`MaintenanceReport_${new Date().toISOString().split('T')[0]}.pdf`);
};
