import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { itemsService } from '../services/items.service';
import { stockMovementsService } from '../services/stock-movements.service';
import type { Item, StockMovement } from '../types';
import Card from '../components/ui/Card';

function ItemDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [item, setItem] = useState<Item | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados para filtros
  const [filterType, setFilterType] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [itemData, movementsData] = await Promise.all([
        itemsService.getOne(Number(id)),
        stockMovementsService.getByItem(Number(id)),
      ]);
      setItem(itemData);
      setMovements(movementsData);
    } catch (err: any) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar los datos del producto');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    if (!confirm(`¿Estás seguro de eliminar "${item.name}"? Esta acción no se puede deshacer.`)) return;
    
    try {
      await itemsService.delete(item.id);
      navigate('/items');
    } catch (err: any) {
      console.error('Error eliminando producto:', err);
      alert(err.response?.data?.message || 'Error al eliminar el producto');
    }
  };

  // Filtrar movimientos
  const filteredMovements = movements.filter(movement => {
    const matchesType = filterType === 'ALL' || movement.type === filterType;
    const matchesSearch = 
      movement.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.user?.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.user?.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Calcular estadísticas de movimientos
  const movementStats = {
    totalEntries: movements.filter(m => m.type === 'IN').reduce((sum, m) => sum + m.quantity, 0),
    totalExits: movements.filter(m => m.type === 'OUT').reduce((sum, m) => sum + m.quantity, 0),
    entriesCount: movements.filter(m => m.type === 'IN').length,
    exitsCount: movements.filter(m => m.type === 'OUT').length,
  };

  const getStockStatus = () => {
    if (!item) return { color: 'slate', text: 'Cargando', badge: 'bg-slate-100 text-slate-600' };
    
    if (item.currentStock === 0) {
      return { 
        color: 'red', 
        text: 'Agotado', 
        badge: 'bg-red-50 text-red-600 border-red-100',
        icon: '⚠️'
      };
    }
    if (item.currentStock <= item.minStock) {
      return { 
        color: 'amber', 
        text: 'Bajo Stock', 
        badge: 'bg-amber-50 text-amber-600 border-amber-100',
        icon: '⚡'
      };
    }
    return { 
      color: 'emerald', 
      text: 'Disponible', 
      badge: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      icon: '✓'
    };
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-[999]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-indigo-600 font-black tracking-widest text-xs uppercase">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-red-600 font-bold mb-4">{error || 'Producto no encontrado'}</p>
          <Link
            to="/items"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 font-bold"
          >
            Volver al Inventario
          </Link>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus();

  return (
    <div className="relative min-h-screen bg-[#f8fafc] pb-20">
      {/* Fondo decorativo */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* NAVEGACIÓN */}
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
          <Link to="/dashboard" className="text-slate-400 hover:text-indigo-600 transition-colors">
            Dashboard
          </Link>
          <span className="text-slate-300">/</span>
          <Link to="/items" className="text-slate-400 hover:text-indigo-600 transition-colors">
            Inventario
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-indigo-600">Detalle</span>
        </nav>

        {/* HEADER CON INFO DEL PRODUCTO */}
        <Card className="p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            
            {/* Info Principal */}
            <div className="flex-1">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-indigo-200">
                  {item.name[0]}
                </div>
                <div className="flex-1">
                  <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                    {item.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase border ${stockStatus.badge}`}>
                      {stockStatus.icon} {stockStatus.text}
                    </span>
                    {item.sku && (
                      <span className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-black uppercase border border-slate-200">
                        SKU: {item.sku}
                      </span>
                    )}
                    {item.category && (
                      <span className="px-4 py-1.5 bg-purple-50 text-purple-600 rounded-full text-xs font-black uppercase border border-purple-100">
                        📦 {item.category.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {item.description && (
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Descripción</p>
                  <p className="text-slate-700 leading-relaxed">{item.description}</p>
                </div>
              )}
            </div>

            {/* Estadísticas y Acciones */}
            <div className="lg:w-80 space-y-4">
              {/* Stock Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-5 text-white shadow-xl shadow-indigo-200">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Stock Actual</p>
                  <p className="text-4xl font-black">{item.currentStock}</p>
                  <p className="text-[9px] font-bold opacity-70 uppercase mt-1">Unidades</p>
                </div>
                
                <div className="bg-slate-100 rounded-2xl p-5 border border-slate-200">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Stock Mínimo</p>
                  <p className="text-4xl font-black text-slate-900">{item.minStock}</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">Requerido</p>
                </div>
              </div>

              {item.price && (
                <div className="bg-white rounded-2xl p-6 border-2 border-slate-200">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Precio Unitario</p>
                  <p className="text-3xl font-black text-slate-900">${item.price.toLocaleString()}</p>
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Valor Total en Stock</p>
                    <p className="text-xl font-black text-indigo-600">${(item.price * item.currentStock).toLocaleString()}</p>
                  </div>
                </div>
              )}

              {/* Botones de Acción */}
              <div className="space-y-2">
                <Link
                  to={`/items/${item.id}/edit`}
                  style={{ backgroundColor: '#4f46e5', color: 'white', borderColor: '#4f46e5' }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-sm uppercase tracking-tight transition-all border-2 hover:opacity-90"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar Producto
                </Link>
                
                <button
                  onClick={handleDelete}
                  style={{ backgroundColor: 'white', color: '#dc2626', borderColor: '#e2e8f0' }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-sm uppercase tracking-tight transition-all border-2 hover:bg-red-50 hover:border-red-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* ESTADÍSTICAS DE MOVIMIENTOS */}
        <Card className="p-8 mb-8">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
            <span className="w-12 h-[1px] bg-slate-200"></span>
            Estadísticas de Movimientos
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-2xl">
                  ⬇️
                </div>
                <span className="text-[10px] font-black text-emerald-600 uppercase bg-emerald-100 px-2 py-1 rounded">Entradas</span>
              </div>
              <p className="text-3xl font-black text-emerald-700">{movementStats.totalEntries}</p>
              <p className="text-[10px] font-bold text-emerald-600 uppercase mt-1">{movementStats.entriesCount} movimientos</p>
            </div>

            <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-2xl">
                  ⬆️
                </div>
                <span className="text-[10px] font-black text-red-600 uppercase bg-red-100 px-2 py-1 rounded">Salidas</span>
              </div>
              <p className="text-3xl font-black text-red-700">{movementStats.totalExits}</p>
              <p className="text-[10px] font-bold text-red-600 uppercase mt-1">{movementStats.exitsCount} movimientos</p>
            </div>

            <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-2xl">
                  📊
                </div>
                <span className="text-[10px] font-black text-indigo-600 uppercase bg-indigo-100 px-2 py-1 rounded">Balance</span>
              </div>
              <p className={`text-3xl font-black ${movementStats.totalEntries - movementStats.totalExits >= 0 ? 'text-indigo-700' : 'text-orange-600'}`}>
                {movementStats.totalEntries - movementStats.totalExits > 0 ? '+' : ''}{movementStats.totalEntries - movementStats.totalExits}
              </p>
              <p className="text-[10px] font-bold text-indigo-600 uppercase mt-1">Neto</p>
            </div>

            <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">
                  🔄
                </div>
                <span className="text-[10px] font-black text-purple-600 uppercase bg-purple-100 px-2 py-1 rounded">Total</span>
              </div>
              <p className="text-3xl font-black text-purple-700">{movements.length}</p>
              <p className="text-[10px] font-bold text-purple-600 uppercase mt-1">Registros</p>
            </div>
          </div>
        </Card>

        {/* HISTORIAL DE MOVIMIENTOS */}
        <Card className="p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <h2 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter underline decoration-indigo-500/30 underline-offset-8">
              Historial
            </h2>
            
            <Link
              to={`/movements/new?itemId=${item.id}`}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm font-black uppercase tracking-tight">Nuevo Movimiento</span>
            </Link>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Buscar</label>
              <input
                type="text"
                placeholder="Razón o usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Movimiento</label>
              <div className="flex gap-2">
                {(['ALL', 'IN', 'OUT'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`flex-1 py-3 rounded-2xl font-black text-xs uppercase transition-all border-2 ${
                      filterType === type
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-600'
                    }`}
                  >
                    {type === 'ALL' ? 'Todos' : type === 'IN' ? 'Entradas' : 'Salidas'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Lista de Movimientos */}
          <div className="space-y-3">
            {filteredMovements.length > 0 ? (
              filteredMovements.map((movement) => (
                <div
                  key={movement.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-lg hover:border-indigo-100 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    
                    {/* Tipo de Movimiento */}
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${
                      movement.type === 'IN' 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : 'bg-red-50 text-red-600'
                    }`}>
                      {movement.type === 'IN' ? '⬇️' : '⬆️'}
                    </div>

                    {/* Info del Movimiento */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          movement.type === 'IN'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-red-50 text-red-600 border border-red-100'
                        }`}>
                          {movement.type === 'IN' ? 'Entrada' : 'Salida'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {new Date(movement.createdAt).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      
                      {movement.reason && (
                        <p className="text-sm text-slate-700 font-medium">
                          <span className="text-slate-400 font-bold">Razón:</span> {movement.reason}
                        </p>
                      )}
                      
                      {movement.user && (
                        <p className="text-xs text-slate-500 font-bold">
                          👤 {movement.user.displayName || movement.user.email}
                        </p>
                      )}
                    </div>

                    {/* Cantidad */}
                    <div className={`text-center px-6 py-3 rounded-2xl border-2 ${
                      movement.type === 'IN'
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <p className={`text-3xl font-black ${
                        movement.type === 'IN' ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {movement.type === 'IN' ? '+' : '-'}{movement.quantity}
                      </p>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        Unidades
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-slate-50 rounded-3xl p-16 text-center border border-slate-200">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-slate-400 font-black uppercase tracking-widest text-sm">
                  No hay movimientos registrados
                </p>
                <p className="text-slate-300 text-xs mt-2">
                  {searchTerm || filterType !== 'ALL' ? 'Intenta cambiar los filtros' : 'Aún no se han registrado movimientos para este producto'}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default ItemDetail;