export const accountService = {
  downloadStatement: async (clientName: string): Promise<void> => {
    // Simulando latencia de APIM para generar el reporte consolidado
    await new Promise(r => setTimeout(r, 1500));
    
    // Generación de un Blob real para simular el PDF de Estado de Cuenta
    const content = `SAGRISA - ESTADO DE CUENTA CONSOLIDADO\n\n` +
      `Cliente: ${clientName}\n` +
      `Fecha: ${new Date().toLocaleDateString()}\n\n` +
      `Resumen de Cartera:\n` +
      `- Total Adeudado: $580,000.00\n` +
      `- Crédito Disponible: $420,000.00\n` +
      `- Facturas Pendientes: 3\n\n` +
      `Antigüedad de Saldos:\n` +
      `- 0 a 30 días: $350,000.00\n` +
      `- 31 a 60 días: $130,000.00\n` +
      `- 61 a 90 días: $80,000.00\n` +
      `- 91 a 120 días: $20,000.00\n\n` +
      `Este documento es generado automáticamente por la PWA SAGRISA.`;
      
    const blob = new Blob([content], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SAGRISA_Estado_Cuenta_${clientName.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },

  sendByEmail: async (email: string): Promise<void> => {
    // Simulación de envío por Email (vía backend C#)
    await new Promise(r => setTimeout(r, 1000));
    console.log(`[Email] Estado de cuenta enviado a: ${email}`);
  }
};
