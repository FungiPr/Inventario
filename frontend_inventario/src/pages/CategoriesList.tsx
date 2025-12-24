import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoriesService } from '../services/categories.service';
import type { Category } from '../types';

function CategoriesList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para el modal de crear/editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [modalName, setModalName] = useState('');
  const [modalDescription, setModalDescription] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoriesService.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error cargando categorías:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setModalName('');
    setModalDescription('');
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setModalName(category.name);
    setModalDescription(category.description || '');
    setModalError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setModalName('');
    setModalDescription('');
    setModalError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    if (!modalName.trim()) {
      setModalError('El nombre es obligatorio');
      return;
    }

    setModalLoading(true);

    try {
      const data = {
        name: modalName.trim(),
        description: modalDescription.trim() || undefined,
      };

      if (editingCategory) {
        await categoriesService.update(editingCategory.id, data);
      } else {
        await categoriesService.create(data);
      }

      await loadCategories();
      closeModal();
    } catch (err: any) {
      console.error('Error guardando categoría:', err);
      setModalError(err.response?.data?.message || 'Error al guardar la categoría');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`¿Eliminar la categoría "${name}"?\n\nAdvertencia: Esto puede afectar a los productos asociados.`)) {
      return;
    }

    try {
      await categoriesService.delete(id);
      setCategories(categories.filter(cat => cat.id !== id));
    } catch (err: any) {
      console.error('Error eliminando categoría:', err);
      alert(err.response?.data?.message || 'Error al eliminar la categoría');
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('electr') || n.includes('tech')) return '💻';
    if (n.includes('ropa') || n.includes('vest')) return '👕';
    if (n.includes('comida') || n.includes('aliment')) return '🍔';
    if (n.includes('libro') || n.includes('lectura')) return '📚';
    if (n.includes('deporte') || n.includes('fit')) return '⚽';
    if (n.includes('hogar') || n.includes('casa')) return '🏠';
    if (n.includes('juguete') || n.includes('niño')) return '🧸';
    if (n.includes('salud') || n.includes('medic')) return '💊';
    if (n.includes('oficina') || n.includes('escolar')) return '✏️';
    if (n.includes('jardin') || n.includes('planta')) return '🌱';
    return '📦';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-[999]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-purple-600 font-black tracking-widest text-xs uppercase">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#f8fafc] pb-20">
      {/* Fondo decorativo */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-500/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* NAVEGACIÓN */}
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
          <Link to="/dashboard" className="text-slate-400 hover:text-purple-600 transition-colors">
            Dashboard
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-purple-600">Categorías</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
              Categorías<span className="text-purple-600">.</span>
            </h1>
            <p className="text-slate-500 font-bold mt-1 uppercase text-xs tracking-widest">
              Organiza y clasifica tus productos
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-3 px-8 py-4 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 active:scale-95"
          >
            <svg className="w-5 h-5 stroke-white" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-white text-sm font-black uppercase tracking-widest">Nueva Categoría</span>
          </button>
        </div>

        {/* Barra de búsqueda */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-purple-500 transition-all font-bold text-slate-700 shadow-inner"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Estadística rápida */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl shadow-purple-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
                📦
              </div>
              <span className="text-[10px] font-black uppercase bg-white/20 px-2 py-1 rounded">Total</span>
            </div>
            <p className="text-4xl font-black">{categories.length}</p>
            <p className="text-[10px] font-bold opacity-80 uppercase mt-1">Categorías Activas</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-2xl">
                🔍
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase bg-slate-100 px-2 py-1 rounded">Filtradas</span>
            </div>
            <p className="text-4xl font-black text-slate-900">{filteredCategories.length}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Resultados</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-2xl">
                ✨
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase bg-slate-100 px-2 py-1 rounded">Status</span>
            </div>
            <p className="text-4xl font-black text-emerald-600">OK</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Sistema Activo</p>
          </div>
        </div>

        {/* Grid de Categorías */}
        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 hover:shadow-xl hover:border-purple-100 transition-all duration-300 group"
              >
                {/* Header de la card */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-purple-200 group-hover:scale-110 transition-transform">
                      {getCategoryIcon(category.name)}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight leading-tight">
                        {category.name}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        ID: {category.id}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Descripción */}
                {category.description ? (
                  <div className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100">
                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                      {category.description}
                    </p>
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100">
                    <p className="text-sm text-slate-400 italic">Sin descripción</p>
                  </div>
                )}

                {/* Fecha de creación */}
                <div className="flex items-center gap-2 mb-4 text-[10px] font-bold text-slate-400">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="uppercase tracking-wider">
                    {new Date(category.createdAt).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-2 border-t border-slate-100 pt-4">
                  <button
                    onClick={() => openEditModal(category)}
                    style={{ backgroundColor: 'white', color: '#7c3aed', borderColor: '#e9d5ff' }}
                    className="flex-1 px-4 py-3 rounded-xl border-2 hover:bg-purple-50 hover:border-purple-600 transition-all text-center font-black text-xs uppercase"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(category.id, category.name)}
                    style={{ backgroundColor: 'white', color: '#dc2626', borderColor: '#e2e8f0' }}
                    className="flex-1 px-4 py-3 rounded-xl border-2 hover:border-red-600 hover:bg-red-50 transition-all text-center font-black text-xs uppercase"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] p-20 text-center border border-slate-200 shadow-inner">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <p className="text-slate-400 font-black uppercase tracking-[0.2em] mb-4">
              {searchTerm ? 'No se encontraron categorías' : 'No hay categorías creadas'}
            </p>
            {searchTerm ? (
              <button 
                onClick={() => setSearchTerm('')}
                style={{ backgroundColor: 'white', color: '#7c3aed', borderColor: '#7c3aed' }}
                className="mt-2 px-10 py-4 border-2 rounded-2xl font-black text-xs uppercase transition-all hover:bg-purple-50"
              >
                Limpiar Búsqueda
              </button>
            ) : (
              <button 
                onClick={openCreateModal}
                style={{ backgroundColor: '#7c3aed', color: 'white', borderColor: '#7c3aed' }}
                className="mt-2 px-10 py-4 border-2 rounded-2xl font-black text-xs uppercase transition-all hover:bg-purple-700 shadow-lg shadow-purple-200"
              >
                Crear Primera Categoría
              </button>
            )}
          </div>
        )}
      </div>

      {/* MODAL DE CREAR/EDITAR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* Header del Modal */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-purple-200">
                    {editingCategory ? '✏️' : '✨'}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                      {editingCategory ? 'Editar' : 'Nueva'} Categoría
                    </h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {editingCategory ? `ID: ${editingCategory.id}` : 'Crear clasificación'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {modalError && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 font-bold text-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                    {modalError}
                  </div>
                )}

                {/* Nombre */}
                <div className="space-y-2">
                  <label className="flex justify-between items-center px-1">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Nombre</span>
                    <span className="text-[10px] font-black text-purple-600 uppercase bg-purple-50 px-2 py-0.5 rounded">Obligatorio</span>
                  </label>
                  <input
                    type="text"
                    value={modalName}
                    onChange={(e) => setModalName(e.target.value)}
                    placeholder="Ej: Electrónica, Ropa, Alimentos..."
                    className="w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-purple-500 focus:ring-0 transition-all font-bold text-slate-800 placeholder-slate-400 shadow-sm"
                    required
                    autoFocus
                  />
                </div>

                {/* Descripción */}
                <div className="space-y-2">
                  <label className="flex justify-between items-center px-1">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Descripción</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded">Opcional</span>
                  </label>
                  <textarea
                    value={modalDescription}
                    onChange={(e) => setModalDescription(e.target.value)}
                    placeholder="Describe brevemente esta categoría..."
                    rows={4}
                    className="w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-purple-500 focus:ring-0 transition-all font-bold text-slate-800 placeholder-slate-400 shadow-sm resize-none"
                  />
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-4 border-t-2 border-slate-100">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={modalLoading}
                    style={{ backgroundColor: 'white', color: '#64748b', borderColor: '#e2e8f0' }}
                    className="flex-1 py-4 border-2 rounded-2xl font-black uppercase tracking-tight text-sm hover:bg-slate-50 transition-all disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    style={{ backgroundColor: '#7c3aed', color: 'white', borderColor: '#7c3aed' }}
                    className="flex-1 py-4 border-2 rounded-2xl font-black uppercase tracking-tight text-sm shadow-xl shadow-purple-200 transition-all hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {modalLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Guardando...
                      </>
                    ) : (
                      <>
                        {editingCategory ? '💾 Guardar Cambios' : '✨ Crear Categoría'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoriesList;