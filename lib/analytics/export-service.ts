import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import type { RevenueAnalytics } from '@/lib/analytics/revenue-analytics-service';

export class AnalyticsExportService {
  
  /**
   * Export analytics data as CSV
   */
  static exportToCSV(data: RevenueAnalytics, filename: string = 'revenue-analytics') {
    const csvContent = this.generateCSVContent(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  }

  /**
   * Export current view as PDF
   */
  static async exportToPDF(elementId: string, filename: string = 'revenue-analytics-report') {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error('Element not found');
      }

      // Create canvas from the element
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const imgData = canvas.toDataURL('image/png');
      
      // Add title page
      pdf.setFontSize(20);
      pdf.text('Revenue Analytics Report', 20, 30);
      pdf.setFontSize(12);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 40);
      
      // Add chart image (split across pages if needed)
      let position = 50;
      if (imgHeight > 200) {
        // Split into multiple pages if too tall
        const pageHeight = 240; // Available height per page
        let remainingHeight = imgHeight;
        let sourceY = 0;
        
        while (remainingHeight > 0) {
          const currentHeight = Math.min(pageHeight, remainingHeight);
          const currentCanvas = document.createElement('canvas');
          currentCanvas.width = canvas.width;
          currentCanvas.height = (currentHeight * canvas.width) / imgWidth;
          
          const ctx = currentCanvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(
              canvas,
              0, sourceY,
              canvas.width, (currentHeight * canvas.width) / imgWidth,
              0, 0,
              canvas.width, currentCanvas.height
            );
            
            const pageImgData = currentCanvas.toDataURL('image/png');
            pdf.addImage(pageImgData, 'PNG', 0, position, imgWidth, currentHeight);
          }
          
          remainingHeight -= currentHeight;
          sourceY += (currentHeight * canvas.width) / imgWidth;
          
          if (remainingHeight > 0) {
            pdf.addPage();
            position = 10;
          }
        }
      } else {
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      }
      
      // Save the PDF
      pdf.save(`${filename}-${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('PDF export failed:', error);
      throw new Error('Failed to export PDF');
    }
  }

  /**
   * Export analytics data as Excel format (CSV with Excel headers)
   */
  static exportToExcel(data: RevenueAnalytics, filename: string = 'revenue-analytics') {
    const csvContent = this.generateExcelCSVContent(data);
    const blob = new Blob(['\ufeff' + csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });
    saveAs(blob, `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  }

  /**
   * Export analytics data as JSON
   */
  static exportToJSON(data: RevenueAnalytics, filename: string = 'revenue-analytics') {
    const payload = {
      generatedAt: new Date().toISOString(),
      summary: this.generateSummaryData(data),
      analytics: data,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8;',
    });

    saveAs(blob, `${filename}-${new Date().toISOString().split('T')[0]}.json`);
  }

  /**
   * Generate CSV content from analytics data
   */
  private static generateCSVContent(data: RevenueAnalytics): string {
    const lines = [];
    
    // Header
    lines.push('Revenue Analytics Report');
    lines.push(`Generated on: ${new Date().toLocaleDateString()}`);
    lines.push('');
    
    // Key Metrics
    lines.push('KEY METRICS');
    lines.push('Metric,Value');
    lines.push(`Total Revenue,$${data.metrics.totalRevenue.toLocaleString()}`);
    lines.push(`Pipeline Value,$${data.metrics.pipelineValue.toLocaleString()}`);
    lines.push(`Active Deals,${data.metrics.activeDeals}`);
    lines.push(`Conversion Rate,${data.metrics.conversionRate.toFixed(1)}%`);
    lines.push(`Average Deal Size,$${data.metrics.averageDealSize.toLocaleString()}`);
    lines.push(`Monthly Recurring Revenue,$${data.metrics.monthlyRecurring.toLocaleString()}`);
    lines.push('');
    
    // Lead Sources
    lines.push('LEAD SOURCES PERFORMANCE');
    lines.push('Source,Total Leads,Qualified Leads,Converted,Conversion Rate,Revenue');
    data.leadSources.forEach(source => {
      lines.push(`${source.source},${source.leads},${source.qualified},${source.converted},${source.conversionRate.toFixed(1)}%,$${source.revenue.toLocaleString()}`);
    });
    lines.push('');
    
    // Activities
    lines.push('ACTIVITIES');
    lines.push('Activity,Count');
    lines.push(`Emails Sent,${data.activities.emailsSent}`);
    lines.push(`Emails Opened,${data.activities.emailsOpened}`);
    lines.push(`Emails Replied,${data.activities.emailsReplied}`);
    lines.push(`LinkedIn Connections,${data.activities.linkedinConnections}`);
    lines.push(`LinkedIn Accepted,${data.activities.linkedinAccepted}`);
    lines.push(`Calls Scheduled,${data.activities.callsScheduled}`);
    lines.push(`Proposals Sent,${data.activities.proposalsSent}`);
    lines.push('');
    
    // Pipeline
    lines.push('PIPELINE');
    lines.push('Client,Value,Stage,Probability,Expected Close Date,Source');
    data.pipeline.forEach(deal => {
      lines.push(`${deal.clientName},$${deal.value.toLocaleString()},${deal.stage},${deal.probability}%,${deal.expectedCloseDate},${deal.source}`);
    });
    lines.push('');
    
    // Forecast
    lines.push('FORECAST');
    lines.push('Quarter,Projected Revenue');
    lines.push(`Q1,$${data.forecast.q1.toLocaleString()}`);
    lines.push(`Q2,$${data.forecast.q2.toLocaleString()}`);
    lines.push(`Q3,$${data.forecast.q3.toLocaleString()}`);
    lines.push(`Q4,$${data.forecast.q4.toLocaleString()}`);
    
    return lines.join('\n');
  }

  /**
   * Generate Excel-compatible CSV content
   */
  private static generateExcelCSVContent(data: RevenueAnalytics): string {
    const lines = [];
    
    // Excel-friendly format with proper escaping
    const escapeCSV = (value: string | number) => {
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };
    
    // Summary Sheet
    lines.push(escapeCSV('Revenue Analytics Report'));
    lines.push(escapeCSV(`Generated: ${new Date().toLocaleDateString()}`));
    lines.push('');
    
    // Key Metrics Table
    lines.push('Key Metrics');
    lines.push('Metric,Value');
    lines.push(`${escapeCSV('Total Revenue')},${data.metrics.totalRevenue}`);
    lines.push(`${escapeCSV('Pipeline Value')},${data.metrics.pipelineValue}`);
    lines.push(`${escapeCSV('Active Deals')},${data.metrics.activeDeals}`);
    lines.push(`${escapeCSV('Conversion Rate')},${data.metrics.conversionRate}`);
    lines.push(`${escapeCSV('Average Deal Size')},${data.metrics.averageDealSize}`);
    lines.push(`${escapeCSV('Monthly Recurring')},${data.metrics.monthlyRecurring}`);
    lines.push('');
    
    // Lead Sources Table
    lines.push('Lead Sources Performance');
    lines.push('Source,Total Leads,Qualified,Converted,Conversion Rate %,Revenue');
    data.leadSources.forEach(source => {
      lines.push([
        escapeCSV(source.source),
        source.leads,
        source.qualified,
        source.converted,
        source.conversionRate.toFixed(1),
        source.revenue
      ].join(','));
    });
    lines.push('');
    
    // Pipeline Table
    lines.push('Pipeline Details');
    lines.push('Client,Value,Stage,Probability %,Close Date,Source');
    data.pipeline.forEach(deal => {
      lines.push([
        escapeCSV(deal.clientName),
        deal.value,
        escapeCSV(deal.stage),
        deal.probability,
        escapeCSV(deal.expectedCloseDate),
        escapeCSV(deal.source)
      ].join(','));
    });
    
    return lines.join('\n');
  }

  /**
   * Generate summary report data for sharing
   */
  static generateSummaryData(data: RevenueAnalytics) {
    return {
      summary: {
        totalRevenue: data.metrics.totalRevenue,
        pipelineValue: data.metrics.pipelineValue,
        activeDeals: data.metrics.activeDeals,
        conversionRate: data.metrics.conversionRate,
        generatedAt: new Date().toISOString()
      },
      topPerformingSources: data.leadSources
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 3)
        .map(source => ({
          name: source.source,
          revenue: source.revenue,
          conversionRate: source.conversionRate
        })),
      upcomingDeals: data.pipeline
        .filter(deal => deal.stage !== 'closed-won' && deal.stage !== 'closed-lost')
        .sort((a, b) => new Date(a.expectedCloseDate).getTime() - new Date(b.expectedCloseDate).getTime())
        .slice(0, 5)
        .map(deal => ({
          client: deal.clientName,
          value: deal.value,
          stage: deal.stage,
          closeDate: deal.expectedCloseDate
        }))
    };
  }
}
