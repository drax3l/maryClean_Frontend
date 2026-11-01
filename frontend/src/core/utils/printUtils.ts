// ===============================================================
// Utilidades internas
// ===============================================================

const escapeHtml = (value: unknown): string => {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};


const formatMoney = (value: unknown): string => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return '0.00';
  }

  return number.toFixed(2);
};


const formatDateTime = (value?: unknown): string => {
  if (!value) {
    return new Date().toLocaleString('es-PE');
  }

  const text = String(value);

  const parsed = new Date(
    text.includes(' ')
      ? text.replace(' ', 'T')
      : text
  );

  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleString('es-PE');
  }

  return text;
};


// ===============================================================
// Imprimir HTML en iframe oculto
// ===============================================================

const printHtml = (html: string): void => {
  const iframe =
    document.createElement('iframe');

  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';

  document.body.appendChild(
    iframe
  );


  const cleanup = () => {
    window.setTimeout(() => {
      iframe.remove();
    }, 1000);
  };


  iframe.onload = () => {
    const printWindow =
      iframe.contentWindow;

    if (!printWindow) {
      cleanup();
      return;
    }

    printWindow.focus();
    printWindow.print();

    cleanup();
  };


  const documentIframe =
    iframe.contentDocument
    ?? iframe.contentWindow?.document;


  if (!documentIframe) {
    iframe.remove();
    return;
  }


  documentIframe.open();
  documentIframe.write(html);
  documentIframe.close();
};


// ===============================================================
// Estilos base para impresora térmica 80 mm
// ===============================================================

const thermalStyles = `
  @page {
    size: 80mm auto;
    margin: 0;
  }

  * {
    box-sizing: border-box;
  }

  html,
  body {
    margin: 0;
    padding: 0;
    background: #fff;
    color: #000;
  }

  body {
    width: 72mm;
    margin: 0 auto;
    padding: 4mm 2mm;
    font-family:
      "Courier New",
      Courier,
      monospace;
    font-size: 11px;
    line-height: 1.35;
  }

  .center {
    text-align: center;
  }

  .right {
    text-align: right;
  }

  .bold {
    font-weight: 700;
  }

  .title {
    font-size: 18px;
    font-weight: 900;
    letter-spacing: 1px;
  }

  .subtitle {
    font-size: 12px;
    font-weight: 700;
  }

  .small {
    font-size: 9px;
  }

  .section-title {
    font-size: 11px;
    font-weight: 900;
    margin-bottom: 4px;
  }

  .divider {
    border-top: 1px dashed #000;
    margin: 8px 0;
  }

  .divider-solid {
    border-top: 2px solid #000;
    margin: 8px 0;
  }

  .row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 6px;
    margin: 2px 0;
  }

  .row .label {
    flex: 1;
  }

  .row .value {
    text-align: right;
    white-space: nowrap;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  th,
  td {
    padding: 3px 1px;
    vertical-align: top;
    font-size: 10px;
  }

  th {
    font-weight: 900;
    border-bottom: 1px solid #000;
  }

  .qty {
    width: 12%;
    text-align: center;
  }

  .description {
    width: 55%;
    word-break: break-word;
  }

  .amount {
    width: 33%;
    text-align: right;
  }

  .service {
    display: block;
    font-size: 8px;
    margin-top: 1px;
  }

  .detail-price {
    display: block;
    font-size: 8px;
  }

  .total-row {
    font-size: 12px;
    font-weight: 700;
  }

  .grand-total {
    font-size: 15px;
    font-weight: 900;
  }

  .payment-status {
    border: 1px solid #000;
    padding: 5px;
    margin-top: 7px;
    text-align: center;
    font-weight: 900;
    font-size: 12px;
  }

  .footer {
    margin-top: 10px;
    text-align: center;
    font-size: 9px;
  }

  .signature-box {
    width: 55mm;
    margin: 15mm auto 0;
    padding-top: 4px;
    border-top: 1px solid #000;
    text-align: center;
  }

  @media print {
    body {
      width: 72mm;
    }
  }
`;


// ===============================================================
// TICKET DEL PEDIDO
// ===============================================================

export const printTicket = (
  ticket: any
): void => {

  const total =
    Number(
      ticket?.total ?? 0
    );

  const totalPagado =
    Number(
      ticket?.total_pagado ?? 0
    );

  const saldoPendiente =
    Number(
      ticket?.saldo_pendiente
      ?? Math.max(
        total - totalPagado,
        0
      )
    );


  const estadoPago =
    saldoPendiente <= 0
      ? 'PAGADO'
      : totalPagado > 0
        ? 'PAGO PARCIAL'
        : 'PENDIENTE';


  const empresa =
    ticket?.sucursal?.nombre
    ?? ticket?.encabezado?.empresa
    ?? 'MARYCLEAN';


  const direccion =
    ticket?.sucursal?.direccion
    ?? '';


  const telefono =
    ticket?.sucursal?.telefono
    ?? '';


  const empleado =
    ticket?.empleado?.nombres
    ?? ticket?.encabezado?.empleado
    ?? ticket?.encabezado?.cajero
    ?? '';


  const ticketCodigo =
    ticket?.encabezado?.ticket
    ?? ticket?.codigoTicket
    ?? '-';


  const fecha =
    ticket?.encabezado?.fecha_emision
    ?? ticket?.encabezado?.fecha
    ?? new Date();


  const estadoPedido =
    ticket?.estado
    ?? ticket?.encabezado?.estado
    ?? 'Recibido';


  const detalles =
    Array.isArray(
      ticket?.detalles
    )
      ? ticket.detalles
      : [];


  const detalleHtml =
    detalles.length > 0
      ? detalles
          .map((detalle: any) => {

            const cantidad =
              Number(
                detalle?.cantidad ?? 0
              );

            const precioUnitario =
              Number(
                detalle?.precioUnitario
                ?? detalle?.precio_unitario
                ?? detalle?.precio
                ?? 0
              );

            const subtotal =
              Number(
                detalle?.subtotal
                ?? detalle?.importe
                ?? (
                  cantidad
                  * precioUnitario
                )
              );


            return `
              <tr>

                <td class="qty">
                  ${escapeHtml(cantidad)}
                </td>

                <td class="description">

                  <span class="bold">
                    ${escapeHtml(
                      detalle?.prenda
                      ?? detalle?.descripcion
                      ?? 'Prenda'
                    )}
                  </span>

                  ${
                    detalle?.servicio
                      ? `
                        <span class="service">
                          ${escapeHtml(
                            detalle.servicio
                          )}
                        </span>
                      `
                      : ''
                  }

                  ${
                    precioUnitario > 0
                      ? `
                        <span class="detail-price">
                          ${cantidad}
                          x S/ ${formatMoney(
                            precioUnitario
                          )}
                        </span>
                      `
                      : ''
                  }

                </td>

                <td class="amount">
                  S/ ${formatMoney(
                    subtotal
                  )}
                </td>

              </tr>
            `;
          })
          .join('')
      : `
          <tr>
            <td
              colspan="3"
              class="center"
            >
              Sin detalles registrados
            </td>
          </tr>
        `;


  const html = `
    <!doctype html>

    <html lang="es">

      <head>

        <meta charset="UTF-8" />

        <title>
          Ticket ${escapeHtml(
            ticketCodigo
          )}
        </title>

        <style>
          ${thermalStyles}
        </style>

      </head>


      <body>

        <!-- =========================================
             EMPRESA
        ========================================== -->

        <header class="center">

          <div class="title">
            ${escapeHtml(
              empresa
            )}
          </div>

          <div class="subtitle">
            Sistema de Gestión
          </div>

          ${
            direccion
              ? `
                <div class="small">
                  ${escapeHtml(
                    direccion
                  )}
                </div>
              `
              : ''
          }

          ${
            telefono
              ? `
                <div class="small">
                  Tel: ${escapeHtml(
                    telefono
                  )}
                </div>
              `
              : ''
          }

        </header>


        <div class="divider-solid"></div>


        <!-- =========================================
             DATOS DEL PEDIDO
        ========================================== -->

        <div class="row">

          <span class="bold">
            TICKET:
          </span>

          <span class="bold">
            ${escapeHtml(
              ticketCodigo
            )}
          </span>

        </div>


        <div class="row">

          <span>
            Fecha:
          </span>

          <span class="right">
            ${escapeHtml(
              formatDateTime(
                fecha
              )
            )}
          </span>

        </div>


        <div class="row">

          <span>
            Estado pedido:
          </span>

          <span class="bold">
            ${escapeHtml(
              estadoPedido
            )}
          </span>

        </div>


        <div class="divider"></div>


        <!-- =========================================
             CLIENTE
        ========================================== -->

        <div class="section-title">
          CLIENTE
        </div>


        <div>
          <span class="bold">
            Nombre:
          </span>

          ${escapeHtml(
            ticket?.cliente?.nombres
            ?? '-'
          )}
        </div>


        <div>
          <span class="bold">
            Documento:
          </span>

          ${escapeHtml(
            ticket?.cliente?.documento
            ?? '-'
          )}
        </div>


        ${
          ticket?.cliente?.telefono
            ? `
              <div>
                <span class="bold">
                  Teléfono:
                </span>

                ${escapeHtml(
                  ticket.cliente.telefono
                )}
              </div>
            `
            : ''
        }


        ${
          empleado
            ? `
              <div>
                <span class="bold">
                  Atendido por:
                </span>

                ${escapeHtml(
                  empleado
                )}
              </div>
            `
            : ''
        }


        <div class="divider"></div>


        <!-- =========================================
             DETALLE
        ========================================== -->

        <div class="section-title">
          DETALLE DEL PEDIDO
        </div>


        <table>

          <thead>

            <tr>

              <th class="qty">
                Cant.
              </th>

              <th class="description">
                Descripción
              </th>

              <th class="amount">
                Importe
              </th>

            </tr>

          </thead>


          <tbody>
            ${detalleHtml}
          </tbody>

        </table>


        <div class="divider-solid"></div>


        <!-- =========================================
             RESUMEN FINANCIERO
        ========================================== -->

        <div class="row total-row">

          <span>
            TOTAL PEDIDO
          </span>

          <span>
            S/ ${formatMoney(
              total
            )}
          </span>

        </div>


        <div class="row total-row">

          <span>
            TOTAL PAGADO
          </span>

          <span>
            S/ ${formatMoney(
              totalPagado
            )}
          </span>

        </div>


        <div class="divider"></div>


        <div class="row grand-total">

          <span>
            SALDO PENDIENTE
          </span>

          <span>
            S/ ${formatMoney(
              Math.max(
                saldoPendiente,
                0
              )
            )}
          </span>

        </div>


        <div class="payment-status">
          ESTADO DE PAGO:
          ${estadoPago}
        </div>


        <div class="divider"></div>


        <!-- =========================================
             PIE
        ========================================== -->

        <footer class="footer">

          <div class="bold">
            ¡Gracias por su preferencia!
          </div>

          <div style="margin-top: 5px;">
            Conserve este ticket para
            recoger sus prendas.
          </div>

          <div style="margin-top: 7px;">
            Este documento corresponde
            al registro del pedido.
          </div>

        </footer>

      </body>

    </html>
  `;


  printHtml(
    html
  );
};


// ===============================================================
// RECIBO DE PAGO
// ===============================================================

export const printRecibo = (
  recibo: any,
  ticketCodigo: string
): void => {

  const totalPedido =
    Number(
      recibo?.total_pedido
      ?? 0
    );

  const totalPagado =
    Number(
      recibo?.total_pagado
      ?? recibo?.monto_abonado
      ?? 0
    );

  const saldoPendiente =
    Number(
      recibo?.saldo_pendiente
      ?? Math.max(
        totalPedido - totalPagado,
        0
      )
    );


  const estadoPago =
    saldoPendiente <= 0
      ? 'PAGADO'
      : totalPagado > 0
        ? 'PAGO PARCIAL'
        : 'PENDIENTE';


  const html = `
    <!doctype html>

    <html lang="es">

      <head>

        <meta charset="UTF-8" />

        <title>
          Recibo de pago
        </title>

        <style>
          ${thermalStyles}
        </style>

      </head>


      <body>

        <!-- EMPRESA -->

        <header class="center">

          <div class="title">
            ${escapeHtml(
              recibo?.empresa
              ?? 'MARYCLEAN'
            )}
          </div>

          <div class="subtitle">
            RECIBO DE PAGO
          </div>

        </header>


        <div class="divider-solid"></div>


        <!-- DATOS DEL RECIBO -->

        <div class="row">

          <span class="bold">
            RECIBO:
          </span>

          <span>
            #${escapeHtml(
              recibo?.recibo_n
              ?? '-'
            )}
          </span>

        </div>


        <div class="row">

          <span>
            Ticket:
          </span>

          <span class="bold">
            ${escapeHtml(
              recibo?.ticket
              ?? ticketCodigo
            )}
          </span>

        </div>


        <div class="row">

          <span>
            Fecha:
          </span>

          <span class="right">
            ${escapeHtml(
              formatDateTime(
                recibo?.fecha_pago
                ?? recibo?.fecha
              )
            )}
          </span>

        </div>


        <div class="divider"></div>


        <!-- CLIENTE -->

        <div class="section-title">
          CLIENTE
        </div>


        <div>
          ${escapeHtml(
            recibo?.cliente
            ?? '-'
          )}
        </div>


        ${
          recibo?.documento
            ? `
              <div>
                Doc:
                ${escapeHtml(
                  recibo.documento
                )}
              </div>
            `
            : ''
        }


        <div class="divider"></div>


        <!-- PAGO -->

        <div class="center">

          <div class="small">
            MONTO ABONADO
          </div>

          <div
            class="bold"
            style="
              font-size: 20px;
              margin: 4px 0;
            "
          >
            S/ ${formatMoney(
              recibo?.monto_abonado
              ?? 0
            )}
          </div>

          <div>
            Método:
            <span class="bold">
              ${escapeHtml(
                recibo?.metodo
                ?? '-'
              )}
            </span>
          </div>

        </div>


        <div class="divider-solid"></div>


        <!-- RESUMEN FINANCIERO -->

        <div class="row">

          <span>
            Total pedido
          </span>

          <span>
            S/ ${formatMoney(
              totalPedido
            )}
          </span>

        </div>


        <div class="row">

          <span>
            Total pagado
          </span>

          <span>
            S/ ${formatMoney(
              totalPagado
            )}
          </span>

        </div>


        <div class="divider"></div>


        <div class="row grand-total">

          <span>
            Saldo
          </span>

          <span>
            S/ ${formatMoney(
              Math.max(
                saldoPendiente,
                0
              )
            )}
          </span>

        </div>


        <div class="payment-status">
          ${estadoPago}
        </div>


        <div class="divider"></div>


        <footer class="footer">

          <div class="bold">
            ¡Pago recibido correctamente!
          </div>

          <div style="margin-top: 5px;">
            Conserve este comprobante.
          </div>

        </footer>

      </body>

    </html>
  `;


  printHtml(
    html
  );
};


// ===============================================================
// CIERRE DE CAJA
// ===============================================================

export const printCierreCaja = (
  cierre: any,
  sucursal: any,
  usuario: any
): void => {

  const now =
    new Date().toLocaleString(
      'es-PE'
    );


  const desglose =
    Array.isArray(
      cierre?.desglose
    )
      ? cierre.desglose.filter(
          (detalle: any) =>
            detalle?.metodo !== null
        )
      : [];


  const filas =
    desglose.length > 0
      ? desglose
          .map(
            (detalle: any) => `
              <tr>

                <td>
                  ${escapeHtml(
                    detalle.metodo
                  )}
                </td>

                <td class="center">
                  ${escapeHtml(
                    detalle.cantidadTransacciones
                  )}
                </td>

                <td class="amount">
                  S/ ${formatMoney(
                    detalle.total_ingresos
                  )}
                </td>

              </tr>
            `
          )
          .join('')
      : `
          <tr>
            <td
              colspan="3"
              class="center"
            >
              Sin movimientos
            </td>
          </tr>
        `;


  const html = `
    <!doctype html>

    <html lang="es">

      <head>

        <meta charset="UTF-8" />

        <title>
          Cierre de caja
        </title>

        <style>
          ${thermalStyles}
        </style>

      </head>


      <body>

        <header class="center">

          <div class="title">
            ${escapeHtml(
              sucursal?.nombre
              ?? 'MARYCLEAN'
            )}
          </div>

          <div class="subtitle">
            CIERRE DE CAJA
          </div>

        </header>


        <div class="divider-solid"></div>


        <div>
          <span class="bold">
            Fecha cierre:
          </span>

          ${escapeHtml(
            cierre?.fecha
            ?? '-'
          )}
        </div>


        <div>
          <span class="bold">
            Impreso:
          </span>

          ${escapeHtml(
            now
          )}
        </div>


        <div>
          <span class="bold">
            Cajero:
          </span>

          ${escapeHtml(
            usuario?.nombres
            ?? 'Admin'
          )}
        </div>


        <div class="divider"></div>


        <table>

          <thead>

            <tr>

              <th>
                MÉTODO
              </th>

              <th class="center">
                OPS
              </th>

              <th class="amount">
                MONTO
              </th>

            </tr>

          </thead>


          <tbody>
            ${filas}
          </tbody>

        </table>


        <div class="divider-solid"></div>


        <div class="row">

          <span class="bold">
            TOTAL OPERACIONES
          </span>

          <span class="bold">
            ${escapeHtml(
              cierre?.total_operaciones
              ?? 0
            )}
          </span>

        </div>


        <div class="row grand-total">

          <span>
            TOTAL RECAUDADO
          </span>

          <span>
            S/ ${formatMoney(
              cierre?.total_general
              ?? 0
            )}
          </span>

        </div>


        <div class="signature-box">

          Firma del Cajero

          <br />

          ${escapeHtml(
            usuario?.nombres
            ?? ''
          )}

        </div>

      </body>

    </html>
  `;


  printHtml(
    html
  );
};