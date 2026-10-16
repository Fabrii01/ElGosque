// Registro histórico de cambios de estado (REQ-F08-06)
const HistorialPedido = ({ historial }) => {
  if (!historial || historial.length === 0) return null;

  return (
    <div className="mt-8 border-t pt-6">
      <h4 className="text-sm font-titulo font-semibold text-cafe-espresso uppercase mb-4">Registro Histórico (Auditoría)</h4>
      <div className="space-y-4 border-l-2 border-cafe-hoja ml-3 pl-4">
        {historial.map((hist, idx) => (
          <div key={idx} className="relative">
            <div className="absolute -left-[21px] top-1 w-3 h-3 bg-cafe-hoja rounded-full border-2 border-white"></div>
            <p className="text-xs text-cafe-tostado/80 font-bold mb-1">
              {new Date(hist.fechaCambio).toLocaleString('es-PE')} — Registrado por: <span className="text-cafe-espresso">{hist.responsable}</span>
            </p>
            <p className="text-sm text-cafe-espresso">
              Cambio a <span className="font-titulo font-semibold text-cafe-hoja">{hist.estadoNuevo}</span>.
              <span className="text-cafe-tostado/80 italic ml-2">Nota: {hist.motivo}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistorialPedido;
