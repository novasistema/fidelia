import React, { useState } from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { ClipboardList, Plus, CheckCircle, Zap } from 'lucide-react';

export const AdminSurveys: React.FC = () => {
  const { surveys, createSurvey } = useLoyalty();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rewardPoints, setRewardPoints] = useState(200);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    createSurvey({
      title,
      description,
      rewardPoints,
      isActive: true,
      questions: [
        { id: 'q1', question: '¿Cómo calificarías la atención recibida en nuestro local?', type: 'rating' },
        { id: 'q2', question: '¿Qué producto o servicio te gustaría que incorporemos?', type: 'text' },
        { id: 'q3', question: '¿Con qué frecuencia nos visitas?', type: 'multiple_choice', options: ['Varias veces por semana', 'Una vez por semana', 'Ocasionalmente'] }
      ]
    });

    setTitle('');
    setDescription('');
    setIsCreating(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <span className="px-3 py-1 bg-sky-50 text-sky-700 font-bold text-[10px] uppercase rounded-full border border-sky-100">
            Insights de Consumo
          </span>
          <h1 className="text-2xl font-black text-slate-800 mt-1">
            Gestión de Encuestas
          </h1>
          <p className="text-xs text-slate-500">
            Crea encuestas ilimitadas que recompensan a tus clientes con puntos al completarlas.
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-1"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Encuesta</span>
        </button>
      </div>

      <div className="space-y-4">
        {surveys.map(survey => (
          <div key={survey.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 bg-sky-100 text-sky-800 text-[10px] font-black rounded-full inline-flex items-center space-x-1">
                  <Zap className="w-3 h-3 fill-sky-600" />
                  <span>Recompensa: {survey.rewardPoints} pts</span>
                </span>
                <h3 className="font-extrabold text-slate-800 text-base">
                  {survey.title}
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {survey.completedCustomerIds.length} clientes respondieron
              </span>
            </div>

            <p className="text-xs text-slate-500">
              {survey.description}
            </p>

            <div className="pt-2 border-t border-slate-100 text-xs text-slate-400">
              Contiene {survey.questions.length} preguntas interactivas.
            </div>
          </div>
        ))}
      </div>

      {isCreating && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-extrabold text-slate-800 text-lg">
              Nueva Encuesta de Opinión
            </h3>

            <form onSubmit={handleCreateSurvey} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Título de la Encuesta *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ej. ¿Cómo fue tu experiencia en el local?"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descripción</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Respondé 3 breves preguntas y sumá puntos gratis."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Puntos de Recompensa</label>
                <input
                  type="number"
                  value={rewardPoints}
                  onChange={e => setRewardPoints(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-sky-600 text-white font-bold rounded-xl text-xs shadow-md"
                >
                  Crear Encuesta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
