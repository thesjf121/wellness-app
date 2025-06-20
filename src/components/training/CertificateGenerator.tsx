import React, { useRef, useState } from 'react';
import { ModuleCertificate, TrainingModule, UserModuleProgress } from '../../types/training';
import { wellnessTrainingService } from '../../services/wellnessTrainingService';

interface CertificateGeneratorProps {
  certificate: ModuleCertificate;
  module: TrainingModule;
  userName: string;
  onClose: () => void;
}

export const CertificateGenerator: React.FC<CertificateGeneratorProps> = ({
  certificate,
  module,
  userName,
  onClose
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;
    
    setDownloading(true);
    
    try {
      // Create canvas from the certificate div
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size (A4 landscape)
      canvas.width = 1123; // 297mm at 96 DPI
      canvas.height = 794; // 210mm at 96 DPI

      // White background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Border
      ctx.strokeStyle = '#1e40af';
      ctx.lineWidth = 10;
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

      // Inner border
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

      // Title
      ctx.font = 'bold 48px serif';
      ctx.fillStyle = '#1e40af';
      ctx.textAlign = 'center';
      ctx.fillText('Certificate of Completion', canvas.width / 2, 150);

      // Subtitle
      ctx.font = '24px serif';
      ctx.fillStyle = '#4b5563';
      ctx.fillText('This is to certify that', canvas.width / 2, 220);

      // Name
      ctx.font = 'bold 36px serif';
      ctx.fillStyle = '#111827';
      ctx.fillText(userName, canvas.width / 2, 280);

      // Completion text
      ctx.font = '24px serif';
      ctx.fillStyle = '#4b5563';
      ctx.fillText('has successfully completed', canvas.width / 2, 340);

      // Module title
      ctx.font = 'bold 32px serif';
      ctx.fillStyle = '#1e40af';
      const moduleText = `Module ${module.number}: ${module.title}`;
      ctx.fillText(moduleText, canvas.width / 2, 400);

      // Program name
      ctx.font = '20px serif';
      ctx.fillStyle = '#6b7280';
      ctx.fillText('Wellness Coaching Training Program', canvas.width / 2, 450);

      // Date
      ctx.font = '18px serif';
      ctx.fillText(`Completed on ${formatDate(certificate.issuedAt)}`, canvas.width / 2, 520);

      // Certificate number
      ctx.font = '14px monospace';
      ctx.fillStyle = '#9ca3af';
      ctx.fillText(`Certificate No: ${certificate.certificateNumber}`, canvas.width / 2, 580);

      // Signature line
      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - 150, 650);
      ctx.lineTo(canvas.width / 2 + 150, 650);
      ctx.stroke();

      ctx.font = '16px serif';
      ctx.fillStyle = '#6b7280';
      ctx.fillText('Program Director', canvas.width / 2, 680);

      // Achievement stats
      if (certificate.metadata) {
        ctx.font = '14px sans-serif';
        ctx.fillStyle = '#6b7280';
        ctx.textAlign = 'left';
        
        const stats = [
          `Duration: ${Math.round(certificate.metadata.completionTime / 60000)} minutes`,
          `Exercises Completed: ${certificate.metadata.exercisesCompleted}/${certificate.metadata.totalExercises}`
        ];
        
        stats.forEach((stat, index) => {
          ctx.fillText(stat, 80, 700 + (index * 20));
        });
      }

      // Logo/Brand
      ctx.textAlign = 'center';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = '#3b82f6';
      ctx.fillText('Wellness App', canvas.width / 2, 740);

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) return;
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificate-module-${module.number}-${certificate.certificateNumber}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        setDownloading(false);
      }, 'image/png', 1.0);

    } catch (error) {
      console.error('Failed to generate certificate:', error);
      setDownloading(false);
      alert('Failed to generate certificate. Please try again.');
    }
  };

  const printCertificate = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Your Certificate
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Certificate Preview */}
        <div className="p-8 bg-gray-50">
          <div 
            ref={certificateRef}
            className="bg-white mx-auto shadow-lg certificate-preview"
            style={{
              width: '842px',
              height: '595px',
              padding: '60px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Certificate Border */}
            <div className="absolute inset-4 border-4 border-blue-800 rounded-lg"></div>
            <div className="absolute inset-6 border border-blue-600 rounded-lg"></div>

            {/* Certificate Content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center space-y-4">
              {/* Title */}
              <h1 className="text-4xl font-bold text-blue-800 mb-4" style={{ fontFamily: 'serif' }}>
                Certificate of Completion
              </h1>

              {/* Subtitle */}
              <p className="text-xl text-gray-600" style={{ fontFamily: 'serif' }}>
                This is to certify that
              </p>

              {/* Name */}
              <h2 className="text-3xl font-bold text-gray-900 my-4" style={{ fontFamily: 'serif' }}>
                {userName}
              </h2>

              {/* Completion Text */}
              <p className="text-xl text-gray-600" style={{ fontFamily: 'serif' }}>
                has successfully completed
              </p>

              {/* Module Title */}
              <h3 className="text-2xl font-bold text-blue-800 my-4" style={{ fontFamily: 'serif' }}>
                Module {module.number}: {module.title}
              </h3>

              {/* Program Name */}
              <p className="text-lg text-gray-700" style={{ fontFamily: 'serif' }}>
                Wellness Coaching Training Program
              </p>

              {/* Date */}
              <p className="text-md text-gray-600 mt-6" style={{ fontFamily: 'serif' }}>
                Completed on {formatDate(certificate.issuedAt)}
              </p>

              {/* Certificate Number */}
              <p className="text-sm text-gray-500 mt-4" style={{ fontFamily: 'monospace' }}>
                Certificate No: {certificate.certificateNumber}
              </p>

              {/* Signature Section */}
              <div className="mt-12 w-64">
                <div className="border-b border-gray-400"></div>
                <p className="text-sm text-gray-600 mt-2" style={{ fontFamily: 'serif' }}>
                  Program Director
                </p>
              </div>

              {/* Achievement Stats */}
              {certificate.metadata && (
                <div className="absolute bottom-8 left-8 text-left text-xs text-gray-600">
                  <p>Duration: {Math.round(certificate.metadata.completionTime / 60000)} minutes</p>
                  <p>Exercises Completed: {certificate.metadata.exercisesCompleted}/{certificate.metadata.totalExercises}</p>
                </div>
              )}

              {/* Logo */}
              <div className="absolute bottom-8 right-8">
                <p className="text-sm font-bold text-blue-600">Wellness App</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center p-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Certificate ID: {certificate.certificateNumber}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={printCertificate}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              🖨️ Print
            </button>
            <button
              onClick={downloadCertificate}
              disabled={downloading}
              className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                downloading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {downloading ? 'Generating...' : '📥 Download'}
            </button>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .certificate-preview, .certificate-preview * {
            visibility: visible;
          }
          .certificate-preview {
            position: absolute;
            left: 0;
            top: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default CertificateGenerator;