import { tieneDatosEnvio } from './envio';

// Datos de envío visibles para el cliente cuando el admin los registró (REQ-F07-05)
const DatosEnvioCliente = ({ datosEnvio }) => {
  if (!tieneDatosEnvio(datosEnvio)) {
    return <p className="text-xs text-cafe-tostado/70 italic">Los datos de envío se actualizarán cuando el administrador procese el despacho.</p>;
  }

  return (
    <div className="bg-cafe-arena/50 p-4 rounded-sm border border-cafe-kraft/40 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
      <div>
        <h4 className="text-xs font-bold text-cafe-tostado uppercase mb-1">Información de Despacho</h4>
        <p className="text-sm text-cafe-tostado">
          <span className="font-bold">Modalidad:</span> {datosEnvio.modalidad} |
          <span className="font-bold ml-2">Agencia:</span> {datosEnvio.agencia || 'N/A'}
        </p>
        {datosEnvio.fechaEnvio && (
          <p className="text-sm text-cafe-tostado mt-1"><span className="font-bold">Fecha de envío:</span> {datosEnvio.fechaEnvio}</p>
        )}
      </div>
      {datosEnvio.numeroGuia && (
        <div className="bg-cafe-leche px-4 py-2 rounded-lg border border-cafe-kraft/60 text-center">
          <span className="text-xs text-cafe-cereza font-bold block">NRO. DE GUÍA</span>
          <span className="font-mono font-bold text-cafe-espresso">{datosEnvio.numeroGuia}</span>
        </div>
      )}
    </div>
  );
};

export default DatosEnvioCliente;
