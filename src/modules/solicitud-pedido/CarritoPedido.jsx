// Panel lateral con el carrito, datos de contacto y confirmación de la solicitud
const CarritoPedido = ({
  carrito, productosRetirados, pedidoConfirmado, datosPedido, actualizarDatoPedido,
  cerrarCarrito, eliminarDelCarrito, calcularTotal, procesarPedido, enviarWhatsApp,
}) => (
  <div className="fixed inset-0 bg-cafe-espresso/60 backdrop-blur-sm z-[70] flex justify-end">
    <div className="bg-cafe-leche w-full max-w-md h-full shadow-xl flex flex-col animate-slide-in-right">

      <div className="p-6 flex justify-between items-center bg-cafe-selva text-cafe-crema border-b-4 border-cafe-mostaza">
        <div>
          <h2 className="text-2xl font-titulo font-semibold">Tu pedido</h2>
          <p className="text-xs text-cafe-crema/80 mt-0.5">Solicitud de pedido</p>
        </div>
        <button onClick={cerrarCarrito} className="w-9 h-9 rounded-sm bg-cafe-crema/10 hover:bg-cafe-crema/25 text-xl" aria-label="Cerrar">×</button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {productosRetirados > 0 && !pedidoConfirmado && (
          <p className="mb-4 bg-cafe-arena/50 border border-cafe-kraft/60 text-cafe-tostado text-xs font-medium p-3 rounded-sm">
            {productosRetirados === 1 ? 'Un producto de tu pedido ya no está disponible y se quitó.' : `${productosRetirados} productos de tu pedido ya no están disponibles y se quitaron.`}
          </p>
        )}
        {pedidoConfirmado ? (
          <div className="text-center py-10">
            <div className="w-20 h-20 bg-cafe-hoja/15 text-cafe-hoja rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">✓</div>
            <h3 className="text-2xl font-bold text-cafe-espresso mb-2">¡Pedido Registrado!</h3>
            <p className="text-cafe-tostado/80 mb-6">Tu código único es: <strong className="text-cafe-hoja text-lg">{pedidoConfirmado.codigo}</strong></p>
            <p className="text-sm text-cafe-tostado mb-8">El pedido ha sido guardado en el sistema. Para definir el método de pago y envío, por favor envía el resumen a nuestro WhatsApp.</p>
            <button onClick={enviarWhatsApp} className="w-full bg-[#25D366] hover:bg-green-600 text-white font-bold py-4 rounded-sm shadow-lg transition transform hover:-translate-y-1 flex items-center justify-center gap-2">
              Continuar por WhatsApp
            </button>
          </div>
        ) : carrito.length === 0 ? (
          <div className="text-center py-20 text-cafe-tostado/70">
            <p className="text-xl font-medium">El pedido está vacío.</p>
            <p className="text-sm mt-2">Agrega productos desde el catálogo.</p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {carrito.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-cafe-crema p-4 rounded-sm border border-cafe-espresso/10">
                  <div>
                    <p className="font-bold text-cafe-espresso">{item.nombre}</p>
                    <p className="text-xs text-cafe-tostado/80">{item.cantidad}x {item.presentacionElegida} ({item.pesoElegido})</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-cafe-tostado">S/ {(item.precioReferencial * item.cantidad).toFixed(2)}</p>
                    <button onClick={() => eliminarDelCarrito(idx)} className="text-xs text-red-500 hover:underline">Eliminar</button>
                  </div>
                </div>
              ))}
            </div>

            <form id="form-pedido" onSubmit={procesarPedido} className="space-y-4 border-t pt-6">
              <h4 className="font-bold text-cafe-espresso">Datos de Envío y Contacto</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-cafe-tostado mb-1">Teléfono</label>
                  <input type="tel" required className="w-full border p-3 rounded-lg bg-cafe-crema outline-none" value={datosPedido.telefono} onChange={e => actualizarDatoPedido('telefono', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-cafe-tostado mb-1">Ciudad</label>
                  <input type="text" required className="w-full border p-3 rounded-lg bg-cafe-crema outline-none" value={datosPedido.ciudad} onChange={e => actualizarDatoPedido('ciudad', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-cafe-tostado mb-1">Tipo de Negocio</label>
                <input type="text" required className="w-full border p-3 rounded-lg bg-cafe-crema outline-none" value={datosPedido.negocio} onChange={e => actualizarDatoPedido('negocio', e.target.value)} />
              </div>
            </form>
          </>
        )}
      </div>

      {!pedidoConfirmado && carrito.length > 0 && (
        <div className="p-6 border-t bg-cafe-leche">
          <div className="flex justify-between items-center mb-6">
            <span className="text-cafe-tostado/80 font-medium">Total Estimado</span>
            <span className="text-2xl font-titulo font-semibold text-cafe-hoja">S/ {calcularTotal().toFixed(2)}</span>
          </div>
          <button type="submit" form="form-pedido" className="w-full bg-cafe-tostado hover:bg-cafe-espresso text-white font-bold py-4 rounded-sm transition shadow-lg flex justify-center items-center gap-2">
            Confirmar Pedido
          </button>
        </div>
      )}
    </div>
  </div>
);

export default CarritoPedido;
