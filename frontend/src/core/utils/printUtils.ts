export const printTicket = (ticket: any) => {
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  document.body.appendChild(iframe);

  const formatMoney = (val: string | number) => parseFloat(val as string).toFixed(2);
  const now = new Date().toLocaleString("es-PE");

  const html = `
    <html>
    <head>
      <style>
        body { font-family: 'Courier New', Courier, monospace; font-size: 12px; margin: 0; padding: 10px; width: 300px; color: #000; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .bold { font-weight: bold; }
        .divider { border-top: 1px dashed #000; margin: 10px 0; }
        .title { font-size: 16px; margin-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { text-align: left; padding: 2px 0; font-size: 11px; }
        th.right, td.right { text-align: right; }
      </style>
    </head>
    <body>
      <div class="text-center">
        <div class="bold title">${ticket.sucursal?.nombre || 'MARY CLEAN'}</div>
        <div>${ticket.sucursal?.direccion || 'Dirección de sucursal'}</div>
        <div>Telf: ${ticket.sucursal?.telefono || '0000000'}</div>
      </div>
      <div class="divider"></div>
      <div><span class="bold">TICKET:</span> ${ticket.encabezado?.ticket}</div>
      <div><span class="bold">FECHA:</span> ${ticket.encabezado?.fecha_emision || now}</div>
      <div><span class="bold">CLIENTE:</span> ${ticket.cliente?.nombres}</div>
      <div><span class="bold">DOC:</span> ${ticket.cliente?.documento}</div>
      <div><span class="bold">CAJERO:</span> ${ticket.encabezado?.empleado}</div>
      <div class="divider"></div>
      <table>
        <thead>
          <tr>
            <th>Cant</th>
            <th>Desc</th>
            <th class="right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${ticket.detalles?.map((d: any) => `
            <tr>
              <td>${d.cantidad}</td>
              <td>${d.prenda} <br><small>${d.servicio}</small></td>
              <td class="right">S/ ${formatMoney(d.subtotal)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="divider"></div>
      <div class="text-right bold" style="font-size: 14px;">
        TOTAL: S/ ${formatMoney(ticket.total || "0")}
      </div>
      <div class="divider"></div>
      <div class="text-center">
        ¡Gracias por su preferencia!<br>
        Por favor conserve este ticket para recoger sus prendas.
      </div>
    </body>
    </html>
  `;

  iframe.contentWindow?.document.open();
  iframe.contentWindow?.document.write(html);
  iframe.contentWindow?.document.close();

  iframe.onload = () => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => { document.body.removeChild(iframe); }, 1000);
  };
};

export const printRecibo = (recibo: any, ticketCodigo: string) => {
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  document.body.appendChild(iframe);

  const formatMoney = (val: string | number) => parseFloat(val as string).toFixed(2);
  
  const html = `
    <html>
    <head>
      <style>
        body { font-family: 'Courier New', Courier, monospace; font-size: 12px; margin: 0; padding: 10px; width: 300px; color: #000; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .bold { font-weight: bold; }
        .divider { border-top: 1px dashed #000; margin: 10px 0; }
        .title { font-size: 16px; margin-bottom: 5px; }
      </style>
    </head>
    <body>
      <div class="text-center">
        <div class="bold title">RECIBO DE PAGO</div>
        <div>MARY CLEAN</div>
      </div>
      <div class="divider"></div>
      <div><span class="bold">TICKET REF:</span> ${ticketCodigo}</div>
      <div><span class="bold">FECHA:</span> ${recibo.fecha}</div>
      <div><span class="bold">MÉTODO:</span> ${recibo.metodo}</div>
      <div class="divider"></div>
      <div class="text-center bold" style="font-size: 16px;">
        MONTO ABONADO: S/ ${formatMoney(recibo.monto_abonado)}
      </div>
      <div class="text-center" style="margin-top: 5px;">
        SALDO PENDIENTE: S/ ${formatMoney(recibo.saldo_pendiente)}
      </div>
      <div class="divider"></div>
      <div class="text-center">
        ¡Gracias por su pago!
      </div>
    </body>
    </html>
  `;

  iframe.contentWindow?.document.open();
  iframe.contentWindow?.document.write(html);
  iframe.contentWindow?.document.close();

  iframe.onload = () => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => { document.body.removeChild(iframe); }, 1000);
  };
};

export const printCierreCaja = (cierre: any, sucursal: any, usuario: any) => {
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  document.body.appendChild(iframe);

  const formatMoney = (val: string | number) => parseFloat(val as string).toFixed(2);
  const now = new Date().toLocaleString("es-PE");

  const html = `
    <html>
    <head>
      <style>
        body { font-family: 'Courier New', Courier, monospace; font-size: 12px; margin: 0; padding: 10px; width: 300px; color: #000; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .bold { font-weight: bold; }
        .divider { border-top: 1px dashed #000; margin: 10px 0; }
        .title { font-size: 16px; margin-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { text-align: left; padding: 2px 0; font-size: 11px; }
        th.right, td.right { text-align: right; }
        .signature-box { margin-top: 40px; border-top: 1px solid #000; width: 200px; margin-left: auto; margin-right: auto; padding-top: 5px; }
      </style>
    </head>
    <body>
      <div class="text-center">
        <div class="bold title">${sucursal?.nombre || 'MARY CLEAN'}</div>
        <div class="bold" style="margin-top: 5px;">CIERRE DE CAJA</div>
      </div>
      <div class="divider"></div>
      <div><span class="bold">FECHA CIERRE:</span> ${cierre.fecha}</div>
      <div><span class="bold">FECHA IMPRESO:</span> ${now}</div>
      <div><span class="bold">CAJERO:</span> ${usuario?.nombres || 'Admin'}</div>
      <div class="divider"></div>
      
      <table>
        <thead>
          <tr>
            <th>MÉTODO</th>
            <th class="text-center">OPS</th>
            <th class="right">MONTO</th>
          </tr>
        </thead>
        <tbody>
          ${cierre.desglose?.filter((d: any) => d.metodo !== null).map((d: any) => `
            <tr>
              <td>${d.metodo}</td>
              <td class="text-center">${d.cantidadTransacciones}</td>
              <td class="right">S/ ${formatMoney(d.total_ingresos)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="divider"></div>
      <div style="display: flex; justify-content: space-between;">
        <span class="bold">TOTAL OPERACIONES:</span>
        <span class="bold">${cierre.total_operaciones}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-top: 5px;">
        <span class="bold" style="font-size: 14px;">TOTAL RECAUDADO:</span>
        <span class="bold" style="font-size: 14px;">S/ ${formatMoney(cierre.total_general)}</span>
      </div>
      
      <div class="text-center" style="margin-top: 60px;">
        <div class="signature-box">
          Firma del Cajero<br>
          ${usuario?.nombres || ''}
        </div>
      </div>
    </body>
    </html>
  `;

  iframe.contentWindow?.document.open();
  iframe.contentWindow?.document.write(html);
  iframe.contentWindow?.document.close();

  iframe.onload = () => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => { document.body.removeChild(iframe); }, 1000);
  };
};
