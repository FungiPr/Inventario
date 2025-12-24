import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { stockMovementsService } from '../services/stock-movements.service';
import { itemsService } from '../services/items.service';
import type { Item } from '../types';

function MovementForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Obtener parámetros de la URL
  const typeParam = searchParams.get('type') as 'IN' | 'OUT' | null;
  const itemIdParam = searchParams.get('itemId');

  // Estados del formulario
  const [type, setType] = useState<'IN' | 'OUT'>(typeParam || 'IN');
  const [itemId, setItemId] = useState<string>(itemIdParam || '');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');

  // Estados de UI
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingItems, setLoadingItems] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    if (itemId && items.length > 0) {
      const item = items.find(i => i.id === Number(itemId));
      setSelectedItem(item || null);
    }
  }, [itemId, items]);

  const loadItems = async () => {
    try {
      setLoadingItems(true);
      const data = await itemsService.getAll();
      setItems(data);
    } catch (error) {
      console.error('Error cargando items:', error);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!itemId) {
      setError('Debe seleccionar un producto');
      return;
    }

    if (!quantity || Number(quantity) <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }

    // Validación para salidas: no puede exceder el stock disponible
    if (type === 'OUT' && selectedItem) {
      if (Number(quantity) > selectedItem.currentStock) {
        setError(`No hay suficiente stock. Disponible: ${selectedItem.currentStock} unidades`);
        return;
      }
    }

    setLoading(true);

    try {
      await stockMovementsService.create({
        itemId: Number(itemId),
        type,
        quantity: Number(quantity),
        reason: reason.trim() || undefined,
      });

      // Redirigir al detalle del item
      navigate(`/items/${itemId}`);
    } catch (err: any) {
      console.error('Error registrando movimiento:', err);
      setError(err.response?.data?.message || 'Error al registrar el movimiento');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar items por búsqueda
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeConfig = () => {
    if (type === 'IN') {
      return {
        title: 'Entrada de Stock',
        icon: '⬇️',
        color: 'emerald',
        gradient: 'from-emerald-500 to-emerald-600',
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-600',
        borderColor: 'border-emerald-500',
        buttonBg: 'bg-emerald-600 hover:bg-emerald-700',
        shadowColor: 'shadow-emerald-200',
      };
    }
    return {
      title: 'Salida de Stock',
      icon: '⬆️',
      color: 'red',
      gradient: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      borderColor: 'border-red-500',
      buttonBg: 'bg-red-600 hover:bg-red-700',
      shadowColor: 'shadow-red-200',
    };
  };

  const config = getTypeConfig();

  if (loadingItems) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-[999]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-indigo-600 font-black tracking-widest text-xs uppercase">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#f8fafc] pb-20">
      {/* Fondo decorativo */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] ${config.bgColor}/30 rounded-full blur-[120px]`}></div>
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] ${config.bgColor}/20 rounded-full blur-[120px]`}></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        
        {/* NAVEGACIÓN */}
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
          <Link to="/dashboard" className="text-slate-400 hover:text-indigo-600 transition-colors">
            Dashboard
          </Link>
          <span className="text-slate-300">/</span>
          <Link to="/movements" className="text-slate-400 hover:text-indigo-600 transition-colors">
            Movimientos
          </Link>
          <span className="text-slate-300">/</span>
          <span className={config.textColor}>Nuevo</span>
        </nav>

        {/* Header con selector de tipo */}
        <div className="mb-10">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className={`w-16 h-16 bg-gradient-to-br ${config.gradient} rounded-2xl flex items-center justify-center text-4xl shadow-xl ${config.shadowColor}`}>
              {config.icon}
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
              {config.title}<span className={config.textColor}>.</span>
            </h1>
          </div>

          {/* Selector de Tipo */}
          <div className="flex justify-center gap-4 mb-6">
            <button
              type="button"
              onClick={() => setType('IN')}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-tight transition-all border-2 ${
                type === 'IN'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xl shadow-emerald-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-600'
              }`}
            >
              <span className="text-2xl">⬇️</span>
              Entrada
            </button>
            <button
              type="button"
              onClick={() => setType('OUT')}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-tight transition-all border-2 ${
                type === 'OUT'
                  ? 'bg-red-600 text-white border-red-600 shadow-xl shadow-red-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-red-600'
              }`}
            >
              <span className="text-2xl">⬆️</span>
              Salida
            </button>
          </div>

          <p className="text-slate-500 font-bold text-center uppercase text-xs tracking-[0.2em]">
            {type === 'IN' ? 'Ingreso de unidades al inventario' : 'Retiro de unidades del inventario'}
          </p>
        </div>

        {/* Formulario Principal */}
        <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100 p-10 space-y-8">
          
          {error && (
            <div className={`${config.bgColor} ${config.textColor} p-4 rounded-2xl border ${config.borderColor} font-bold text-sm flex items-center gap-2`}>
              <span className={`w-2 h-2 ${config.textColor.replace('text', 'bg')} rounded-full animate-pulse`}></span> 
              {error}
            </div>
          )}

          {/* Selección de Producto */}
          <div className="space-y-4">
            <label className="flex justify-between items-center px-1">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Seleccionar Producto</span>
              <span className="text-[10px] font-black text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded">Obligatorio</span>
            </label>

            {/* Buscador */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Buscar producto por nombre o SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-0 transition-all font-bold text-slate-800 placeholder-slate-400 shadow-sm"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Lista de Productos */}
            <div className="grid gap-3 max-h-96 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setItemId(item.id.toString());
                      setSelectedItem(item);
                    }}
                    className={`text-left p-5 rounded-2xl transition-all border-2 ${
                      itemId === item.id.toString()
                        ? `${config.bgColor} ${config.borderColor} shadow-lg`
                        : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl border-2 ${
                          itemId === item.id.toString()
                            ? `${config.bgColor} ${config.textColor} ${config.borderColor}`
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {item.name[0]}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-black text-slate-900 text-sm uppercase tracking-tight">{item.name}</h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            SKU: {item.sku || '---'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Stock Actual */}
                        <div className={`px-4 py-2 rounded-xl border-2 ${
                          item.currentStock <= item.minStock
                            ? 'bg-amber-50 border-amber-200 text-amber-700'
                            : 'bg-slate-100 border-slate-200 text-slate-700'
                        }`}>
                          <p className="text-xs font-black uppercase tracking-tight">Stock</p>
                          <p className="text-2xl font-black">{item.currentStock}</p>
                        </div>

                        {/* Check */}
                        {itemId === item.id.toString() && (
                          <div className={`w-8 h-8 ${config.bgColor} ${config.textColor} rounded-full flex items-center justify-center font-black text-xl`}>
                            ✓
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-slate-400 font-black uppercase tracking-widest text-sm">
                    No se encontraron productos
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Información del Producto Seleccionado */}
          {selectedItem && (
            <div className={`${config.bgColor} rounded-2xl p-6 border-2 ${config.borderColor}`}>
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-2xl font-black ${config.textColor} border-2 ${config.borderColor}`}>
                  {selectedItem.name[0]}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{selectedItem.name}</h3>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {selectedItem.category?.name || 'Sin categoría'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Stock Actual</p>
                  <p className="text-2xl font-black text-slate-900">{selectedItem.currentStock}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Stock Mínimo</p>
                  <p className="text-2xl font-black text-slate-900">{selectedItem.minStock}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Precio</p>
                  <p className="text-2xl font-black text-slate-900">${selectedItem.price?.toLocaleString() || '---'}</p>
                </div>
              </div>

              {/* Advertencia para salidas */}
              {type === 'OUT' && selectedItem.currentStock === 0 && (
                <div className="mt-4 bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-center gap-2">
                  <span className="text-2xl">⚠️</span>
                  <p className="text-xs font-bold">
                    No hay stock disponible para realizar una salida
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Cantidad */}
          <div className="space-y-2">
            <label className="flex justify-between items-center px-1">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Cantidad</span>
              <span className="text-[10px] font-black text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded">Obligatorio</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                className="w-full px-6 py-5 bg-white border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-0 transition-all font-black text-3xl text-slate-800 placeholder-slate-300 shadow-sm text-center"
                required
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400 uppercase">
                Unidades
              </span>
            </div>
            {selectedItem && quantity && (
              <div className="text-center">
                <p className="text-xs font-bold text-slate-500">
                  Nuevo stock: <span className={`font-black ${config.textColor}`}>
                    {type === 'IN' 
                      ? selectedItem.currentStock + Number(quantity)
                      : selectedItem.currentStock - Number(quantity)
                    } unidades
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Razón/Motivo */}
          <div className="space-y-2">
            <label className="flex justify-between items-center px-1">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Razón o Motivo</span>
              <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded">Opcional</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={type === 'IN' ? 'Ej: Compra de proveedor, devolución, etc.' : 'Ej: Venta, retiro para uso interno, etc.'}
              rows={3}
              className="w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-0 transition-all font-bold text-slate-800 placeholder-slate-400 shadow-sm resize-none"
            />
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t-2 border-slate-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{ backgroundColor: 'white', color: '#64748b', borderColor: '#e2e8f0' }}
              className="flex-1 py-4 border-2 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-50 transition-all shadow-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !itemId || !quantity || (type === 'OUT' && selectedItem?.currentStock === 0)}
              className={`flex-1 py-4 ${config.buttonBg} text-white border-2 ${config.borderColor} rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl ${config.shadowColor} transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registrando...
                </>
              ) : (
                <>
                  {config.icon} Registrar {type === 'IN' ? 'Entrada' : 'Salida'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MovementForm;